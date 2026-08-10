"""Vercel FastAPI service entrypoint.

Vercel's FastAPI preset looks for an ASGI `app` in main.py at the service root.
The actual application lives in app/main.py.
"""

from app.main import app

__all__ = ["app"]
