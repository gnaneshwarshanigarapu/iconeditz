from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend-only configuration loaded from the environment."""

    supabase_url: str
    supabase_service_role_key: str
    frontend_origins: str = "http://localhost:5173"
    r2_public_url: str = ""
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    def validate_startup(self) -> None:
        # Pydantic validates required Supabase values when Settings is created.
        if not self.cors_origins:
            raise ValueError("FRONTEND_ORIGINS must contain at least one origin")


@lru_cache
def get_settings() -> Settings:
    return Settings()
