from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import get_settings
from app.middleware.errors import install_error_handlers
from app.middleware.request_id import RequestIdMiddleware
from app.services.storage import get_storage
from app.services.supabase import get_supabase
from app.utils.logger import logger
from app.utils.responses import failure, success

settings = get_settings()
settings.validate_startup()

app = FastAPI(title="Icon Editz API", version="0.1.0")
install_error_handlers(app)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")


@app.get("/health")
def health():
    return success({"status": "ok", "service": "icon-editz-api", "environment": settings.environment})


@app.get("/ready")
def ready():
    checks = {"environment": True, "storage": False, "supabase": False}
    try:
        get_storage().public_url("health-check")
        checks["storage"] = True
        get_supabase().table("products").select("id").limit(1).execute()
        checks["supabase"] = True
    except Exception:
        logger.warning("Readiness check failed")
    if not all(checks.values()):
        return failure("Service is not ready", status_code=503, code="NOT_READY", details=checks)
    return success({"status": "ready", "checks": checks})
