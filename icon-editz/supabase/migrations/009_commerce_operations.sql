-- Additive commerce operations schema. Existing orders and products remain valid.
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists meta_description text;
alter table public.products add column if not exists og_image text;
alter table public.products add column if not exists canonical_url text;
alter table public.products add column if not exists razorpay_payment_link_id text;
alter table public.products add column if not exists razorpay_payment_url text;
alter table public.products add column if not exists view_count bigint not null default 0;

alter table public.orders add column if not exists coupon_id uuid references public.coupons(id) on delete set null;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists download_status text not null default 'pending';
alter table public.orders add column if not exists email_status text not null default 'pending';
alter table public.orders add column if not exists refunded_at timestamptz;

alter table public.customers add column if not exists lifetime_value numeric(12,2) not null default 0;
alter table public.customers add column if not exists last_login_at timestamptz;
alter table public.customers add column if not exists customer_type text not null default 'guest';

alter table public.coupons add column if not exists min_amount numeric(12,2);
alter table public.coupons add column if not exists max_discount numeric(12,2);
alter table public.coupons add column if not exists per_customer_limit integer;
alter table public.coupons add column if not exists auto_apply boolean not null default false;
alter table public.coupons add column if not exists first_purchase_only boolean not null default false;
alter table public.coupons add column if not exists product_id uuid references public.products(id) on delete set null;

create table if not exists public.coupon_usage (
  id uuid primary key default gen_random_uuid(), coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null, customer_id uuid references public.customers(id) on delete set null,
  discount_amount numeric(12,2) not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, token text not null unique,
  expires_at timestamptz, disabled_at timestamptz, last_sent_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), type text not null, title text not null, body text,
  entity_type text, entity_id uuid, read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.report_exports (
  id uuid primary key default gen_random_uuid(), requested_by uuid references auth.users(id) on delete set null,
  format text not null check (format in ('csv','xlsx','pdf')), report_type text not null,
  filters jsonb not null default '{}'::jsonb, status text not null default 'queued', created_at timestamptz not null default now()
);

create index if not exists products_slug_active_idx on public.products(slug) where deleted_at is null;
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_payment_status_created_idx on public.orders(payment_status, created_at desc);
create index if not exists downloads_order_idx on public.download_links(order_id);
