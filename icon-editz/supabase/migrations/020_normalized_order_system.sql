-- Migration 020: Normalized Production-Grade Order & Payment System

-- 1. Ensure customers table schema
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent numeric DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_purchase_at timestamp with time zone;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Ensure orders table schema
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'; -- pending, authorized, PAID, failed, refunded
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'razorpay';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_address jsonb DEFAULT '{}'::jsonb;

-- 3. Create public.order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_policy_id() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric DEFAULT 0 NOT NULL,
    total_price numeric DEFAULT 0 NOT NULL,
    download_key text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create public.payment_attempts table with full webhook metrics
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id uuid DEFAULT gen_random_policy_id() PRIMARY KEY,
    order_id text,
    razorpay_order_id text,
    razorpay_payment_id text,
    customer_name text,
    customer_email text,
    customer_phone text,
    amount numeric NOT NULL DEFAULT 0,
    currency text DEFAULT 'INR',
    status text NOT NULL DEFAULT 'initiated', -- initiated, authorized, captured, failed, refunded
    payment_method text DEFAULT 'UPI',
    gateway_error_code text,
    gateway_error_description text,
    webhook_event text,
    retry_count integer DEFAULT 1,
    recovery_email_sent boolean DEFAULT false,
    raw_response jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance & joins
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_razorpay_order_idx ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS payment_attempts_razorpay_order_idx ON public.payment_attempts(razorpay_order_id);
CREATE INDEX IF NOT EXISTS payment_attempts_customer_email_idx ON public.payment_attempts(customer_email);
