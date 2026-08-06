-- Migration 018: Add SEO columns to public.products safely
-- Do not drop any tables, recreate tables, or modify existing data.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS canonical_url text;
