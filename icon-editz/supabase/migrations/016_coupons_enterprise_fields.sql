-- Migration 016: Add enterprise coupon fields to public.coupons safely
-- Do not drop any tables, recreate tables, or modify existing data.

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS offer_name text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_discount numeric DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_amount numeric DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit integer DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit_per_customer integer DEFAULT 1;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applies_to text DEFAULT 'all_products';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS active_immediately boolean DEFAULT true;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS first_purchase_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS new_customers_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS exclude_free_products boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS exclude_sale_products boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS allow_stacking boolean DEFAULT false;
