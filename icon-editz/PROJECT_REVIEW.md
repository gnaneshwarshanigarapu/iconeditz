# Production Readiness Review

**Scope:** repository-wide static review of application source, API handlers, Supabase SQL and Edge Function source, configuration, dependencies, tracked assets, and documented deployment material. This review does not claim facts about the deployed Supabase/Vercel configuration that cannot be observed from the repository.

## 1. Executive summary

The application builds, but it is **not production-ready for payments, private file delivery, or a high-volume public launch**. The largest concerns are a client-controlled payment amount, placeholder Cloudflare R2 code used by the payment completion path, legacy SQL files that conflict with the intended migration, and a non-working lint command. The application also has two competing content systems: the public homepage is local-storage driven while the database CMS edits `page_content`/`website_sections`.

### Scores

| Area | Score | Basis |
| --- | ---: | --- |
| Architecture | 43/100 | Multiple overlapping data/content/auth approaches and legacy paths |
| Security | 28/100 | Payment integrity, public attachment URLs, unsafe analytics injection, and privileged bootstrap risks |
| Database | 52/100 | Master migration is substantial, but legacy SQL conflicts and several active query paths are not optimised |
| Frontend | 54/100 | Functional routing and code splitting, but CMS disconnects, mock admin modules, and large components |
| Performance | 42/100 | 454 MB public video assets, heavy visual runtime, no image/video delivery strategy |
| Deployment | 31/100 | Build passes, but lint fails and no CI/test/deployment validation is present |
| Maintainability | 35/100 | Duplicated and dead modules, inconsistent naming, stale documentation/schema artifacts |
| Scalability | 32/100 | Missing rate limits, synchronous email/payment work, unindexed list filters, no queue/webhook design |
| Code quality | 45/100 | Some validation and shared handlers exist; error treatment and contracts remain inconsistent |
| UI/UX | 57/100 | Solid visual primitives and route-level loading; mojibake, mock pages, and inconsistent CMS behavior remain |

`npm run build` passes. `npm run lint` fails before linting because `package-lock.json` resolves ESLint `4.0.0`, while `eslint.config.js` is an ESLint 9 flat configuration. This is a verified release-gate failure.

## 2. Issues by severity

### Critical

1. **Client-controlled payment amount** — `api/orders.js` accepts `amount` in both `create-db-order` and `create-payment-order`; it never loads the product price server-side. Verification compares Razorpay’s captured payment to that client-supplied database amount. An authenticated attacker can create and pay an underpriced order for any product. Resolve price, currency, and purchasable state exclusively from `products` on the server.
2. **Private downloads/R2 are placeholders** — `api/lib/r2.js` returns a synthetic `/placeholder/download/...` URL and `uploadToR2` returns a fabricated `r2.dev` URL. `api/orders.js` emails that link after payment. Downloads are neither delivered nor access-controlled.
3. **Conflicting executable database definitions** — `supabase/schema.sql` and `supabase/policies.sql` are still present beside the master migration. They define incompatible columns (for example `products.category uuid` vs the migration’s `category text`/`category_id uuid`), reference `reviews` without creating it, and `schema.sql` enables RLS on `reviews` before it exists. Running either legacy file can fail or diverge the database.

### High

