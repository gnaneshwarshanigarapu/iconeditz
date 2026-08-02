import logging
from uuid import UUID

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.products import ApiError, ProductResponse
from app.services.products import ProductService

router = APIRouter(prefix="/products", tags=["products"])
logger = logging.getLogger(__name__)
service = ProductService()


@router.get("/{product_id}", response_model=ProductResponse, responses={404: {"model": ApiError}, 500: {"model": ApiError}})
def get_product(product_id: UUID) -> ProductResponse | JSONResponse:
    """Compatibility contract for the storefront product-detail request."""
    logger.info("Requested product: %s", product_id)
    data, error = service.get_by_id(product_id)
    logger.info("Supabase data: %s", data)
    logger.info("Supabase error: %s", error)
    if error:
        logger.error("Supabase product query failed", exc_info=(type(error), error, error.__traceback__))
        return JSONResponse(status_code=500, content={"success": False, "error": str(error), "details": {"type": type(error).__name__, "message": str(error)}})
    if not data:
        return JSONResponse(status_code=404, content={"success": False, "error": "Product not found"})
    return ProductResponse(product=data)
