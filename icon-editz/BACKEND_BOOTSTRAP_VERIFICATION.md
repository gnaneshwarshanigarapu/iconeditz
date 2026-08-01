# Backend Bootstrap Verification

Verified against the repository source on 2026-08-01. This is a static/code verification; no remote Supabase project, Edge deployment, Management API token, Razorpay, Resend, or Cloudflare account was available to execute integration tests.

## Result

**Conditional pass for migration structure; not a full production-readiness confirmation.** The master migration is structurally repeatable and the UI/Edge invocation path is present. A fully blank project will initialize from the button only after the Edge Function has been deployed and its server-only secrets configured. The remaining gaps below prevent an unconditional confirmation.

## Requirement verification

| # | Check | Result | Evidence / finding |
| ---: | --- | --- | --- |
| 1 | Master migration idempotence | PASS (static) | Tables, extensions, indexes, triggers, policies, and seeds use repeat-safe patterns. A live PostgreSQL execution was not available. |
| 2 | Every table uses `IF NOT EXISTS` | PASS | 29 `CREATE TABLE` declarations in `001_full_database.sql`; static scan found no exception. |
| 3 | Add-column alters are repeat-safe | PASS | The dynamic repair block uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for its common audit fields. |
| 4 | Indexes use `CREATE INDEX IF NOT EXISTS` | PASS | All nine declared indexes use the guard. |
| 5 | Functions use `CREATE OR REPLACE` | PASS | `set_updated_at`, `is_admin`, seed/repair functions, and Health Check all use it. |
| 6 | Policies are repeat-safe | PASS | Dynamic and explicit policies are preceded by `DROP POLICY IF EXISTS`; PostgreSQL does not support `CREATE POLICY IF NOT EXISTS`, so this is the valid equivalent. |
| 7 | Seeds are repeat-safe | PASS | All top-level seed inserts and seed-function inserts use `ON CONFLICT DO NOTHING`. |
| 8 | Second migration execution | PASS (static) | No unguarded create/index/policy/seed statement was found. Remote execution remains required to prove hosted privileges/version compatibility. |
| 9 | Edge executes master migration | PASS (conditional) | POST calls Management API `/database/query` with the fixed `INITIALIZATION_SQL` Edge secret. |
| 10 | OPTIONS/CORS on every Edge response | PASS | OPTIONS returns 204 and all JSON responses share CORS headers. Configure `ALLOWED_ORIGIN` in production; its fallback is `*`. |
| 11 | All Edge secrets validated before execution | PARTIAL | URL/anon/service keys are checked before auth and Management token/project ref before Management calls. `INITIALIZATION_SQL` is checked after the preliminary read-only table check, but before any DDL. |
| 12 | Missing-secret errors | PASS | Missing base secrets return a helpful 500; missing Management token/ref and migration SQL return explicit messages. |
| 13 | Browser secret exposure | PASS (source review) | No Vite source references service-role, Management API, or initialization SQL secrets. |
| 14 | Health detects schema objects | PASS (database checks) | RPC reports missing tables, common columns, indexes, any-table policies, RLS state, storage buckets, seed records, and required RPC names. |
| 15 | Each CMS page auto-creates defaults when empty | FAIL | Defaults are seeded by migration/Edge/RPC, but direct CMS components read `page_content` and render setup/empty states; they do not call `initialize_default_cms()` then retry when a specific record is missing. |
| 16 | No active Supabase query points at a non-migration table/RPC | PASS | Current `.from()` inventory maps to migration tables. `admin_health_check` is created. |
| 17 | Frontend schema matches database | PARTIAL | Active table/column names exist. The product mapper intentionally translates UI names (`thumbnail`, `demoVideo`) to database names. One backend defect remains: payment email uses `order.products.name`, although the schema provides `products.title`. |
| 18 | Storage bucket names consistent | PARTIAL | Migration creates `icon-editz-assets` and `hire-request-files`; code uses environment-selected bucket names. Correct deployment values are required, but no startup assertion enforces them. |
| 19 | Razorpay, Resend, R2, Supabase checks | PARTIAL | Supabase client and Edge configuration are checked. Browser Health Check can only see Razorpay’s public key; it cannot validate Vercel server secrets. R2 is explicitly reported FAIL because the R2 adapter remains placeholder code. Resend is reported FAIL/unverifiable from the browser. |
| 20 | Blank-project one-button initialization | CONDITIONAL | Works only when the function is deployed, `INITIALIZATION_SQL`, Management token, and project ref are configured, and the invoking user is pre-authorized as admin. This cannot be proven without a deployed project. |

