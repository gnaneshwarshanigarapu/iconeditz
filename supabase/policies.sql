-- Basic RLS policies for Icon Editz
-- Enable RLS on tables where appropriate

alter table profiles enable row level security;
create policy "Profiles - owner only" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

alter table products enable row level security;
-- Public read, only admin (role check) can insert/update/delete
create policy "Products - public read" on products
  for select using (true);

create policy "Products - admin modify" on products
  for insert, update, delete using (auth.role() = 'authenticated' and current_setting('is_admin', true) = 'true');

alter table orders enable row level security;
create policy "Orders - owner" on orders
  for select using (auth.uid() = user_id);
create policy "Orders - insert authenticated" on orders
  for insert using (auth.uid() is not null) with check (auth.uid() = user_id);

alter table downloads enable row level security;
create policy "Downloads - owner" on downloads
  for select using (auth.uid() = user_id);

alter table wishlist enable row level security;
create policy "Wishlist - owner" on wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notes: replace `current_setting('is_admin')` approach with a proper admin claim in production.