1. **No Razorpay webhook or payment idempotency** — payment completion depends on the browser callback. A dropped callback leaves a captured payment pending; repeated verification can resend email. There is no unique Razorpay order/payment constraint, transaction, webhook signature endpoint, refund workflow, or reconciliation job.
2. **Public hire-request attachment exposure** — `api/hire-requests.js` calls `getPublicUrl` for files containing prospective client material. The migration creates the bucket as private, so this can either fail functionally or, if made public to work, expose attachments permanently. Use private objects and server-verified short-lived signed URLs.
3. **Public CMS endpoint reads drafts using the service role** — `GET /api/cms?section=homepage` uses `supabaseAdmin` and does not filter `status = 'published'`. It exposes draft homepage content outside RLS.
4. **Unprotected dashboard POST handler** — `api/dashboard.js` routes `POST` to `handleCapi` with no authentication, CSRF-like origin defense, rate limit, schema validation, or external delivery. It accepts arbitrary payloads and logs hashed personal identifiers, allowing log abuse/cost amplification.
5. **Stored script injection surface in analytics** — `src/components/Analytics.jsx` inserts values from database settings into `innerHTML` script and HTML strings without identifier validation. A compromised admin/settings write path can inject executable script into every visitor session. Strictly validate provider IDs and use DOM APIs/nonces rather than interpolating scripts.
6. **Database CMS does not power most public content** — `PremiumHomepage` and the legacy `SiteContentAdmin` use `useSiteContent`, which reads/writes browser `localStorage`; public pages do not consume the `page_content` records edited by `VisualPageCms`. Only footer/CTA clearly read the database. CMS edits therefore do not reliably affect the site.
7. **Historical finding resolved** — the Management API Edge initializer was removed; normal Supabase migrations are now the only schema deployment mechanism.
8. **Hard-coded administrator password appears in an executable helper** — `supabase/admin-auth-debug.sql` documents `icon@123`. Even as a debug script, retaining a known credential pattern in source is unsafe and encourages insecure setup.

### Medium

1. **Lint/release quality gate is broken** — see Executive Summary. The repository has no test scripts or CI workflow, so the successful Vite build is the only automated verification.
2. **Soft-delete design is not followed by active writes** — the migration supplies `deleted_at`, but product/category/legal/CMS UI operations use `.delete()`. This undermines recovery/audit expectations and can violate foreign-key history assumptions.
3. **Active query indexes are incomplete** — `api/hire-requests.js` filters by `status`, `project_type`, and date, but the master migration has no supporting composite index. `/api/products` filters `category` (text), while the migration indexes `category_id`, not `category`. Subscriber ordering by `created_at` also lacks an index. These will degrade as lists grow.
4. **Product API validation is too permissive** — `api/products.js` uses `.passthrough()` and makes core fields optional. It can persist unknown/unintended columns and incomplete products via service role. Use separate strict create/update schemas and allowlists.
5. **Order model lacks a reliable payment state machine** — `payment_status` is free text and lacks provider order ID, payment-attempt table, idempotency key, currency constraint, amount snapshot provenance, or purchase/download fulfillment transaction.
6. **Admin routes advertise unavailable features** — `/admin/orders`, `/admin/customers`, and `/admin/downloads` render `MockAdminSection`; the sidebar/UI implies operational capabilities that are not implemented.
7. **Unrouted and competing admin content implementations** — `SiteContentAdmin` is lazily declared but has no route. `HireFromUsAdminPage` uses `/api/cms`, but `/admin/hire-us` redirects to a different `VisualPageCms` page. This leaves a maintained but inaccessible CMS flow.
8. **Auth route mismatch** — Login/register/reset/verify page links target `/auth/*`, while `App.jsx` has no `/auth/*` routes. `ProtectedRoute` also redirects to `/auth/login`. Those flows resolve to the 404 route.
9. **Email delivery is synchronous and non-durable** — Resend failure is logged and discarded; there is no outbox, retry, provider response persistence, verified configurable sender, or delivery monitoring. `api/orders.js` references `order.products.name`, whereas the database uses `products.title`, producing an undefined product name in email subjects.
10. **Upload handling is memory-bound and lacks content inspection** — public hire requests can submit up to five 20 MB files into memory; admin uploads accept up to 100 MB in memory. There is no malware scan, asynchronous processing, filename normalization, quota, or rate limit.
11. **Encoding corruption is visible in source/UI strings** — numerous strings contain mojibake such as `â€™`, `â€¦`, `â‚¹`, and `â€œ` in public, store, and admin UI source. This is a customer-facing quality issue.
12. **Legacy documentation/configuration is internally inconsistent** — `api/.env.example` documents `JWT_SECRET`, although current API auth verifies Supabase tokens and no longer uses it. Multiple setup documents plus `schema.sql`/`policies.sql` create conflicting sources of truth.
13. **App-level ErrorBoundary only reports to console** — it does not send telemetry or provide a recovery/reporting path; API error surfaces are inconsistent and frequently display raw backend messages in admin views.

