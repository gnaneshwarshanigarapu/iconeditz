-- Migration 023: Ensure payment_attempts table has gateway error and webhook columns
ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS gateway_error_code TEXT;
ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS gateway_error_description TEXT;
ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS webhook_event TEXT;
ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 1;
ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS recovery_email_sent BOOLEAN DEFAULT false;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
