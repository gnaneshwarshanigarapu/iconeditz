"""Single registration point for FastAPI API modules during migration."""

from fastapi import APIRouter

from app.api.products import router as products_router

api_router = APIRouter()
# Existing Products is the first migrated module. Future routers register here.
api_router.include_router(products_router, tags=["products"])
