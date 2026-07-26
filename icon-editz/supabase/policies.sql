-- Basic RLS policies for Icon Editz
-- Run after schema.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

alter table profiles enable row level security;
drop policy if exists "Profiles - owner only" on profiles;
drop policy if exists "Profiles - admin read" on profiles;
create policy "Profiles - owner only" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Profiles - admin read" on profiles
  for select using (public.is_admin());

alter table products enable row level security;
drop policy if exists "Products - public read" on products;
drop policy if exists "Products - admin modify" on products;
drop policy if exists "Products - admin insert" on products;
drop policy if exists "Products - admin update" on products;
drop policy if exists "Products - admin delete" on products;
create policy "Products - public read" on products
  for select using (true);
create policy "Products - admin insert" on products
  for insert with check (public.is_admin());
create policy "Products - admin update" on products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Products - admin delete" on products
  for delete using (public.is_admin());

alter table categories enable row level security;
drop policy if exists "Categories - public read" on categories;
drop policy if exists "Categories - admin manage" on categories;
create policy "Categories - public read" on categories
  for select using (true);
create policy "Categories - admin manage" on categories
  for all using (public.is_admin()) with check (public.is_admin());

alter table orders enable row level security;
drop policy if exists "Orders - owner" on orders;
drop policy if exists "Orders - insert authenticated" on orders;
drop policy if exists "Orders - customer insert" on orders;
drop policy if exists "Orders - admin read" on orders;
drop policy if exists "Orders - admin update" on orders;
create policy "Orders - owner" on orders
  for select using (auth.uid() = user_id);
create policy "Orders - customer insert" on orders
  for insert with check (true);
create policy "Orders - admin read" on orders
  for select using (public.is_admin());
create policy "Orders - admin update" on orders
  for update using (public.is_admin()) with check (public.is_admin());

alter table downloads enable row level security;
drop policy if exists "Downloads - owner" on downloads;
drop policy if exists "Downloads - admin manage" on downloads;
create policy "Downloads - owner" on downloads
  for select using (auth.uid() = user_id);
create policy "Downloads - admin manage" on downloads
  for all using (public.is_admin()) with check (public.is_admin());

alter table wishlist enable row level security;
drop policy if exists "Wishlist - owner" on wishlist;
create policy "Wishlist - owner" on wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table reviews enable row level security;
drop policy if exists "Reviews - public read" on reviews;
drop policy if exists "Reviews - author insert" on reviews;
drop policy if exists "Reviews - author update" on reviews;
drop policy if exists "Reviews - author delete" on reviews;
drop policy if exists "Reviews - admin manage" on reviews;
create policy "Reviews - public read" on reviews
  for select using (true);
create policy "Reviews - author insert" on reviews
  for insert with check (auth.uid() = user_id);
create policy "Reviews - author update" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Reviews - author delete" on reviews
  for delete using (auth.uid() = user_id);
create policy "Reviews - admin manage" on reviews
  for all using (public.is_admin()) with check (public.is_admin());
