"""Storage abstraction. Local assets remain the default during migration."""

from abc import ABC, abstractmethod
from pathlib import Path

from app.config import get_settings


class StorageService(ABC):
    @abstractmethod
    def public_url(self, key: str) -> str: ...


class LocalStorageProvider(StorageService):
    def public_url(self, key: str) -> str:
        return f"/assets/{key.lstrip('/')}"


class R2StorageProvider(StorageService):
    def __init__(self, public_url: str) -> None:
        self.public_url_base = public_url.rstrip("/")

    def public_url(self, key: str) -> str:
        return f"{self.public_url_base}/{key.lstrip('/')}"


def get_storage() -> StorageService:
    settings = get_settings()
    # R2 is opt-in until deployment configuration and object migration are complete.
    return R2StorageProvider(settings.r2_public_url) if settings.r2_public_url else LocalStorageProvider()
