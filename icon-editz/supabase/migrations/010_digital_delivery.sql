-- Private R2 key only; never store or expose a public delivery URL.
alter table public.products add column if not exists download_key text;
alter table public.products add column if not exists download_filename text;
create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null, order_id uuid references public.orders(id) on delete set null,
  ip_address text, download_count integer not null default 1, created_at timestamptz not null default now()
);
create index if not exists download_logs_order_id_idx on public.download_logs(order_id);
create index if not exists download_logs_created_at_idx on public.download_logs(created_at desc);
alter table public.download_logs enable row level security;
drop policy if exists admin_manage on public.download_logs;
create policy admin_manage on public.download_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());
