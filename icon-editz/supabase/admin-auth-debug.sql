-- Admin auth debugging helpers.
-- Run these in the Supabase SQL editor for the project shown by VITE_SUPABASE_URL.
-- Admin login target: admin@iconeditz.com

-- 1. Check whether the admin auth user exists.
select
  id,
  email,
  email_confirmed_at,
  app_metadata,
  user_metadata,
  created_at,
  last_sign_in_at
from auth.users
where lower(email) = lower('admin@iconeditz.com');

-- 2. Mark the existing auth user as an admin for RLS policies.
-- This requires running in the Supabase SQL editor or another privileged context.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('admin@iconeditz.com');

-- 3. Confirm the JWT metadata role is present.
select
  id,
  email,
  raw_app_meta_data ->> 'role' as app_role
from auth.users
where lower(email) = lower('admin@iconeditz.com');

-- 4. If the user does not exist, create it from:
-- Supabase Dashboard -> Authentication -> Users -> Add user.
-- Email: admin@iconeditz.com
-- Password: icon@123
-- Enable "Auto Confirm User" for the admin account,
-- then run step 2 to add the admin role metadata.
--
-- 5. Verify Email Auth is enabled from:
-- Supabase Dashboard -> Authentication -> Providers -> Email.
-- Email provider must be enabled for signInWithPassword() to work.
