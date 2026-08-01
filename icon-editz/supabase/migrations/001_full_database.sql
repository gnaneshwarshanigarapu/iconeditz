-- ICON EDITZ: complete, idempotent Supabase bootstrap.
-- Run this one file in the Supabase SQL editor for a new project.
create extension if not exists pgcrypto;
-- is_admin is defined before its table so SQL function body validation is deferred.
set check_function_bodies = off;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or exists (select 1 from public.admins a where a.user_id = auth.uid() and a.status = 'active' and a.deleted_at is null);
$$;

-- Identity and CMS
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, display_name text, avatar_url text, phone text, location text, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.admins (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, role text not null default 'admin', status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.settings (id uuid primary key default gen_random_uuid(), key text not null unique, value jsonb not null default '{}'::jsonb, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.page_content (id uuid primary key default gen_random_uuid(), page text not null, section text not null, content jsonb not null default '{}'::jsonb, status text not null default 'draft', sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, unique(page, section));
create table if not exists public.website_sections (id uuid primary key default gen_random_uuid(), page text not null, section_key text not null, title text, content jsonb not null default '{}'::jsonb, status text not null default 'draft', sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, unique(page, section_key));
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.products (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, category text, category_id uuid references public.categories(id) on delete set null, description text, price numeric(12,2) not null default 0, discount_price numeric(12,2), stock integer, thumbnail_path text, demo_video text, screenshots jsonb not null default '[]'::jsonb, features jsonb not null default '[]'::jsonb, tags text[] not null default '{}', published boolean not null default false, status text not null default 'draft', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, url text not null, alt_text text, sort_order integer not null default 0, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.product_gallery (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, media_id uuid, image_url text not null, sort_order integer not null default 0, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), user_id uuid unique references auth.users(id) on delete set null, name text, email text unique, phone text, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), order_id text not null unique default gen_random_uuid()::text, customer_id uuid references public.customers(id) on delete set null, user_id uuid references auth.users(id) on delete set null, product_id uuid references public.products(id) on delete set null, product_name text, customer_name text, customer_email text, amount numeric(12,2) not null default 0, payment_status text not null default 'pending', status text not null default 'pending', razorpay_payment_id text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, title text not null, quantity integer not null default 1 check (quantity > 0), unit_price numeric(12,2) not null default 0, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.downloads (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, product_id uuid references public.products(id) on delete set null, r2_object_id uuid, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
-- Cloudflare R2 is external; these tables provide durable object/bucket metadata.
create table if not exists public.r2_buckets (id uuid primary key default gen_random_uuid(), bucket_name text not null unique, public_base_url text, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.r2_objects (id uuid primary key default gen_random_uuid(), bucket_id uuid not null references public.r2_buckets(id) on delete cascade, object_key text not null, public_url text, mime_type text, size_bytes bigint, etag text, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, unique(bucket_id, object_key));
create table if not exists public.media_library (id uuid primary key default gen_random_uuid(), name text not null, url text not null, storage_key text, r2_object_id uuid references public.r2_objects(id) on delete set null, mime_type text, folder text not null default 'images', size_bytes bigint, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.services (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, status text not null default 'published', sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, project_url text, status text not null default 'published', sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.testimonials (id uuid primary key default gen_random_uuid(), name text not null, role text, quote text not null, avatar_url text, rating integer check (rating between 1 and 5), status text not null default 'published', sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.coupons (id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null default 'percentage', discount_value numeric(12,2) not null default 0, usage_limit integer, usage_count integer not null default 0, expires_at timestamptz, status text not null default 'draft', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.analytics (id uuid primary key default gen_random_uuid(), event_name text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}'::jsonb, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.enquiries (id uuid primary key default gen_random_uuid(), client_name text not null, email text not null, phone text, message text, status text not null default 'pending', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text not null unique, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.activity_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null, action text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}'::jsonb, status text not null default 'active', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
-- Existing application tables retained in the one bootstrap.
create table if not exists public.hire_requests (id uuid primary key default gen_random_uuid(), client_name text not null, email text not null, phone text, company text, project_type text, budget text, deadline date, location text, service text, message text, reference_link text, preferred_contact text, attachments jsonb not null default '[]'::jsonb, status text not null default 'pending', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.footer_content (id boolean primary key default true check (id), content jsonb not null default '{}'::jsonb, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.cta_content (id boolean primary key default true check (id), content jsonb not null default '{}'::jsonb, status text not null default 'published', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.legal_pages (id uuid primary key default gen_random_uuid(), title text not null, content text not null default '', seo_title text, seo_description text, slug text not null unique, published boolean not null default false, status text not null default 'draft', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
set check_function_bodies = on;

-- Make a partially initialized project converge to the schema above.
do $$ declare t text; begin
  foreach t in array array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','r2_buckets','r2_objects','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','hire_requests','footer_content','cta_content','legal_pages'] loop
    execute format('alter table public.%I add column if not exists status text not null default ''active''', t);
    execute format('alter table public.%I add column if not exists created_at timestamptz not null default now()', t);
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', t);
    execute format('alter table public.%I add column if not exists created_by uuid references auth.users(id) on delete set null', t);
    execute format('alter table public.%I add column if not exists deleted_at timestamptz', t);
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create index if not exists products_status_idx on public.products(status) where deleted_at is null;
create index if not exists products_category_idx on public.products(category_id) where deleted_at is null;
create index if not exists product_images_product_idx on public.product_images(product_id, sort_order) where deleted_at is null;
create index if not exists order_items_order_idx on public.order_items(order_id) where deleted_at is null;
create index if not exists orders_customer_idx on public.orders(customer_id, created_at desc) where deleted_at is null;
create index if not exists page_content_page_order_idx on public.page_content(page, sort_order) where deleted_at is null;
create index if not exists website_sections_page_order_idx on public.website_sections(page, sort_order) where deleted_at is null;
create index if not exists r2_objects_bucket_key_idx on public.r2_objects(bucket_id, object_key) where deleted_at is null;
create index if not exists activity_logs_actor_created_idx on public.activity_logs(actor_id, created_at desc);

-- RLS: anonymous visitors can read published public content; privileged work is admin-only.
do $$ declare t text; begin
  foreach t in array array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','r2_buckets','r2_objects','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','hire_requests','footer_content','cta_content','legal_pages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_manage on public.%I', t);
    execute format('create policy admin_manage on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;
do $$ declare t text; begin
  foreach t in array array['page_content','website_sections','categories','services','projects','testimonials','media_library','product_images','product_gallery'] loop
    execute format('drop policy if exists public_read_published on public.%I', t);
    execute format('create policy public_read_published on public.%I for select to anon, authenticated using (status = ''published'' and deleted_at is null)', t);
  end loop;
end $$;
drop policy if exists public_read_products on public.products; create policy public_read_products on public.products for select to anon, authenticated using (published and status = 'published' and deleted_at is null);
drop policy if exists public_read_footer on public.footer_content; create policy public_read_footer on public.footer_content for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists public_read_cta on public.cta_content; create policy public_read_cta on public.cta_content for select to anon, authenticated using (status = 'published' and deleted_at is null);
drop policy if exists public_read_legal on public.legal_pages; create policy public_read_legal on public.legal_pages for select to anon, authenticated using (published and status = 'published' and deleted_at is null);
drop policy if exists public_subscribe on public.newsletter_subscribers; create policy public_subscribe on public.newsletter_subscribers for insert to anon, authenticated with check (status = 'active');
drop policy if exists profiles_read_own on public.profiles; create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles; create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles; create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists admins_read_own on public.admins; create policy admins_read_own on public.admins for select to authenticated using (user_id = auth.uid() and status = 'active' and deleted_at is null);

-- Seed records use stable natural keys and never overwrite an editor's work.
insert into public.settings(key,value,status) values ('site', '{"siteName":"ICON EDITZ","currency":"INR"}', 'published'), ('analytics','{}','published'), ('admin_setup','{"instructions":"Create an Auth user, then insert its id into public.admins."}','published') on conflict (key) do nothing;
insert into public.r2_buckets(bucket_name,status) values ('icon-editz-assets','active') on conflict (bucket_name) do nothing;
-- These are actual Supabase Storage buckets used by the deployed application.
insert into storage.buckets (id, name, public) values ('icon-editz-assets', 'icon-editz-assets', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('hire-request-files', 'hire-request-files', false) on conflict (id) do nothing;
drop policy if exists storage_admin_manage on storage.objects; create policy storage_admin_manage on storage.objects for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.footer_content(id,content,status) values (true,'{"brandName":"ICON EDITZ","description":"Creative editing, motion, and digital assets.","quickLinks":[],"socialLinks":{}}','published') on conflict (id) do nothing;
insert into public.cta_content(id,content,status) values (true,'{"heading":"Let us build your next creative project.","visible":true}','published') on conflict (id) do nothing;
insert into public.page_content(page,section,content,status,sort_order) values ('Homepage','Hero','{}','published',0),('Homepage','About','{}','published',1),('Homepage','Services','{}','published',2),('Homepage','Projects','{}','published',3),('Homepage','Store','{}','published',4),('Homepage','Footer','{}','published',5),('Homepage','CTA','{}','published',6),('Homepage','Legal','{}','published',7),('About','Hero','{}','published',0),('Services','Hero','{}','published',0),('Projects','Hero','{}','published',0),('Store','Hero','{}','published',0) on conflict (page,section) do nothing;
-- The first existing auth user is made the bootstrap admin; fresh projects create an auth user first.
insert into public.profiles(id,display_name,status) select id, coalesce(raw_user_meta_data->>'full_name', email), 'active' from auth.users order by created_at limit 1 on conflict (id) do nothing;
insert into public.admins(user_id,role,status) select id,'admin','active' from auth.users order by created_at limit 1 on conflict (user_id) do nothing;

create or replace function public.admin_health_check() returns jsonb language plpgsql security definer set search_path = public, storage as $$
declare required text[] := array['profiles','admins','settings','page_content','website_sections','products','product_images','product_gallery','categories','orders','order_items','customers','downloads','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','r2_buckets','r2_objects']; t text; c text; result jsonb := '{}'::jsonb; missing_tables jsonb := '[]'::jsonb; missing_columns jsonb := '[]'::jsonb; missing_policies jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  foreach t in array required loop
    if to_regclass('public.' || t) is null then missing_tables := missing_tables || jsonb_build_array(t);
    else
      foreach c in array array['created_at','updated_at','status','created_by','deleted_at'] loop
        if not exists (select 1 from information_schema.columns col where col.table_schema='public' and col.table_name=t and col.column_name=c) then missing_columns := missing_columns || jsonb_build_array(t || '.' || c); end if;
      end loop;
    end if;
    if not exists (select 1 from pg_policies p where p.schemaname='public' and p.tablename=t) then missing_policies := missing_policies || jsonb_build_array(t); end if;
  end loop;
  result := jsonb_build_object('missing_tables',missing_tables,'missing_columns',missing_columns,'missing_policies',missing_policies,'missing_storage_buckets',(select coalesce(jsonb_agg(bucket), '[]'::jsonb) from (select unnest(array['icon-editz-assets','hire-request-files']) as bucket) required_buckets where not exists (select 1 from storage.buckets b where b.id = required_buckets.bucket)),'missing_seed_data',case when exists(select 1 from public.page_content where page='Homepage') and exists(select 1 from public.settings where key='site') then '[]'::jsonb else jsonb_build_array('default CMS content or settings') end);
  return result;
end $$;
grant execute on function public.admin_health_check() to authenticated;
