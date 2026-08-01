# API refactor

## Result

The deployment surface has been reduced from **14 JavaScript files under `api/`** (nine endpoint files plus five colocated helper files) to **seven endpoint files**. Shared backend code now lives in `server/lib/`, outside Vercel's function directory, so it is not discovered as a Serverless Function.

| Previous file | Purpose | Can merge? | Replacement |
| --- | --- | --- | --- |
| `api/auth.js` | Session lookup, login, logout, password reset | No | `api/auth.js` |
| `api/cms.js` | CMS content and public contact handling | No | `api/cms.js` |
| `api/create-order.js` | Create a Razorpay order | Yes | `POST /api/orders` |
| `api/dashboard.js` | Admin dashboard data and Meta CAPI event logging | Yes | `GET` / `POST /api/admin` |
| `api/hire-requests.js` | Public hire submission and admin workflow | No | `api/hire-requests.js` |
| `api/orders.js` | Order history | Yes | `GET /api/orders` |
| `api/products.js` | Product catalogue and admin product changes | No | `api/products.js` |
| `api/uploads.js` | Authenticated Cloudflare R2 uploads | No | `api/uploads.js` |
| `api/verify-payment.js` | Verify Razorpay payment signatures | Yes | `PUT /api/orders` |
| `api/lib/*` | Shared auth, database, handler, IP and R2 helpers | Yes | `server/lib/*` (not an endpoint) |

There were no standalone newsletter, download, category, image, footer, CTA, legal, or analytics endpoints to merge. Their applicable operations are already handled by CMS, products, admin, or the existing Supabase client flow.

## Current endpoint structure

| Endpoint | Methods | Responsibility |
| --- | --- | --- |
| `/api/admin` | `GET`, `POST` | Dashboard summary; Meta CAPI event logging |
| `/api/auth` | `GET`, `POST` | Current user, login, logout, password reset |
| `/api/cms` | `GET`, `POST`, `PUT` | CMS sections, settings, and contact submission |
| `/api/hire-requests` | `GET`, `POST`, `PATCH`, `DELETE` | Hire request submissions and admin workflow |
| `/api/orders` | `GET`, `POST`, `PUT` | Order history, Razorpay order creation, payment verification |
| `/api/products` | `GET`, `POST`, `PUT`, `DELETE` | Catalogue reads and admin product management |
| `/api/uploads` | `POST` | Authenticated Cloudflare R2 uploads |

## Client migration

| Old request | New request |
| --- | --- |
| `POST /api/create-order` | `POST /api/orders` |
| `POST /api/verify-payment` | `PUT /api/orders` |
| `GET /api/dashboard` | `GET /api/admin` |
| `POST /api/dashboard` | `POST /api/admin` |

`CheckoutModal` now uses the two `orders` methods. It continues to read raw response text before parsing JSON, so server errors and empty bodies cannot trigger a client-side JSON parsing exception.

## Response and deployment guarantees

- Every endpoint success and failure path returns a JSON response; former `204` empty responses were replaced with `{ "success": true }`.
- Razorpay keys remain server-only. The browser only uses `VITE_RAZORPAY_KEY_ID`.
- The retained R2 upload endpoint now uses the installed S3-compatible client and fails explicitly when its R2 environment variables are missing; it no longer returns a placeholder URL.
- The consolidated root `.env.example` is the sole server environment template; the duplicate `api/.env.example` was removed.
- With seven files in `api/`, this project is below Vercel Hobby's 12 Serverless Function limit while retaining its API capabilities.
