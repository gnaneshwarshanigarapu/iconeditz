-- Idempotent repair migration for all tables referenced by the application.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, display_name text, avatar_url text, phone text, location text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(), title text not null,
  slug text unique not null, category text, thumbnail_path text, demo_video text,
  description text, features jsonb default '[]'::jsonb, tags text[], price numeric(10,2) default 0,
  discount_price numeric(10,2), zip_path text, screenshots text[], google_drive_link text,
  onedrive_link text, dropbox_link text, published boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  order_id text unique not null default gen_random_uuid()::text, product_id uuid references products(id) on delete set null,
  product_name text not null default 'Product', customer_name text not null, customer_email text not null,
  customer_phone text not null, amount numeric(10,2) not null, payment_status text default 'pending',
  download_link text, created_at timestamptz default now()
);

create table if not exists homepage_content (
  id bigint generated always as identity primary key, section text not null unique, content jsonb default '{}'::jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists hire_us_content (section text primary key, content jsonb default '{}'::jsonb, published_at timestamptz, updated_at timestamptz default now());
create table if not exists services (id bigint generated always as identity primary key, title text not null, description text, icon text, image_url text, sort_order smallint, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists faq (id bigint generated always as identity primary key, question text not null, answer text not null, sort_order smallint, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists projects (id bigint generated always as identity primary key, title text not null, description text, image_url text, project_url text, sort_order smallint, created_at timestamptz default now(), updated_at timestamptz default now());

-- API routes also use these supporting Hire From Us tables.
create table if not exists hire_us_features (id bigint generated always as identity primary key, title text not null, description text, icon text, sort_order smallint default 0, published boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists hire_us_services (id bigint generated always as identity primary key, title text not null, description text, image_path text, sort_order smallint default 0, published boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists hire_us_gallery_items (id bigint generated always as identity primary key, title text, file_path text not null, type text not null check (type in ('image','video')), sort_order smallint default 0, published boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists hire_us_faq_items (id bigint generated always as identity primary key, question text not null, answer text not null, sort_order smallint default 0, published boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