### Low

1. **Large components reduce reviewability** — `SiteContentAdmin.jsx` (~22 KB), legacy `pages/AdminDashboard.jsx` (~23 KB), `PremiumHomepage.jsx`, and `UserDashboard.jsx` combine data, state, and presentation.
2. **Global providers are broader than necessary** — `ProductsProvider` and `PaymentProvider` wrap every route although product/payment state is used mainly in store/admin routes.
3. **Public asset/repository bloat** — tracked Font Awesome source/distribution is ~23 MB and `public/assets` is ~454 MB, predominantly videos. The Font Awesome tree is not required by imports; public videos bypass image/video optimization and will make cold page loads expensive.
4. **UI controls with no behavior** — the AdminLayout search field and notifications button are decorative; analytics and several feature flags describe capabilities that are disabled or incomplete.
5. **No route-level SEO coverage beyond Home** — several pages have no visible `Seo` component, while schema metadata advertises a `/search` route that does not exist.

## 3. Database and Supabase review

### Master migration

`supabase/migrations/001_full_database.sql` is the intended authority. It creates the reviewed tables, common audit fields, RLS, indexes, storage buckets, seeds, and `admin_health_check`. It is materially more complete than the legacy SQL artifacts.

Verified gaps/risks:

- The migration is idempotent in table/policy creation but schema evolution is embedded in one mutable `001` file. Once production migrations are recorded, editing the already-applied version is not a safe deployment history. Freeze `001`, then append ordered migrations for changes.
- `downloads.r2_object_id` and `product_gallery.media_id` are UUID fields without foreign-key constraints in the master migration.
- The health check validates a generic common-column set and presence of any policy per table, not the required policy names/definitions, RLS enabled state, foreign-key integrity, index set, or actual R2 connectivity.
- Application reads do not consistently exclude `deleted_at`, including `VisualPageCms`; application deletes are physical rather than soft.
- `schema.sql`, `policies.sql`, and `admin-auth-debug.sql` must not be executable deployment paths. Archive/remove them from active documentation after preserving any needed diagnostics elsewhere.

### Storage

- The migration provisions `icon-editz-assets` and `hire-request-files`; runtime configuration must match those values.
- Frontend direct storage methods use `VITE_SUPABASE_STORAGE_BUCKET`, while server hire request uploads use `SUPABASE_HIRE_REQUESTS_BUCKET`. There is no startup validation that either is configured.
- Cloudflare R2 metadata tables exist, but the actual R2 adapter is placeholder code; database metadata cannot substitute for object storage delivery.

## 4. Security report

| Area | Verified finding | Recommendation |
| --- | --- | --- |
| Payments | Amount/currency are client supplied | Server-price orders, idempotency keys, webhook verification, transactional fulfillment |
| Downloads | Placeholder URL includes product/user in query string | Implement private R2/S3 signing and entitlement check; do not expose object paths |
| Uploads | Public files, memory uploads, no scanning/rate limits | Signed direct uploads or streaming, private bucket, scanner/quarantine, quotas and rate limits |
| CMS | Draft reads through service role | Query only published fields/records for public requests |
| Analytics | `innerHTML` with database values | Validate IDs; avoid script-string interpolation; enforce CSP |
| Admin bootstrap | Database-write management token | Dedicated role, audited invocation, short enablement window, migration hash lock |
| Auth | Frontend/API use Supabase tokens correctly after recent refactor, but broken `/auth/*` routes remain | Add route tests and use one documented auth flow |
| Secrets | `.env` and `.vercel` are ignored; no tracked secret was confirmed in the static review | Rotate any token exposed outside this audit; keep real secrets only in host/Edge secret stores |

## 5. Frontend, UX, performance, and accessibility

