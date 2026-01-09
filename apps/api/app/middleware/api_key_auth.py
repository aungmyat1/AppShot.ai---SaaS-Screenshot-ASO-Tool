from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import http_error
from app.db.session import SessionLocal
from app.repositories.api_keys import APIKeysRepository
from app.repositories.users import UsersRepository
from app.utils.tokens import sha256_hex
from app.cache.redis import get_redis_client


def tier_rpm(tier: str) -> int:
    tier = (tier or "free").lower()
    if tier == "enterprise":
        return 6000
    if tier == "pro":
        return 600
    return settings.DEFAULT_RATE_LIMIT_PER_MINUTE


class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """
    Enterprise-ish API key middleware:
    - validates X-API-Key
    - token-bucket rate limiting (Redis + fallback)
    - attaches request.state.user and request.state.api_key
    - sets rate limit headers
    """

    async def dispatch(self, request: Request, call_next):
        # Only enforce on versioned API routes (not docs/health)
        path = request.url.path
        if not path.startswith(settings.API_V1_PREFIX + "/") and not path.startswith(settings.API_V2_PREFIX + "/"):
            return await call_next(request)
        if path.startswith(settings.API_V1_PREFIX + "/auth") or path.startswith(settings.API_V1_PREFIX + "/authx"):
            return await call_next(request)

        raw_key = request.headers.get("x-api-key")
        if not raw_key:
            return await call_next(request)

        async with SessionLocal() as db:  # type: AsyncSession
            repo = APIKeysRepository(db)
            api_key = await repo.get_by_hash(sha256_hex(raw_key))
            if not api_key or api_key.revoked_at is not None:
                return Response("Invalid API key", status_code=401)
            if api_key.expires_at and api_key.expires_at < datetime.now(timezone.utc):
                return Response("API key expired", status_code=401)

            user = await UsersRepository(db).get_by_id(api_key.user_id)
            if not user:
                return Response("Invalid API key", status_code=401)

            # Token bucket: capacity is rpm (burst=1min), refill rpm per minute.
            rpm = min(api_key.rate_limit, tier_rpm(user.subscription_tier))
            allowed, remaining, reset = await token_bucket_allow(f"tb:{api_key.id}", rpm)
            if not allowed:
                resp = Response("Too Many Requests", status_code=429)
                resp.headers["X-RateLimit-Limit"] = str(rpm)
                resp.headers["X-RateLimit-Remaining"] = str(0)
                resp.headers["X-RateLimit-Reset"] = str(reset)
                resp.headers["Retry-After"] = str(max(0, reset - int(time.time())))
                return resp

            request.state.user = user
            request.state.api_key = api_key

            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(rpm)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset)
            await repo.touch_used(api_key)
            return response


async def token_bucket_allow(key: str, rpm: int) -> tuple[bool, int, int]:
    """
    Token bucket using Redis if available; fallback to in-memory fixed-window-ish bucket.
    Returns: (allowed, remaining_tokens, reset_epoch_seconds)
    """
    r = get_redis_client()
    now = time.time()
    capacity = max(1, rpm)
    refill_per_sec = rpm / 60.0
    reset = int(now + 60)

    if r:
        # Lua script for atomic refill + decrement
        lua = """
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local cap = tonumber(ARGV[2])
        local refill = tonumber(ARGV[3])

        local data = redis.call('HMGET', key, 'tokens', 'ts')
        local tokens = tonumber(data[1])
        local ts = tonumber(data[2])
        if tokens == nil then tokens = cap end
        if ts == nil then ts = now end

        local delta = math.max(0, now - ts)
        local new_tokens = math.min(cap, tokens + delta * refill)
        local allowed = 0
        if new_tokens >= 1 then
          allowed = 1
          new_tokens = new_tokens - 1
        end
        redis.call('HMSET', key, 'tokens', new_tokens, 'ts', now)
        redis.call('EXPIRE', key, 120)
        return {allowed, math.floor(new_tokens)}
        """
        try:
            allowed, remaining = await r.eval(lua, 1, key, now, capacity, refill_per_sec)
            return bool(allowed == 1), int(remaining), reset
        except Exception:
            pass

    # Fallback: naive per-process bucket
    if not hasattr(token_bucket_allow, "_mem"):
        token_bucket_allow._mem = {}  # type: ignore[attr-defined]
    mem = token_bucket_allow._mem  # type: ignore[attr-defined]
    tokens, ts = mem.get(key, (capacity, now))
    delta = max(0, now - ts)
    tokens = min(capacity, tokens + delta * refill_per_sec)
    allowed = tokens >= 1
    if allowed:
        tokens -= 1
    mem[key] = (tokens, now)
    return allowed, int(tokens), reset