## Remaining issues

1. **No automatic CMS self-healing per page.** `VisualPageCms`, `SingletonContentCms`, Footer, CTA, and other direct Supabase readers do not invoke the seed RPC when a row is absent. Initialization creates seeds, but deleting a row later yields an empty/default UI rather than database repair.
2. **R2 is not implemented.** `api/lib/r2.js` contains synthetic upload/download URLs. Health correctly cannot mark R2 PASS.
3. **Server integration health cannot be established from a browser.** Razorpay secret, Resend key, R2 credentials, and Vercel API environment values require a server-side health endpoint or deployment smoke test; exposing them to the browser would be insecure.
4. **Edge secret validation is not fully upfront.** `INITIALIZATION_SQL` is validated only after the harmless read-only inspection. Move this validation before `managementQuery` if strict all-secret preflight is required.
5. **Health policy validation is presence-based.** It detects a table with no policy, but does not compare every expected policy definition/name or whether each policy has the intended expression.
6. **Authorization prerequisite for an empty database.** The Edge Function allows the first bootstrap only for an Auth user already carrying `admin` metadata, because no `admins` table exists before initialization. This metadata must be configured through secure deployment/Auth administration.
7. **Master migration is mutable.** Once `001` has been applied in production, future schema changes should be additive migrations, not edits to the applied migration file.

## Deployment checklist

- [ ] Deploy `initialize_database` to the target Supabase project.
- [ ] Set `SUPABASE_PROJECT_REF` as an Edge secret.
- [ ] Set a least-privilege Management token with `database_write` as `SUPABASE_MANAGEMENT_API_TOKEN`.
- [ ] Set `INITIALIZATION_SQL` to the exact content of `supabase/migrations/001_full_database.sql` as an Edge secret.
- [ ] Set `ALLOWED_ORIGIN` to the production application origin; do not retain `*` for production.
- [ ] Configure the initial administrator’s Auth metadata role as `admin` before the first invocation.
- [ ] Set `VITE_SUPABASE_STORAGE_BUCKET=icon-editz-assets`.
- [ ] Set `SUPABASE_HIRE_REQUESTS_BUCKET=hire-request-files`.
- [ ] Deploy frontend/API with all variables below.
- [ ] Sign in as the bootstrap administrator, press **Initialize Database**, and run Health Check until database categories pass.
- [ ] Run a real payment/upload/email smoke test before enabling those product paths.

## Required environment variables

### Browser (Vite)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET=icon-editz-assets`
- `VITE_RAZORPAY_KEY_ID` when payments are enabled
- `VITE_ENABLE_3D_BACKGROUND` when desired

### Server/API deployment

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_HIRE_REQUESTS_BUCKET=hire-request-files`
- `BASE_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`

### Edge Function secrets

- `SUPABASE_PROJECT_REF`
- `SUPABASE_MANAGEMENT_API_TOKEN`
- `INITIALIZATION_SQL`
- `ALLOWED_ORIGIN`

The Edge runtime also requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; Supabase provides these to deployed functions, but verify their availability in the target project.

## Files modified by the bootstrap implementation

- `supabase/migrations/001_full_database.sql`
- `supabase/functions/initialize_database/index.ts`
- `supabase/functions/initialize_database/README.md`
- `src/pages/admin/DatabaseHealthPage.jsx`
- `src/utils/api.js`
- `src/hooks/useAuth.jsx`
- `src/hooks/useHireUsContent.js`
- `src/components/admin/VisualPageCms.jsx`
- `src/components/store/CheckoutModal.jsx`
- `api/auth.js`, `api/cms.js`, `api/dashboard.js`, `api/hire-requests.js`, `api/orders.js`, `api/products.js`, `api/uploads.js`
- `api/lib/auth.js`, `api/lib/handler.js`

## Production readiness score

**Bootstrap implementation: 72/100 (conditional).** Migration and Edge wiring are structurally sound, but automatic CMS repair, real R2 verification, server-only integration verification, and an actual remote blank-project test remain incomplete.

## Manual SQL confirmation

**No manual SQL execution is required after deployment setup.** The administrator presses **Initialize Database**, and the Edge Function executes the exact master migration. This statement is conditional on the Edge Function and its required server-only secrets already being deployed/configured; those credentials cannot be safely created from the frontend.
