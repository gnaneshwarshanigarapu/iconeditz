# Database audit

Audited: 2026-08-01. Scope: all `supabase.from`, `supabaseAdmin.from`, storage, RPC, `/api/*` calls, environment references, and `supabase/migrations`.

## Result

The reported REST 404 for `page_content` means the deployed Supabase project has not run the current migration (or is not the project addressed by `VITE_SUPABASE_URL`). `page_content` is correctly named and created in the `public` schema by the repository migration. `public` is exposed by Supabase REST by default; there is no repository-level wrong-schema configuration.

The reported `/api/cms` 401 had a separate verified cause: browser requests used a legacy `localStorage` JWT while API routes verified a different `JWT_SECRET` token. The application now sends its Supabase access token and server routes validate it with Supabase Auth.

## Query-to-schema inventory

All tables below are in `public`; all are created in `supabase/migrations/001_full_database.sql`.

| Table / object | Columns used or expected by code | Callers | Migration / policy status |
| --- | --- | --- | --- |
| `page_content` | `id`, `page`, `section`, `content`, `status`, `updated_at`, `deleted_at` | `VisualPageCms`, `/api/cms` homepage | Created; unique `(page, section)`, page index, admin + published-read policies |
| `website_sections` | `page`, `section_key`, `content`, `status`, `sort_order`, `deleted_at` | `/api/cms` Hire From Us | Created; unique `(page, section_key)`, page index, admin + published-read policies |
| `settings` | `key`, `value`, `status`, `deleted_at` | Settings CMS, Analytics, `/api/cms` | Created; unique `key`, admin policy |
| `products` | `id`, `title`, `slug`, `category`, `price`, `published`, `created_at` and full product record | storefront, product CMS, `/api/products`, `/api/orders` | Created; category/status indexes, admin + public published-read policy |
| `orders` | `id`, `user_id`, `product_id`, `amount`, `customer_*`, `payment_status`, `created_at` | dashboard, checkout, `/api/orders` | Created; customer/date index, admin policy; service-role API accesses it |
| `profiles` | `id` plus profile fields | user dashboard | Created; own-profile select/insert/update policies plus admin policy |
| `categories` | `id`, `name`, `slug`, `created_at` | category CMS | Created; admin + published-read policy |
| `newsletter_subscribers` | `id`, `email`, `status`, `created_at` | Footer, subscribers CMS | Created; admin + public subscribe policy |
| `footer_content` / `cta_content` | `id`, `content`, `status`, `updated_at` | Footer, CTA, singleton CMS | Created; singleton primary keys, admin + published-read policies |
| `legal_pages` | `id`, `title`, `content`, `seo_*`, `slug`, `published`, `status`, `updated_at` | legal page and CMS | Created; admin + published-read policy |
| `hire_requests` | request form fields, `attachments`, `status`, `created_at` | `/api/hire-requests` and admin page | Created; API uses service role after auth |
| `media_library`, `services`, `projects`, `testimonials`, `analytics`, `coupons`, `customers`, `downloads`, `product_images`, `product_gallery`, `order_items`, `activity_logs`, `admins`, `r2_buckets`, `r2_objects` | no active direct frontend query in this revision | future/admin schema | Created and RLS-enabled; required indexes included where queried or joined |
| `admin_health_check()` | RPC output categories | Database Health | Created and granted to `authenticated` |

## Verified problems and corrections

1. **Nonexistent CMS relations:** `/api/cms` previously queried `homepage_content`, `hire_us_content`, `hire_us_features`, `hire_us_services`, `hire_us_gallery_items`, and `hire_us_faq_items`. None exists in the migration. The route now uses `page_content` and `website_sections`; no tables were invented.
2. **Wrong response shape:** `useHireUsContent` read `data.sections`, although the API responds with `{ data: ... }`. Corrected.
3. **401 authentication mismatch:** corrected as described above. The custom JWT issuer was removed from the browser path.
4. **Broken API dispatch:** `/api/orders` and `/api/products` pass method maps to `withApi`, while the wrapper only accepted arrays. The wrapper now supports both forms.
5. **Real Storage buckets absent:** application code references a frontend asset bucket and a server hire-request bucket. The migration now creates `icon-editz-assets` and `hire-request-files`, and Health Check verifies those actual Supabase Storage buckets.
6. **Profile RLS gap:** profile upsert by the signed-in user previously had no matching policy. Own-profile policies were added.

## Remaining deployment actions

Repository inspection cannot establish whether a remote migration was applied. In the target Supabase SQL Editor run exactly:

`supabase/migrations/001_full_database.sql`

Then ensure the Vercel and local environments point at that same project. The Health Check will report missing tables, columns, policies, actual storage buckets, and seeds once an admin signs in.

## Environment inventory

Required server variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `BASE_URL`, `SUPABASE_HIRE_REQUESTS_BUCKET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`.

Required client variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`), `VITE_SUPABASE_STORAGE_BUCKET`.

Optional feature variables: `VITE_ENABLE_3D_BACKGROUND` and the `VITE_FIREBASE_*` group (only if Firebase functionality is enabled).

Set `VITE_SUPABASE_STORAGE_BUCKET=icon-editz-assets` and `SUPABASE_HIRE_REQUESTS_BUCKET=hire-request-files` to match the migration. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
