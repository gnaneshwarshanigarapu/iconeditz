-- Bring legacy/partially-created tables to the current additive schema without rewriting data.
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','r2_buckets','r2_objects','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','hire_requests','footer_content','cta_content','legal_pages'] loop
    execute format('alter table public.%I add column if not exists status text default ''active''', t);
    execute format('alter table public.%I add column if not exists created_at timestamptz default now()', t);
    execute format('alter table public.%I add column if not exists updated_at timestamptz default now()', t);
    execute format('alter table public.%I add column if not exists created_by uuid', t);
    execute format('alter table public.%I add column if not exists deleted_at timestamptz', t);
  end loop;
end $$;

-- Legacy product installations are the most common incomplete schema; all fields are added before indexes/policies.
alter table public.products add column if not exists category text;
alter table public.products add column if not exists category_id uuid;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price numeric(12,2) default 0;
alter table public.products add column if not exists discount_price numeric(12,2);
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists thumbnail_path text;
alter table public.products add column if not exists demo_video text;
alter table public.products add column if not exists screenshots jsonb default '[]'::jsonb;
alter table public.products add column if not exists features jsonb default '[]'::jsonb;
alter table public.products add column if not exists tags text[] default '{}';
alter table public.products add column if not exists published boolean default false;
alter table public.product_images add column if not exists product_id uuid;
alter table public.product_images add column if not exists sort_order integer default 0;
alter table public.product_gallery add column if not exists product_id uuid;
alter table public.product_gallery add column if not exists media_id uuid;
alter table public.product_gallery add column if not exists image_url text;
alter table public.product_gallery add column if not exists sort_order integer default 0;
alter table public.customers add column if not exists user_id uuid;
alter table public.orders add column if not exists customer_id uuid;
alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists product_id uuid;
alter table public.orders add column if not exists amount numeric(12,2) default 0;
alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.order_items add column if not exists order_id uuid;
alter table public.order_items add column if not exists product_id uuid;
alter table public.order_items add column if not exists quantity integer default 1;
alter table public.order_items add column if not exists unit_price numeric(12,2) default 0;
alter table public.downloads add column if not exists user_id uuid;
alter table public.downloads add column if not exists product_id uuid;
alter table public.downloads add column if not exists r2_object_id uuid;
alter table public.r2_objects add column if not exists bucket_id uuid;
alter table public.r2_objects add column if not exists object_key text;
alter table public.media_library add column if not exists r2_object_id uuid;
alter table public.activity_logs add column if not exists actor_id uuid;
alter table public.legal_pages add column if not exists published boolean default false;

-- Add relationship constraints only when both sides are present.  NOT VALID preserves legacy rows;
-- PostgreSQL still enforces the relationship for all new or changed rows.
do $$
declare rel record;
begin
  for rel in select * from (values
    ('products','category_id','categories','id','products_category_id_fkey'),
    ('product_images','product_id','products','id','product_images_product_id_fkey'),
    ('product_gallery','product_id','products','id','product_gallery_product_id_fkey'),
    ('customers','user_id','users','id','customers_user_id_fkey'),
    ('orders','customer_id','customers','id','orders_customer_id_fkey'),
    ('orders','product_id','products','id','orders_product_id_fkey'),
    ('order_items','order_id','orders','id','order_items_order_id_fkey'),
    ('order_items','product_id','products','id','order_items_product_id_fkey'),
    ('downloads','product_id','products','id','downloads_product_id_fkey'),
    ('downloads','r2_object_id','r2_objects','id','downloads_r2_object_id_fkey'),
    ('r2_objects','bucket_id','r2_buckets','id','r2_objects_bucket_id_fkey'),
    ('media_library','r2_object_id','r2_objects','id','media_library_r2_object_id_fkey')
  ) as x(source_table, source_column, target_table, target_column, constraint_name) loop
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name=rel.source_table and column_name=rel.source_column and data_type='uuid')
       and (rel.target_table <> 'users' or exists (select 1 from information_schema.tables where table_schema='auth' and table_name='users'))
       and (rel.target_table = 'users' or exists (select 1 from information_schema.columns where table_schema='public' and table_name=rel.target_table and column_name=rel.target_column))
       and not exists (select 1 from pg_constraint where conname=rel.constraint_name and conrelid=format('public.%I', rel.source_table)::regclass) then
      execute format('alter table public.%I add constraint %I foreign key (%I) references %s.%I(%I) on delete set null not valid', rel.source_table, rel.constraint_name, rel.source_column, case when rel.target_table='users' then 'auth' else 'public' end, rel.target_table, rel.target_column);
    end if;
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','r2_buckets','r2_objects','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','hire_requests','footer_content','cta_content','legal_pages'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;
