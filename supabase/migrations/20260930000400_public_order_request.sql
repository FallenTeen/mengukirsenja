-- Mengukir Senja — Phase 2 public request intake.
--
-- Phase 1 deliberately gave anon/authenticated no INSERT policy on customers,
-- orders and order_items. The public booking forms still need to create
-- requests, so intake goes through one narrow, validated, SECURITY DEFINER
-- function instead of opening the tables up.
--
-- Security notes:
--   * `admin_manual` can never be submitted from the public site.
--   * `admin_note`, `status`, `total_estimate` and `created_by_user_id` are
--     never accepted from the client. The browser only names the event and
--     the package it is interested in.
--   * The catalog item is resolved server-side and must be active, so a client
--     cannot attach an arbitrary or deactivated package.

create or replace function public.submit_order_request(
  p_name text,
  p_email text,
  p_phone text,
  p_event_date date,
  p_venue_name text default null,
  p_venue_address text default null,
  p_customer_note text default null,
  p_source public.order_source default 'web_custom',
  p_catalog_item_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_venue_name text := nullif(btrim(coalesce(p_venue_name, '')), '');
  v_venue_address text := nullif(btrim(coalesce(p_venue_address, '')), '');
  v_customer_note text := nullif(btrim(coalesce(p_customer_note, '')), '');
  v_customer_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_item_id uuid;
  v_item_service_id uuid;
  v_item_partner_id uuid;
  v_item_name text;
  v_item_price numeric(14, 2);
begin
  -- ---- source sanity -------------------------------------------------------
  if p_source not in ('web_custom', 'web_catalog') then
    raise exception 'Permintaan tidak valid';
  end if;

  if p_source = 'web_catalog' and p_catalog_item_id is null then
    raise exception 'Paket wajib dipilih';
  end if;

  if p_source = 'web_custom' and p_catalog_item_id is not null then
    raise exception 'Permintaan kustom tidak boleh menyertakan paket katalog';
  end if;

  -- ---- field validation ----------------------------------------------------
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Nama tidak valid';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Email tidak valid';
  end if;

  if char_length(v_phone) < 6 or char_length(v_phone) > 32 then
    raise exception 'Nomor WhatsApp tidak valid';
  end if;

  if p_event_date is null then
    raise exception 'Tanggal acara wajib diisi';
  end if;

  if p_event_date < current_date then
    raise exception 'Tanggal acara sudah lewat';
  end if;

  if char_length(coalesce(v_venue_name, '')) > 160 then
    raise exception 'Nama lokasi terlalu panjang';
  end if;

  if char_length(coalesce(v_venue_address, '')) > 400 then
    raise exception 'Alamat terlalu panjang';
  end if;

  if char_length(coalesce(v_customer_note, '')) > 4000 then
    raise exception 'Pesan terlalu panjang';
  end if;

  -- ---- resolve catalog item server-side ------------------------------------
  if p_catalog_item_id is not null then
    select ci.id, ci.service_id, ci.partner_id, ci.name, ci.price
    into v_item_id, v_item_service_id, v_item_partner_id, v_item_name, v_item_price
    from public.catalog_items ci
    where ci.id = p_catalog_item_id
      and ci.is_active;

    if not found then
      raise exception 'Paket tidak tersedia';
    end if;
  end if;

  -- ---- find or create the customer -----------------------------------------
  -- Prefer a record that is already linked to a portal account so the request
  -- shows up in the customer's portal as soon as they sign in.
  select c.id
  into v_customer_id
  from public.customers c
  where lower(c.email) = v_email
  order by (c.auth_user_id is not null) desc, c.created_at
  limit 1;

  if v_customer_id is null then
    insert into public.customers (name, email, phone)
    values (v_name, v_email, v_phone)
    returning id into v_customer_id;
  else
    update public.customers c
    set name = v_name,
        phone = v_phone,
        updated_at = now()
    where c.id = v_customer_id;
  end if;

  -- ---- create the order ----------------------------------------------------
  insert into public.orders (
    customer_id,
    source,
    status,
    event_date,
    venue_name,
    venue_address,
    customer_note
  )
  values (
    v_customer_id,
    p_source,
    'pending_admin_review',
    p_event_date,
    v_venue_name,
    v_venue_address,
    v_customer_note
  )
  returning id, order_code into v_order_id, v_order_code;

  -- ---- attach the requested package ----------------------------------------
  if v_item_id is not null then
    insert into public.order_items (
      order_id,
      catalog_item_id,
      service_id,
      partner_id,
      name,
      quantity,
      unit_price,
      subtotal,
      is_custom
    )
    values (
      v_order_id,
      v_item_id,
      v_item_service_id,
      v_item_partner_id,
      v_item_name,
      1,
      coalesce(v_item_price, 0),
      coalesce(v_item_price, 0),
      false
    );

    update public.orders o
    set total_estimate = coalesce(v_item_price, 0)
    where o.id = v_order_id;
  end if;

  return v_order_code;
end;
$$;

revoke execute on function public.submit_order_request(
  text, text, text, date, text, text, text, public.order_source, uuid
) from public;

grant execute on function public.submit_order_request(
  text, text, text, date, text, text, text, public.order_source, uuid
) to anon, authenticated;