- Admin route-level code splitting is a positive; Store routes are also lazy-loaded. The main bundle remains approximately 359 kB gzipped from the latest build, with separate animation/vendor/Three chunks.
- `Hero` lazily loads the Three scene, but pages also ship/serve multiple large MP4 assets from `/public`; encode adaptive variants, poster images, preload only the active video, and serve through a CDN.
- `useThreeBackground` is unused; `BackgroundScene` is the active scene. Remove or consolidate the unused hook.
- `useSiteContent` keeps independent hook state per consumer and persists it to local storage. It is not an authoritative CMS store and causes misleading admin/public behavior.
- `CmsCta` uses database URLs directly as CSS `backgroundImage` and passes CMS button URLs to `Link`; validate URL schemes and distinguish internal/external navigation.
- Navigation includes reasonable labels and a SkipLink, but modal focus trapping/return focus, mobile menu keyboard handling, form error associations, and video captions/transcripts are not evidenced in the reviewed source.

## 6. Backend integrations

### Razorpay

Not ready: no webhook, no server-derived price, no idempotency, no refund/reconciliation design, and no durable fulfillment workflow. The browser should never be the payment source of truth.

### Cloudflare R2

Not integrated: `api/lib/r2.js` is explicitly placeholder code. `@aws-sdk/client-s3` is installed but not imported. Implement a real S3-compatible client with private objects, signed URLs, and database-backed ownership/entitlement checks.

### Resend

Partially integrated but not durable: an email is attempted inline after payment verification, errors are only logged, and no template/outbox/retry state exists. Add an event/outbox table or queue and a verified configurable sender.

## 7. Duplicate, dead, and unused report

### Confirmed duplicate/conflicting systems

- `supabase/migrations/001_full_database.sql` vs `supabase/schema.sql` / `supabase/policies.sql`: conflicting schemas and policies.
- `src/pages/admin/AdminDashboard.jsx` is the routed dashboard; `src/pages/AdminDashboard.jsx` is a separate legacy dashboard implementation.
- LocalStorage content (`useSiteContent`/`SiteContentAdmin`) competes with Supabase CMS (`VisualPageCms`, singleton CMS, `/api/cms`).
- Payment feature provider is mock-only while `CheckoutModal` contains a separate direct Razorpay flow.

### Confirmed unused or unreachable files/modules

- `src/pages/AdminDashboard.jsx` — not imported by routes.
- `src/pages/admin/ProductManager.jsx` — not routed/imported.
- `src/components/Todos.jsx` — no importer and contains a static demo.
- `src/hooks/useThreeBackground.js` — no importer; a separate `BackgroundScene` implementation is used.
- `src/utils/firebase.js` — no importer and entirely a commented Firebase template.
- `src/components/admin/SiteContentAdmin.jsx` — lazy import exists but no route renders it.
- `src/features/payments/usePayment.js` — no importer; its service is mock-only.

### Unused packages confirmed by source import search

- `@aws-sdk/client-s3`
- `@supabase/ssr`
- `three-mesh-bvh`
- `uuid`
- `jsonwebtoken` (no longer imported after Supabase-token API authentication)

Do not remove a package solely from this report without a lockfile/build verification pass; the list reflects source imports in this repository.

## 8. File-by-file recommendations

