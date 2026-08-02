from typing import Any
from uuid import UUID

from app.services.supabase import get_supabase

PRODUCT_DETAIL_COLUMNS = (
    "id,title,description,price,discount_price,thumbnail_path,demo_video,"
    "category,published,status,features,tags,screenshots"
)


class ProductService:
    """Product persistence boundary; API routes do not access Supabase directly."""

    def get_by_id(self, product_id: UUID) -> tuple[dict[str, Any] | None, Any | None]:
        try:
            response = (
                get_supabase()
                .table("products")
                .select(PRODUCT_DETAIL_COLUMNS)
                .eq("id", str(product_id))
                .maybe_single()
                .execute()
            )
            data = response.data
            if data:
                data["thumbnail"] = data.get("thumbnail_path")
            return data, None
        except Exception as error:  # Supabase Python raises API errors on execute.
            return None, error
