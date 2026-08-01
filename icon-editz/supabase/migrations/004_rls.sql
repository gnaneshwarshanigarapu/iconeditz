-- RLS is enabled before any policy is created.  Policy names are replaced intentionally to converge legacy projects.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or exists (select 1 from public.admins where user_id = auth.uid() and status = 'active' and deleted_at is null);
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','r2_buckets','r2_objects','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','hire_requests','footer_content','cta_content','legal_pages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_manage on public.%I', t);
    execute format('create policy admin_manage on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['page_content','website_sections','categories','services','projects','testimonials','media_library','product_images','product_gallery'] loop
    execute format('drop policy if exists public_read_published on public.%I', t);
    execute format('create policy public_read_published on public.%I for select to anon, authenticated using (status = ''published'' and deleted_at is null)', t);
  end loop;
end $$;
drop policy if exists public_read_products on public.products;
create policy public_read_products on public.products for select to anon, authenticated using (published and status = 'published' and deleted_at is null);
drop policy if exists public_read_footer on public.footer_content;
create policy public_read_footer on public.footer_content for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists public_read_cta on public.cta_content;
create policy public_read_cta on public.cta_content for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists public_read_legal on public.legal_pages;
create policy public_read_legal on public.legal_pages for select to anon, authenticated using (published and status = 'published' and deleted_at is null);
drop policy if exists public_subscribe on public.newsletter_subscribers;
create policy public_subscribe on public.newsletter_subscribers for insert to anon, authenticated with check (status = 'active');
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists admins_read_own on public.admins;
create policy admins_read_own on public.admins for select to authenticated using (user_id = auth.uid() and status = 'active' and deleted_at is null);
