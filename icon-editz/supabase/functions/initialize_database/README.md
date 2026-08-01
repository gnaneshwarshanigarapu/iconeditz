# `initialize_database` Edge Function

This function provides the admin one-click bootstrap for a blank project. It runs the repository's fixed, idempotent master migration through the Supabase Management API. It never accepts SQL from the browser.

Deploy the function and set server-only secrets:

```sh
supabase functions deploy initialize_database
supabase secrets set SUPABASE_PROJECT_REF=<project-ref>
supabase secrets set SUPABASE_MANAGEMENT_API_TOKEN=<fine-grained-token-with-database_write>
supabase secrets set INITIALIZATION_SQL="$(cat supabase/migrations/001_full_database.sql)"
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available to deployed Supabase functions. Never set the Management API token, service-role key, or `INITIALIZATION_SQL` in Vite/browser variables.

An authenticated caller must have either `app_metadata.role` / `user_metadata.role` set to `admin`, or an active `public.admins` record. For the first blank-project bootstrap, configure the intended administrator's Auth metadata role as `admin` before invoking this function.
