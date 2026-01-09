from __future__ import annotations

import json
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

_client: redis.Redis | None = None


def get_redis_client() -> redis.Redis | None:
    global _client
    if not settings.REDIS_URL:
        return None
    if _client is None:
        _client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    return _client


async def cache_get_json(key: str) -> Any | None:
    client = get_redis_client()
    if not client:
        return None
    try:
        raw = await client.get(key)
        if not raw:
            return None
        return json.loads(raw)
    except Exception:
        return None


async def cache_set_json(key: str, value: Any, ttl_seconds: int = 3600) -> None:
    client = get_redis_client()
    if not client:
        return
    try:
        await client.setex(key, ttl_seconds, json.dumps(value))
    except Exception:
        return

