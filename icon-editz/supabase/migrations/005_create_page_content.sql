create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (page, section)
);
alter table public.page_content enable row level security;
create policy "Page content is public readable" on public.page_content for select using (true);
create policy "Page content is admin managed" on public.page_content for all using (public.is_admin()) with check (public.is_admin());
