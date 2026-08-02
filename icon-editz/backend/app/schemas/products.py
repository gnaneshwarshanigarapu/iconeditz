from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class Product(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    title: str
    description: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    thumbnail_path: str | None = None
    thumbnail: str | None = None
    demo_video: str | None = None
    category: str | None = None
    published: bool
    status: str
    features: list[Any] = []
    tags: list[str] = []
    screenshots: list[Any] = []


class ProductResponse(BaseModel):
    success: bool = True
    product: Product


class ApiError(BaseModel):
    success: bool = False
    error: str
    details: dict[str, Any] | None = None
