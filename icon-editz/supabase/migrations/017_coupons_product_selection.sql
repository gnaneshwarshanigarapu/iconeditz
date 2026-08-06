-- Migration 017: Add product and category selection array columns to public.coupons safely
-- Do not drop any tables, recreate tables, or modify existing data.

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_product_ids jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_categories jsonb DEFAULT '[]'::jsonb;
