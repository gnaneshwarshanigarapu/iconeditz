-- Migration 022: Ensure order_items table has full columns and reload schema
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS download_key TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
