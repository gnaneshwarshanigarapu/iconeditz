-- Migration 019: Create payment_attempts table and add customer stats fields safely
-- Do not drop any tables, recreate tables, or modify existing data.

-- 1. Ensure customers table has stats fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent numeric DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_purchase_at timestamp with time zone;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Create public.payment_attempts table if not exists
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id text,
    razorpay_order_id text,
    razorpay_payment_id text,
    amount numeric NOT NULL DEFAULT 0,
    currency text DEFAULT 'INR',
    status text NOT NULL DEFAULT 'initiated', -- initiated, captured, failed, refunded
    payment_method text,
    customer_name text,
    customer_email text,
    customer_phone text,
    error_code text,
    error_description text,
    raw_response jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure orders table has full Razorpay payment fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'razorpay';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature text;

-- Add performance index
CREATE INDEX IF NOT EXISTS payment_attempts_razorpay_order_idx ON public.payment_attempts(razorpay_order_id);
CREATE INDEX IF NOT EXISTS payment_attempts_customer_email_idx ON public.payment_attempts(customer_email);
CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers(email);
