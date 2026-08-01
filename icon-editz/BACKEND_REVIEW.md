# Backend architecture review

## Problems found

- A monolithic migration mixed creation, upgrades, indexes, RLS, Storage, seed data, and RPCs. A legacy `products` table without `category_id` therefore stopped the whole deployment at index creation.
- SQL setup instructions referred to manual SQL Editor execution.
- The health page did not report foreign keys and could not distinguish deployment integration readiness from schema readiness.
- Public CMS components assumed a configured Supabase client and fully populated singleton content.

## Fixes applied

- Replaced the monolith with eight ordered migrations, each safe to run against a clean project or a partially-created legacy schema.
- `002_upgrade_existing_tables.sql` adds common audit columns and all legacy product/order/R2 fields before constraints, indexes, RLS, policies, or seed writes.
- Foreign keys are checked before creation and use `NOT VALID`, so historical rows are preserved while new writes are enforced.
- All indexes are guarded by table/column checks.
- RLS is enabled before policies; policy replacement is idempotent. Storage buckets and their policy are migration-managed.
- Seeds use existence checks rather than overwrites. Required RPCs and an expanded health RPC are installed and granted in later migrations.
- The health UI reports foreign keys, R2 metadata, authentication, Razorpay, Resend, tables, columns, indexes, RLS, policies, buckets, RPCs, and seed data.
- Footer, CTA, and legal-page reads now tolerate missing configuration or empty records.

## Deleted code

- `supabase/migrations/001_full_database.sql` was removed and replaced by the ordered migration set. No manual database initialization or edge initialization remains part of the supported setup.

## Compatibility guarantees

- No tables, columns, data, or editor content are dropped.
- Missing legacy columns are added before dependent objects are considered.
- Existing duplicate data is never rewritten to manufacture a unique constraint; seed operations use natural-key `NOT EXISTS` checks for this reason.
- Existing invalid historic foreign-key values are retained; `NOT VALID` constraints check all future writes.

## Deployment

```sh
supabase link --project-ref <project-ref>
supabase db push
npm run build
```

After deployment, sign in as an administrator and open `/admin/health`. Configure Vercel server secrets for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, Cloudflare R2 credentials, and the matching public Vite variables.

## Remaining production tasks

- Link a disposable brand-new Supabase project and run `supabase db push` as a final infrastructure integration check.
- Link a copy of the oldest supported project and run the same command to verify its actual historical data shape.
- Set Vercel secrets and perform live Razorpay, Resend, and Cloudflare R2 smoke tests; these credentials are intentionally not readable by the browser or database migration.
