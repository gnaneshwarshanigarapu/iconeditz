# Icon Editz — Platform Starter

This repo contains the Icon Editz SPA and starter platform architecture to scale into a digital products marketplace.

Quick setup

1. Install dependencies

```bash
npm install
```

2. (Optional) Install Supabase client and Resend SDK when enabling backend features

```bash
npm install @supabase/supabase-js @resend/node
```

3. Add environment variables in `.env` (root)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=service-role-key   # server-only
VITE_RESEND_API_KEY=your_resend_key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=rzp_test_secret
```

Feature flags

Edit `src/constants/features.js` to enable features. Example to enable store and auth:

```js
export const FEATURES = { auth: true, store: true, admin: false, payments: true, email: true };
```

Supabase

- SQL schema provided: `supabase/schema.sql`
- RLS policies: `supabase/policies.sql`
- Client wrapper: `src/services/supabaseClient.js` (safe stub when env vars missing)

Folder structure (starter)

- `src/components/` UI components
- `src/sections/` landing page sections (Hero, About, Projects, Tools, Contact)
- `src/pages/` pages (Store, ProductDetail, Admin, Auth)
- `src/services/` API/service wrappers (`supabaseClient.js`, `razorpay.js`)
- `supabase/` SQL and policies

Razorpay integration plan

1. Client creates order request for product -> call serverless function or server endpoint.
2. Server creates Razorpay order using secret key -> returns `order_id` to client.
3. Client opens Razorpay checkout with `order_id`.
4. On success, client calls server to verify signature and capture payment.
5. Server records `payments`, creates an `order`, and creates `downloads` signed URLs.
6. Send email with secure signed download link via Resend.

Notes on storage

- Store ZIP/product files in Supabase Storage in a private bucket.
- Generate expiring signed URLs for downloads and store them in `downloads` table.

Deployment

- Build: `npm run build`
- Serve static site with Netlify/Vercel; ensure any server endpoints for payments run on serverless functions or an external server.

Next steps I can implement now

- Scaffold the UI pages for Store, ProductDetail, Admin with lazy-loading routes
- Implement Razorpay serverless function skeleton
- Implement Resend email templates and integration
- Build React Three Fiber scene and polished animations

Tell me which of the next steps to implement first and I'll scaffold it.
