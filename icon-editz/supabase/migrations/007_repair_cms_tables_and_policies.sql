-- Idempotent CMS repair migration. Run this in the target Supabase project.
create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null, section text not null,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (page, section)
);
create table if not exists public.footer_content (
  id boolean primary key default true check (id),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.cta_content (
  id boolean primary key default true check (id),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null, content text not null default '',
  seo_title text, seo_description text, slug text not null unique,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.settings (
  id bigint generated always as identity primary key,
  key text not null unique, value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.page_content enable row level security;
alter table public.footer_content enable row level security;
alter table public.cta_content enable row level security;
alter table public.legal_pages enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Page content is public readable" on public.page_content;
drop policy if exists "Page content is admin managed" on public.page_content;
create policy "Page content is public readable" on public.page_content for select using (true);
create policy "Page content is admin managed" on public.page_content for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Footer public read" on public.footer_content;
drop policy if exists "Footer admin manage" on public.footer_content;
create policy "Footer public read" on public.footer_content for select using (true);
create policy "Footer admin manage" on public.footer_content for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "CTA public read" on public.cta_content;
drop policy if exists "CTA admin manage" on public.cta_content;
create policy "CTA public read" on public.cta_content for select using (true);
create policy "CTA admin manage" on public.cta_content for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Legal public read published" on public.legal_pages;
drop policy if exists "Legal admin manage" on public.legal_pages;
create policy "Legal public read published" on public.legal_pages for select using (published = true);
create policy "Legal admin manage" on public.legal_pages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Settings are viewable by everyone" on public.settings;
drop policy if exists "Admins can manage settings" on public.settings;
create policy "Settings are viewable by everyone" on public.settings for select using (true);
create policy "Admins can manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.page_content (page, section, content) values
  ('Homepage', 'Hero', '{}'), ('Homepage', 'Featured Services', '{}'), ('Homepage', 'Featured Projects', '{}'), ('Homepage', 'Featured Products', '{}'), ('Homepage', 'Testimonials', '{}'), ('Homepage', 'CTA', '{}'), ('Homepage', 'SEO', '{}'),
  ('About Page', 'Hero', '{}'), ('About Page', 'Story', '{}'), ('About Page', 'Skills', '{}'), ('About Page', 'Timeline', '{}'), ('About Page', 'Team', '{}'), ('About Page', 'CTA', '{}'), ('About Page', 'SEO', '{}'),
  ('Services Page', 'Hero', '{}'), ('Services Page', 'Services', '{}'), ('Services Page', 'Pricing', '{}'), ('Services Page', 'FAQ', '{}'), ('Services Page', 'CTA', '{}'), ('Services Page', 'SEO', '{}'),
  ('Projects Page', 'Hero', '{}'), ('Projects Page', 'Categories', '{}'), ('Projects Page', 'Portfolio', '{}'), ('Projects Page', 'Filters', '{}'), ('Projects Page', 'CTA', '{}'), ('Projects Page', 'SEO', '{}'),
  ('Store Page', 'Hero', '{}'), ('Store Page', 'Categories', '{}'), ('Store Page', 'Featured Products', '{}'), ('Store Page', 'Banner', '{}'), ('Store Page', 'SEO', '{}'),
  ('Hire From Us Page', 'Hero', '{}'), ('Hire From Us Page', 'Features', '{}'), ('Hire From Us Page', 'Enquiry Form', '{}'), ('Hire From Us Page', 'CTA', '{}'), ('Hire From Us Page', 'SEO', '{}')
on conflict (page, section) do nothing;

insert into public.footer_content (id) values (true) on conflict (id) do nothing;
insert into public.cta_content (id) values (true) on conflict (id) do nothing;
