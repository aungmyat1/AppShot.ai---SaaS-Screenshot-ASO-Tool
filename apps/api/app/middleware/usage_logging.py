from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.db.session import SessionLocal
from app.models.usage_log import UsageLog


class UsageLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000.0

        # Only log versioned API endpoints
        path = request.url.path
        if not (path.startswith("/api/v1/") or path.startswith("/api/v2/")):
            return response

        user = getattr(request.state, "user", None)
        api_key = getattr(request.state, "api_key", None)
        if not user:
            return response

        async def _write():
            async with SessionLocal() as db:
                db.add(
                    UsageLog(
                        user_id=user.id,
                        api_key_id=getattr(api_key, "id", None),
                        endpoint=f"{request.method} {path}",
                        response_time=float(elapsed_ms),
                    )
                )
                await db.commit()

        # Fire and forget
        try:
            import asyncio

            asyncio.create_task(_write())
        except Exception:
            pass

        return response

