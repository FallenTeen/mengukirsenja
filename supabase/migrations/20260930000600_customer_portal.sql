-- Phase 5: the customer portal. Three narrow SECURITY DEFINER functions, because
-- the browser is an untrusted client: anything a customer must be able to do has
-- to be impossible to widen in the app layer alone.
--
-- There is no separate Postgres role for admins, so "customer cannot do X" can
-- only be expressed inside a function that checks ownership itself.

-- 1. Guest record -> auth account --------------------------------------------
-- The Phase 1 version linked the oldest matching row. customers.email is NOT
-- unique, so with two guest records for the same address that silently bound the
-- account to the wrong person. An ambiguous match is now a no-op: the portal
-- shows an empty state and the studio merges the records by hand.
create or replace function public.link_customer_to_auth_user()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_customer_id uuid;
  v_matches uuid[];
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Already bound: an existing link always wins, whatever the email says now.
  select c.id into v_customer_id
  from public.customers c
  where c.auth_user_id = v_uid
  limit 1;

  if v_customer_id is not null then
    return v_customer_id;
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    return null;
  end if;

  select coalesce(array_agg(c.id), '{}'::uuid[]) into v_matches
  from public.customers c
  where lower(c.email) = v_email
    and c.auth_user_id is null;

  -- Zero matches (nobody booked yet) and several matches (duplicate guests) both
  -- return null rather than guessing.
  if array_length(v_matches, 1) is distinct from 1 then
    return null;
  end if;

  update public.customers c
  set auth_user_id = v_uid
  where c.id = v_matches[1];

  return v_matches[1];
end;
$$;

-- 2. Order confirmation ------------------------------------------------------
-- Customers hold no INSERT/UPDATE/DELETE policy on orders, and confirmation is
-- the one write they need. A function (instead of a broad UPDATE policy) keeps
-- status, total_estimate, item prices and customer_id untouchable from here.
--
-- Returns a machine-readable outcome instead of raising, so the UI can tell
-- "you already confirmed" apart from "somebody else's order".
create or replace function public.confirm_customer_order(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := public.current_customer_id();
  v_status public.order_status;
  v_confirmed_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if v_customer_id is null then
    return 'no_customer';
  end if;

  select o.status, o.customer_confirmed_at into v_status, v_confirmed_at
  from public.orders o
  where o.id = p_order_id
    and o.customer_id = v_customer_id
  for update;

  if not found then
    return 'not_found';
  end if;

  -- Idempotent: a second click is not a second confirmation.
  if v_confirmed_at is not null then
    return 'already_confirmed';
  end if;

  if v_status = 'cancelled' then
    return 'cancelled';
  end if;

  if v_status <> 'awaiting_customer_confirmation' then
    return 'not_awaiting';
  end if;

  update public.orders
  set status = 'confirmed', customer_confirmed_at = now()
  where id = p_order_id;

  return 'confirmed';
end;
$$;

-- 3. Profile -----------------------------------------------------------------
-- Name, phone, address only, on the caller's own row. Email is deliberately
-- immutable here: it is the key the guest -> account link is built on, so an
-- editable email would move the binding. `role` lives on profiles, which this
-- function never touches, and auth_user_id is pinned by the WHERE clause.
create or replace function public.update_customer_profile(
  p_name text,
  p_phone text,
  p_address text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.customers c
  set name = btrim(p_name),
      phone = nullif(btrim(coalesce(p_phone, '')), ''),
      address = nullif(btrim(coalesce(p_address, '')), '')
  where c.auth_user_id = auth.uid();

  if not found then
    raise exception 'Customer record not found';
  end if;
end;
$$;

revoke execute on function public.confirm_customer_order(uuid) from public, anon;
revoke execute on function public.update_customer_profile(text, text, text) from public, anon;

-- 4. Order item visibility, enforced in the database --------------------------
-- Phase 1 let a customer read every line of their own order and relied on the
-- query layer to add `customer_visible = true`. That is one missing filter away
-- from leaking a studio-internal line, so the rule now lives in RLS where it
-- cannot be forgotten. Admin keeps its own separate policy, and policies are
-- OR-ed, so this narrows customers only.
drop policy "customers read own order items" on public.order_items;

create policy "customers read own order items"
  on public.order_items for select
  to authenticated
  using (
    customer_visible
    and exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = public.current_customer_id()
    )
  );

grant execute on function public.link_customer_to_auth_user() to authenticated, service_role;
grant execute on function public.confirm_customer_order(uuid) to authenticated, service_role;
grant execute on function public.update_customer_profile(text, text, text) to authenticated, service_role;
