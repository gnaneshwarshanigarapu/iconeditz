-- Supabase / PostgreSQL schema for Icon Editz
-- Users table (Supabase Auth will manage main auth fields; this stores profile data)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  location text,
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category uuid references categories(id) on delete set null,
  thumbnail_path text,
  demo_video text,
  description text,
  features jsonb,
  tags text[],
  price numeric(10,2) default 0,
  discount_price numeric(10,2),
  zip_path text,
  screenshots text[],
  google_drive_link text,
  onedrive_link text,
  dropbox_link text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id text unique not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  amount numeric(10,2) not null,
  payment_status text default 'pending',
  download_link text,
  created_at timestamptz default now()
);

-- Downloads
create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  download_link text,
  created_at timestamptz default now()
);

-- Wishlist
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int check (rating >=1 and rating <=5),
  body text,
  created_at timestamptz default now()
);
