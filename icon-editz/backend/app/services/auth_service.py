"""Supabase JWT validation for FastAPI endpoints."""

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException

from app.services.supabase import get_supabase


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None
    role: str


def _token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    return authorization.split(" ", 1)[1].strip()


async def current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    response = get_supabase().auth.get_user(_token(authorization))
    user = response.user
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    metadata = user.app_metadata or {}
    profile = user.user_metadata or {}
    return AuthenticatedUser(id=str(user.id), email=user.email, role=metadata.get("role") or profile.get("role") or "customer")


async def require_admin(user: AuthenticatedUser = Depends(current_user)) -> AuthenticatedUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
