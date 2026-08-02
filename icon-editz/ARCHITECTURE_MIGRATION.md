# Incremental architecture migration

## Compatibility rules

1. Existing Vite source, Vercel functions, Supabase schema, R2, Razorpay, Resend, and production URLs remain active until an equivalent module is verified.
2. Every migrated endpoint retains its response shape and gets contract tests before traffic is switched.
3. Frontend components only call an API client. Supabase browser queries are migrated page-by-page after matching backend endpoints exist.
4. No secret is placed in `VITE_*`; service role, Razorpay secret, Resend, and R2 credentials belong only to `backend` deployment variables.

## Completed foundation

- `backend/app` is a FastAPI application with configuration, CORS, typed schemas, a Supabase service boundary, and a product-detail endpoint.
- `api/index.py` is the Vercel Python entrypoint. It is intentionally additive; Vercel routing is not switched to a FastAPI catch-all until all currently live Node API modules have equivalent FastAPI routes.
- The product endpoint uses `products.id`, explicit schema columns, structured errors, and the existing `{ success, product }` response contract.
- Existing Vercel API code remains the compatibility backend.

## Migration order

1. Products and categories: add list/detail/admin service methods, then replace browser Supabase reads with a common API client.
2. CMS/settings/legal: migrate one resource at a time with GET/PUT schemas and Vercel-to-FastAPI contract parity.
3. Downloads/R2 and Resend notifications: move integrations to backend services, test signed URLs and delivery logs.
4. Razorpay: migrate only after webhook HMAC, idempotency, retry, and order-state tests are ready; retain Vercel handlers until cutover.
5. Analytics/Meta/SEO/blog/admin reporting: add typed routes and durable event/log models.
6. Deploy FastAPI to Railway, Render, or Fly.io; configure a frontend API base URL; run parallel smoke tests; then retire individual Vercel handlers.

## Required deployment variables

Frontend: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_RAZORPAY_KEY_ID`.

Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_*`, `RESEND_API_KEY`, `R2_*`, `META_*`, `FRONTEND_ORIGINS`.
