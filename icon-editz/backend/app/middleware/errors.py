"""Consistent, non-sensitive API error responses."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(status_code=422, content={"success": False, "error": "Invalid request data", "code": "VALIDATION_ERROR", "details": exc.errors()}, headers={"X-Request-ID": getattr(request.state, "request_id", "")})

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, _exc: Exception) -> JSONResponse:
        # Detailed errors stay in platform logs; clients receive no secrets.
        return JSONResponse(status_code=500, content={"success": False, "error": "Internal server error", "code": "INTERNAL_ERROR"}, headers={"X-Request-ID": getattr(request.state, "request_id", "")})
