# Supabase migrations

The database is owned exclusively by the ordered files in `migrations/`:

1. `001_create_tables.sql`
2. `002_upgrade_existing_tables.sql`
3. `003_indexes.sql`
4. `004_rls.sql`
5. `005_storage.sql`
6. `006_seed_data.sql`
7. `007_rpc_functions.sql`
8. `008_health_checks.sql`

For a new or existing project:

```sh
supabase link --project-ref <project-ref>
supabase db push
```

Do not run SQL Editor snippets or browser-based repair tools. Migrations create missing objects and make only additive upgrades. Seed records use natural-key existence checks and never replace editor content. Existing relationships are added as `NOT VALID` foreign keys, preserving historical rows while enforcing future writes.

Set `VITE_SUPABASE_STORAGE_BUCKET=icon-editz-assets` and `SUPABASE_HIRE_REQUESTS_BUCKET=hire-request-files`. Create the initial administrator in Supabase Auth, then grant the user `app_metadata.role = admin` (or add their ID to `public.admins`). Never expose a service-role key to the browser.
