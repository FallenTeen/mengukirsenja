-- Row Level Security. Frontend route guards are convenience only — every rule
-- here is the actual authorization boundary.

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.partners enable row level security;
alter table public.catalog_items enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public: active reference data only.
create policy "services are publicly readable when active"
  on public.services for select
  using (is_active);

create policy "catalog items are publicly readable when active"
  on public.catalog_items for select
  using (is_active);

create policy "portfolio items are publicly readable when active"
  on public.portfolio_items for select
  using (is_active);

-- Customers: own record and own orders only.
create policy "customers read own record"
  on public.customers for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "customers read own orders"
  on public.orders for select
  to authenticated
  using (customer_id = public.current_customer_id());

create policy "customers read own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = public.current_customer_id()
    )
  );

create policy "customers read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Admin: full operational management.
create policy "admins manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage customers"
  on public.customers for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage services"
  on public.services for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage partners"
  on public.partners for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage catalog items"
  on public.catalog_items for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage portfolio items"
  on public.portfolio_items for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage orders"
  on public.orders for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage order items"
  on public.order_items for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- RLS is row-level, so customer-facing reads go through a view that omits
-- admin_note. security_invoker keeps the orders RLS policies in force.
create view public.customer_orders
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
  updated_at
from public.orders;

grant select on public.customer_orders to authenticated;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.current_customer_id() from public, anon;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.current_customer_id() to authenticated, service_role;
grant execute on function public.link_customer_to_auth_user() to authenticated, service_role;

-- Storage: two public-read buckets, admin-only writes.
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true), ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "catalog images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'catalog');

create policy "portfolio images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio');

create policy "admins manage catalog images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'catalog' and public.is_admin())
  with check (bucket_id = 'catalog' and public.is_admin());

create policy "admins manage portfolio images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());
