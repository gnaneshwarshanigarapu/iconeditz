"""Vercel Python entrypoint for the incremental FastAPI migration.

This endpoint is deliberately not yet configured as the `/api/*` catch-all.
The existing JavaScript serverless functions continue serving unmatched routes
until every module has FastAPI parity.
"""
import sys
from pathlib import Path

BACKEND_DIRECTORY = Path(__file__).resolve().parents[1] / "backend"
if str(BACKEND_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIRECTORY))

from app.main import app  # noqa: E402,F401
