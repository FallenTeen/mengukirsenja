-- Mengukir Senja — Finalization. Three intake upgrades, one migration:
--
--   1. An event is not always one day: `event_end_date` joins `event_date`.
--   2. Guests can attach reference images, uploaded or linked.
--   3. "Services of interest" becomes a list, not a single hint.
--
-- Compatibility notes:
--   * All three columns are additive and nullable/defaulted, so no existing row is
--     rewritten. `event_end_date IS NULL` therefore means "one day", which is what
--     every order created before this migration is. New writes always fill it in
--     (`coalesce(p_event_end_date, p_event_date)`), so the column has exactly one
--     meaning going forward.
--   * The service names and reference images are resolved and validated *in the
--     database*, not in the browser. The client sends service slugs and raw JSON;
--     only names of active services and `http(s)` image URLs survive.
--   * `submit_order_request` cannot be replaced in place because its argument list
--     grows, so the old overload is dropped first. Nothing depends on it (no view,
--     no trigger), and it creates no data.

alter table public.orders add column if not exists event_end_date date;
alter table public.orders add column if not exists services_of_interest text[] not null default '{}';
alter table public.orders add column if not exists reference_images jsonb not null default '[]'::jsonb;

-- The calendar and the overlap warning both read ranges, not single dates.
create index if not exists orders_event_range_idx
  on public.orders (event_date, event_end_date)
  where status in ('pending_admin_review', 'awaiting_customer_confirmation', 'confirmed');

comment on column public.orders.event_end_date is
  'NULL means a one-day event (every order written before 2026-09-30). A range has the same value as event_date on the first day and the last day here.';
comment on column public.orders.services_of_interest is
  'Service names the guest asked about, resolved from slugs at intake. An intent list, not a booking: the booked lines live in order_items.';
comment on column public.orders.reference_images is
  'Array of {type: upload|link, value: string}. Upload values are object names inside the order-references bucket; link values are http(s) URLs.';

-- ---------------------------------------------------------------------------
-- Guest reference images.
--
-- Public bucket on purpose, with random object names. A private bucket would need
-- either a service-role key (this project has none) or a storage policy that joins
-- back to orders, which is impossible here: the order does not exist yet while the
-- guest is still filling in the form. Object names are UUID-based, so the URLs
-- cannot be enumerated. Admin-side deletes need the policy below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-references',
  'order-references',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "guests upload order reference images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'order-references');

create policy "admins manage order reference images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'order-references' and public.is_admin())
  with check (bucket_id = 'order-references' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Customer-facing view. The three new columns are appended, never inserted into
-- the middle: CREATE OR REPLACE VIEW can add columns at the end but refuses to
-- reorder, rename, or retype the existing ones.
create or replace view public.customer_orders
with (security_invoker = on) as
select
  id,
  order_code,
  customer_id,
  source,
  status,
  event_title,
  event_date,
  venue_name,
  venue_address,
  customer_note,
  total_estimate,
  customer_confirmed_at,
  admin_confirmed_at,
  created_at,
  updated_at,
  event_end_date,
  services_of_interest,
  reference_images
from public.orders;

grant select on public.customer_orders to authenticated;

-- ---------------------------------------------------------------------------
-- Intake, with the three new inputs.

drop function if exists public.submit_order_request(
  text, text, text, date, text, text, text, public.order_source, uuid
);

create function public.submit_order_request(
  p_name text,
  p_email text,
  p_phone text,
  p_event_date date,
  p_venue_name text default null,
  p_venue_address text default null,
  p_customer_note text default null,
  p_source public.order_source default 'web_custom',
  p_catalog_item_id uuid default null,
  p_event_end_date date default null,
  p_services_of_interest text[] default null,
  p_reference_images jsonb default null
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
  v_event_end_date date;
  v_services text[] := '{}';
  v_references jsonb := '[]'::jsonb;
  v_reference jsonb;
  v_reference_type text;
  v_reference_value text;
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

  -- One day is stored as end = start, so the column never has two meanings.
  v_event_end_date := coalesce(p_event_end_date, p_event_date);

  if v_event_end_date < p_event_date then
    raise exception 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai';
  end if;

  if v_event_end_date > p_event_date + 30 then
    raise exception 'Rentang acara maksimal 31 hari';
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

  -- ---- services of interest ------------------------------------------------
  -- The client sends slugs; only names of active services are stored, so the list
  -- cannot be used to invent a service the studio does not offer.
  if coalesce(array_length(p_services_of_interest, 1), 0) > 8 then
    raise exception 'Maksimal 8 layanan yang dipilih';
  end if;

  select coalesce(array_agg(picked.name order by picked.sort_order), '{}')
  into v_services
  from (
    select distinct s.name, s.sort_order
    from unnest(coalesce(p_services_of_interest, '{}'::text[])) as raw(slug)
    join public.services s on s.slug = raw.slug and s.is_active
  ) picked;

  -- ---- reference images ----------------------------------------------------
  if p_reference_images is not null and p_reference_images <> '[]'::jsonb then
    if jsonb_typeof(p_reference_images) <> 'array' then
      raise exception 'Referensi gambar tidak valid';
    end if;

    if jsonb_array_length(p_reference_images) > 8 then
      raise exception 'Maksimal 8 gambar referensi';
    end if;

    for v_reference in select value from jsonb_array_elements(p_reference_images) loop
      v_reference_type := v_reference ->> 'type';
      v_reference_value := btrim(coalesce(v_reference ->> 'value', ''));

      if v_reference_type = 'upload' then
        -- Object name only. Rejecting anything else keeps a guest from parking an
        -- arbitrary path in a bucket the studio shares.
        if v_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9_-]{7,80}\.(jpg|jpeg|png|webp|avif)$' then
          raise exception 'Referensi gambar tidak valid';
        end if;
      elsif v_reference_type = 'link' then
        -- The link is rendered as an href later, so the scheme check is a real
        -- guard against a javascript: URL, not decoration.
        if v_reference_value !~* '^https?://' or char_length(v_reference_value) > 500 then
          raise exception 'Tautan gambar tidak valid';
        end if;
      else
        raise exception 'Referensi gambar tidak valid';
      end if;

      v_references := v_references
        || jsonb_build_object('type', v_reference_type, 'value', v_reference_value);
    end loop;
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
    event_end_date,
    venue_name,
    venue_address,
    customer_note,
    services_of_interest,
    reference_images
  )
  values (
    v_customer_id,
    p_source,
    'pending_admin_review',
    p_event_date,
    v_event_end_date,
    v_venue_name,
    v_venue_address,
    v_customer_note,
    v_services,
    v_references
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
  text, text, text, date, text, text, text, public.order_source, uuid, date, text[], jsonb
) from public;

grant execute on function public.submit_order_request(
  text, text, text, date, text, text, text, public.order_source, uuid, date, text[], jsonb
) to anon, authenticated;
