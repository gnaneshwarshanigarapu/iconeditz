"""Canonical response envelopes used by migrated FastAPI endpoints."""

from typing import Any

from fastapi.responses import JSONResponse


def success(data: Any = None, *, status_code: int = 200, **extra: Any) -> JSONResponse:
    payload: dict[str, Any] = {"success": True}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return JSONResponse(status_code=status_code, content=payload)


def failure(message: str, *, status_code: int, code: str, details: Any = None) -> JSONResponse:
    payload: dict[str, Any] = {"success": False, "error": message, "code": code}
    if details is not None:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)
