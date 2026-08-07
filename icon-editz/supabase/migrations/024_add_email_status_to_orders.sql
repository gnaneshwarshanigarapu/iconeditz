-- Migration 024: Add email_status column to orders table safely
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
