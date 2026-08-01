# Supabase initialization

For a brand-new Supabase project, open **SQL Editor**, paste and run exactly [`migrations/001_full_database.sql`](migrations/001_full_database.sql), then refresh the admin Database Health page.

The migration is idempotent: it can be run again safely to create missing objects, policies, indexes, R2 metadata, and default CMS records without replacing edited content.

To bootstrap an administrator, create the Auth user before running the migration; the first existing Auth user receives a profile and `admins` record. Existing installations using the `admin` JWT role remain compatible. Never place a service-role key in the frontend.