| Files | Recommendation |
| --- | --- |
| `api/orders.js`, `api/lib/r2.js` | Block production launch until server-price checkout, webhook/idempotency/transactions, real private R2 signing, and durable fulfillment exist. |
| `api/hire-requests.js`, `api/uploads.js` | Replace memory uploads/public URLs; add rate limits, file validation/scanning, private signed retrieval, and quotas. |
| `api/dashboard.js` | Require authorization or remove POST endpoint; validate payload and stop logging personal event material. |
| `api/cms.js` | Use public/published-only queries for unauthenticated reads; validate section content contracts. |
| `api/products.js` | Use strict create/update DTOs; apply `status`/`deleted_at` filters and server-side pagination. |
| `api/auth.js`, `api/lib/auth.js` | Remove stale JWT references/docs and console configuration logging; centralize role semantics. |
| `src/App.jsx`, `src/routes/*` | Add `/auth/*` routes or change all links/redirects; remove mock routes or mark them unavailable. |
| `src/components/Analytics.jsx` | Replace HTML interpolation with validated provider integration and CSP. |
| `src/components/PremiumHomepage.jsx`, `src/hooks/useSiteContent.js`, `SiteContentAdmin.jsx` | Choose one content source; remove local-only CMS if Supabase is authoritative. Split large components. |
| `src/components/store/CheckoutModal.jsx` | Consume a single payment service/API contract, not direct independent fetch choreography. |
| `src/pages/admin/*` | Add shared loading/error/empty states; implement real Orders/Customers/Downloads or hide navigation. |
| `src/utils/supabase.js` | Standardize filters, soft delete, typed DTO mapping, and error normalization. |
| `supabase/migrations/001_full_database.sql` | Freeze after first production application; add future changes as new migrations; add FK/index/policy verification. |
| `supabase/schema.sql`, `supabase/policies.sql`, `supabase/admin-auth-debug.sql` | Remove from executable deployment guidance; eliminate the sample password. |
| `eslint.config.js`, `package.json`, lockfile | Resolve ESLint to v9-compatible install and make lint a passing CI gate. |
| `public/assets`, `fontawesome-free-6.7.2-web` | Remove unreferenced Font Awesome distribution; move/encode video assets and use CDN delivery. |
| `vercel.json`, deployment docs | Add CI checks, environment validation, function timeout/body constraints, headers/CSP, and deployment smoke tests. |

## 9. Environment variable report

### Required server-side

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `BASE_URL`, `SUPABASE_HIRE_REQUESTS_BUCKET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`.

### Required client-side

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (or publishable-key fallback), `VITE_SUPABASE_STORAGE_BUCKET`, `VITE_RAZORPAY_KEY_ID`.

### Edge-only initialization

No Edge Function secrets are required for database initialization. Schema deployment is performed by normal Supabase migrations.

### Documentation inconsistency

`api/.env.example` lists `JWT_SECRET`, which is unused by current API source. R2 environment variables are documented, but the adapter does not use them. No source-level validation asserts the required variables at process startup except `api/lib/supabaseAdmin.js` for two Supabase values.

## 10. Suggested folder structure

```text
src/
  app/                 # providers, router, configuration
  features/
    auth/ content/ products/ orders/ payments/ media/ admin/
      api.js hooks.js components/ pages/ schemas.js
  components/ui/       # reusable presentation primitives only
  lib/                 # supabase client, URL validation, analytics
api/
  lib/                 # auth, validation, rate limit, errors
  orders/              # create, webhook, fulfillment
  media/               # signed upload/download
supabase/
  migrations/          # immutable ordered migrations only
  functions/
  seed/
```

## 11. Deployment and final readiness checklist

- [ ] Remove/archive conflicting legacy SQL and document one migration path.
- [ ] Apply the master migration to the target project; verify Health Check with a real admin.
- [ ] Implement and test secure R2 upload/download entitlement flow.
- [ ] Rebuild payment flow with server pricing, Razorpay webhook, idempotency, reconciliation, and refunds.
- [ ] Add private attachment delivery, rate limiting, scanning, and upload limits.
- [ ] Repair ESLint dependency/configuration and add CI for lint, build, unit, integration, and payment/webhook tests.
- [ ] Route or remove all auth and mock/admin pages; remove dead legacy modules and packages.
- [ ] Consolidate CMS to Supabase or explicitly retain local-only editing; do not run both.
- [ ] Add production CSP/security headers, analytics identifier validation, error monitoring, structured audit logging, and secret rotation/runbooks.
- [ ] Add pagination, indexes for measured query paths, soft-delete policy enforcement, and database backup/restore exercises.
- [ ] Verify Vercel and Edge Function secrets for every environment and run post-deploy smoke tests.

**Final determination: No-go for production launch until all Critical findings and the payment/R2/upload High findings are resolved.**
