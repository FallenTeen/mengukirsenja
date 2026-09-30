-- Mengukir Senja — Phase 1 foundation schema.
-- Eight application tables on top of Supabase's built-in auth.users.

create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'customer');
create type public.service_type as enum ('core', 'partner');
create type public.order_source as enum ('web_catalog', 'web_custom', 'admin_manual');
create type public.order_status as enum (
  'draft',
  'pending_admin_review',
  'awaiting_customer_confirmation',
  'confirmed',
  'completed',
  'cancelled'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create sequence public.order_code_seq start 1;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.profile_role not null default 'customer',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  -- NULL means the customer is a guest / offline customer without a portal account.
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.service_type not null default 'partner',
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_id uuid references public.services (id) on delete set null,
  phone text,
  email text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete restrict,
  partner_id uuid references public.partners (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(14, 2),
  price_label text,
  cover_image_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  event_date date,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default
    'MS-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.order_code_seq')::text, 4, '0'),
  customer_id uuid not null references public.customers (id) on delete restrict,
  source public.order_source not null,
  status public.order_status not null default 'draft',
  event_title text,
  event_date date,
  venue_name text,
  venue_address text,
  customer_note text,
  admin_note text,
  total_estimate numeric(14, 2) not null default 0 check (total_estimate >= 0),
  customer_confirmed_at timestamptz,
  admin_confirmed_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  -- NULL for fully custom line items; name/prices are a snapshot of the catalog.
  catalog_item_id uuid references public.catalog_items (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  partner_id uuid references public.partners (id) on delete set null,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price numeric(14, 2) not null default 0 check (unit_price >= 0),
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  is_custom boolean not null default false,
  customer_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_lower_email_idx on public.customers (lower(email));
create index partners_service_id_idx on public.partners (service_id);
create index catalog_items_service_id_idx on public.catalog_items (service_id);
create index catalog_items_active_sort_idx on public.catalog_items (is_active, sort_order);
create index portfolio_items_service_id_idx on public.portfolio_items (service_id);
create index portfolio_items_active_sort_idx on public.portfolio_items (is_active, sort_order);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_event_date_idx on public.orders (event_date);
create index orders_status_idx on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger partners_set_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
create trigger catalog_items_set_updated_at before update on public.catalog_items
  for each row execute function public.set_updated_at();
create trigger portfolio_items_set_updated_at before update on public.portfolio_items
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger order_items_set_updated_at before update on public.order_items
  for each row execute function public.set_updated_at();

-- Authorization helpers. SECURITY DEFINER keeps them usable inside RLS
-- policies without recursing through the policies of the tables they read.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id from public.customers c
  where c.auth_user_id = auth.uid()
  limit 1;
$$;

-- Every authenticated user gets a profile. The first admin is promoted manually:
--   update public.profiles set role = 'admin' where id = '<auth user id>';
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Links the signed-in auth user to a pre-existing customer record by matching
-- the email taken from the verified JWT. Takes no customer id on purpose: the
-- browser can never choose which customer record gets linked.
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
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    return null;
  end if;

  select c.id into v_customer_id
  from public.customers c
  where lower(c.email) = v_email
    and c.auth_user_id is null
  order by c.created_at
  limit 1;

  if v_customer_id is null then
    return null;
  end if;

  update public.customers c
  set auth_user_id = v_uid, updated_at = now()
  where c.id = v_customer_id;

  return v_customer_id;
end;
$$;
