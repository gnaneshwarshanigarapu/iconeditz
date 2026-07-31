-- ICON EDITZ master bootstrap. Safe to run repeatedly on a brand-new or existing project.
create extension if not exists pgcrypto;

create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), user_id uuid unique references auth.users(id) on delete set null, name text, email text unique, phone text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.products (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, category text, category_id uuid references public.categories(id) on delete set null, description text, price numeric(12,2) not null default 0, discount_price numeric(12,2), stock integer, thumbnail_path text, demo_video text, features jsonb not null default '[]'::jsonb, tags text[] not null default '{}', published boolean not null default false, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), order_id text unique not null default gen_random_uuid()::text, customer_id uuid references public.customers(id) on delete set null, user_id uuid references auth.users(id) on delete set null, product_id uuid references public.products(id) on delete set null, product_name text, customer_name text, customer_email text, amount numeric(12,2) not null default 0, payment_status text not null default 'pending', status text not null default 'pending', razorpay_payment_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.media_library (id uuid primary key default gen_random_uuid(), name text not null, url text not null, storage_key text, mime_type text, folder text not null default 'images', size_bytes bigint, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.website_sections (id uuid primary key default gen_random_uuid(), page text not null, section_key text not null, title text, content jsonb not null default '{}'::jsonb, status text not null default 'draft', sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz, unique(page, section_key));
create table if not exists public.page_content (id uuid primary key default gen_random_uuid(), page text not null, section text not null, content jsonb not null default '{}'::jsonb, status text not null default 'draft', sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz, unique(page, section));
create table if not exists public.services (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, status text not null default 'published', sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, project_url text, status text not null default 'published', sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.analytics (id uuid primary key default gen_random_uuid(), event_name text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}'::jsonb, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.coupons (id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null default 'percentage', discount_value numeric(12,2) not null default 0, usage_limit integer, usage_count integer not null default 0, expires_at timestamptz, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.settings (id uuid primary key default gen_random_uuid(), key text not null unique, value jsonb not null default '{}'::jsonb, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.enquiries (id uuid primary key default gen_random_uuid(), client_name text not null, email text not null, phone text, message text, status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.hire_requests (id uuid primary key default gen_random_uuid(), client_name text not null, email text not null, phone text, company text, project_type text, budget text, deadline date, location text, service text, message text, reference_link text, preferred_contact text, attachments jsonb not null default '[]'::jsonb, status text not null default 'Pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text not null unique, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.downloads (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, product_id uuid references public.products(id) on delete set null, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, display_name text, avatar_url text, phone text, location text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz);
create table if not exists public.footer_content (id boolean primary key default true check (id), content jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.cta_content (id boolean primary key default true check (id), content jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.legal_pages (id uuid primary key default gen_random_uuid(), title text not null, content text not null default '', seo_title text, seo_description text, slug text not null unique, published boolean not null default false, updated_at timestamptz not null default now());

alter table if exists public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table if exists public.products add column if not exists status text not null default 'draft';
alter table if exists public.products add column if not exists deleted_at timestamptz;
alter table if exists public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table if exists public.orders add column if not exists status text not null default 'pending';
alter table if exists public.orders add column if not exists deleted_at timestamptz;
alter table if exists public.page_content add column if not exists status text not null default 'draft';
alter table if exists public.page_content add column if not exists sort_order integer not null default 0;
alter table if exists public.page_content add column if not exists created_at timestamptz not null default now();
alter table if exists public.page_content add column if not exists created_by uuid references auth.users(id);
alter table if exists public.page_content add column if not exists deleted_at timestamptz;
alter table if exists public.website_sections add column if not exists status text not null default 'draft';
alter table if exists public.website_sections add column if not exists sort_order integer not null default 0;
alter table if exists public.website_sections add column if not exists deleted_at timestamptz;

create index if not exists products_status_idx on public.products(status) where deleted_at is null;
create index if not exists products_category_idx on public.products(category_id) where deleted_at is null;
create index if not exists orders_customer_idx on public.orders(customer_id) where deleted_at is null;
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists page_content_page_order_idx on public.page_content(page, sort_order) where deleted_at is null;
create index if not exists website_sections_page_order_idx on public.website_sections(page, sort_order) where deleted_at is null;
create index if not exists media_library_folder_idx on public.media_library(folder) where deleted_at is null;
create index if not exists analytics_event_created_idx on public.analytics(event_name, created_at desc);

-- RLS: public reads only published content; admins manage all records.
do $$ declare t text; begin
  foreach t in array array['categories','customers','products','orders','media_library','website_sections','page_content','services','projects','analytics','coupons','settings','enquiries','hire_requests','newsletter_subscribers','downloads','profiles','footer_content','cta_content','legal_pages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin_manage" on public.%I', t);
    execute format('create policy "admin_manage" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;
drop policy if exists "public_read_page_content" on public.page_content; create policy "public_read_page_content" on public.page_content for select using (status = 'published' and deleted_at is null);
drop policy if exists "public_read_website_sections" on public.website_sections; create policy "public_read_website_sections" on public.website_sections for select using (status = 'published' and deleted_at is null);
drop policy if exists "public_read_products" on public.products; create policy "public_read_products" on public.products for select using (published = true and deleted_at is null);
drop policy if exists "public_read_services" on public.services; create policy "public_read_services" on public.services for select using (status = 'published' and deleted_at is null);
drop policy if exists "public_read_projects" on public.projects; create policy "public_read_projects" on public.projects for select using (status = 'published' and deleted_at is null);
drop policy if exists "public_read_footer" on public.footer_content; create policy "public_read_footer" on public.footer_content for select using (true);
drop policy if exists "public_read_cta" on public.cta_content; create policy "public_read_cta" on public.cta_content for select using (true);
drop policy if exists "public_read_legal" on public.legal_pages; create policy "public_read_legal" on public.legal_pages for select using (published = true);

insert into public.footer_content(id, content) values (true, '{"brandName":"ICON EDITZ","description":"Creative editing, motion, and digital assets.","quickLinks":[],"socialLinks":{}}') on conflict (id) do nothing;
insert into public.cta_content(id, content) values (true, '{"heading":"Let us build your next creative project.","visible":true}') on conflict (id) do nothing;
insert into public.page_content(page, section, content, status, sort_order) values
  ('Homepage','Hero','{}','published',0),('Homepage','Services','{}','draft',1),('Homepage','Featured Products','{}','draft',2),('Homepage','Featured Projects','{}','draft',3),('Homepage','Testimonials','{}','draft',4),('Homepage','CTA','{}','draft',5),('Homepage','FAQ','{}','draft',6),
  ('About','Hero','{}','draft',0),('Services','Hero','{}','draft',0),('Projects','Hero','{}','draft',0),('Store','Hero','{}','draft',0)
on conflict (page, section) do nothing;

create or replace function public.admin_health_check() returns jsonb language plpgsql security definer set search_path = public, storage as $$
declare tables text[] := array['page_content','website_sections','products','orders','categories','media_library','analytics','customers','services','projects','settings','coupons','enquiries']; result jsonb := '{}'::jsonb; t text;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  foreach t in array tables loop result := result || jsonb_build_object(t, to_regclass('public.' || t) is not null); end loop;
  result := result || jsonb_build_object('rls_policies', exists(select 1 from pg_policies where schemaname = 'public' and policyname = 'admin_manage'));
  result := result || jsonb_build_object('storage_buckets', exists(select 1 from storage.buckets));
  return result;
end $$;
grant execute on function public.admin_health_check() to authenticated;
