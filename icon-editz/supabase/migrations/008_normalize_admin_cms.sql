-- Normalized admin CMS foundation. Existing data is preserved.
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.website_sections (
  id uuid primary key default gen_random_uuid(), page text not null, section_key text not null,
  title text, content jsonb not null default '{}'::jsonb, status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id), deleted_at timestamptz, unique(page, section_key)
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  media_id uuid, url text not null, alt_text text, sort_order integer not null default 0, status text not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz
);
create table if not exists public.product_gallery (like public.product_images including all);
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(), name text not null, url text not null, storage_key text, mime_type text,
  folder text not null default 'images', size_bytes bigint, width integer, height integer, status text not null default 'published',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(12,2) not null, minimum_purchase numeric(12,2), maximum_discount numeric(12,2), usage_limit integer,
  usage_count integer not null default 0, expires_at timestamptz, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz
);
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(), event_name text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), status text not null default 'published', deleted_at timestamptz
);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(), client_name text not null, email text not null, phone text, message text,
  status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid references auth.users(id), deleted_at timestamptz
);

alter table public.products add column if not exists sku text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists created_by uuid references auth.users(id);
alter table public.products add column if not exists status text not null default 'draft';
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists created_by uuid references auth.users(id);
alter table public.orders add column if not exists status text not null default 'pending';
alter table public.orders add column if not exists deleted_at timestamptz;
alter table public.categories add column if not exists updated_at timestamptz not null default now();
alter table public.categories add column if not exists created_by uuid references auth.users(id);
alter table public.categories add column if not exists status text not null default 'published';
alter table public.categories add column if not exists deleted_at timestamptz;

alter table public.website_sections enable row level security;
alter table public.product_images enable row level security;
alter table public.product_gallery enable row level security;
alter table public.media_library enable row level security;
alter table public.coupons enable row level security;
alter table public.analytics enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Website sections public read" on public.website_sections;
drop policy if exists "Website sections admin manage" on public.website_sections;
drop policy if exists "Media library admin manage" on public.media_library;
drop policy if exists "Coupons admin manage" on public.coupons;
drop policy if exists "Analytics admin manage" on public.analytics;
drop policy if exists "Enquiries admin manage" on public.enquiries;
create policy "Website sections public read" on public.website_sections for select using (status = 'published' and deleted_at is null);
create policy "Website sections admin manage" on public.website_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "Media library admin manage" on public.media_library for all using (public.is_admin()) with check (public.is_admin());
create policy "Coupons admin manage" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "Analytics admin manage" on public.analytics for all using (public.is_admin()) with check (public.is_admin());
create policy "Enquiries admin manage" on public.enquiries for all using (public.is_admin()) with check (public.is_admin());
