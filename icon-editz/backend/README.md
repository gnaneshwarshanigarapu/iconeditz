# FastAPI migration boundary

This directory is additive. The Vercel functions in `../api` are still the production backend until the frontend API base URL is switched after parity testing.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

The first migrated vertical slice is `GET /api/products/{product_id}`. It preserves the storefront contract: `{ "success": true, "product": { ... } }` and returns a 404 product-not-found response without throwing.

Future modules must be added as a service, schema, and route module before their Vercel equivalent is retired. Secrets stay in this backend deployment only.
