from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.cache.redis import get_redis_client
from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple fixed-window rate limiter.
    - Uses Redis if configured; falls back to in-memory per-process counters.
    - Keyed by (ip, endpoint, minute).
    """

    def __init__(self, app, requests_per_minute: int | None = None):
        super().__init__(app)
        self.rpm = requests_per_minute or settings.DEFAULT_RATE_LIMIT_PER_MINUTE
        self._mem: dict[str, tuple[int, float]] = {}  # key -> (count, expires_at)

    async def dispatch(self, request: Request, call_next):
        # Skip docs/static
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        minute = int(time.time() // 60)
        key = f"rl:{ip}:{request.method}:{request.url.path}:{minute}"

        allowed = await self._allow(key)
        if not allowed:
            return Response("Too Many Requests", status_code=429)
        return await call_next(request)

    async def _allow(self, key: str) -> bool:
        r = get_redis_client()
        if r:
            try:
                n = await r.incr(key)
                if n == 1:
                    await r.expire(key, 70)
                return n <= self.rpm
            except Exception:
                # Redis down => fall back to memory
                pass

        now = time.time()
        count, exp = self._mem.get(key, (0, now + 70))
        if now > exp:
            count, exp = 0, now + 70
        count += 1
        self._mem[key] = (count, exp)
        return count <= self.rpm

