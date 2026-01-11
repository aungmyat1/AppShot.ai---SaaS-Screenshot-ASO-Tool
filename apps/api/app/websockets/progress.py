from __future__ import annotations

import asyncio
import json

import redis.asyncio as redis
from fastapi import WebSocket

from app.core.config import settings


async def stream_progress(ws: WebSocket, channel: str):
    """
    Streams Redis pub/sub messages to the websocket.
    Celery workers publish to `progress:<batch_id>`.
    """
    await ws.accept()
    if not settings.REDIS_URL:
        await ws.send_json({"error": "REDIS_URL not configured"})
        await ws.close()
        return

    r = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe(channel)
    try:
        while True:
            msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=5.0)
            if msg and msg.get("data"):
                try:
                    await ws.send_json(json.loads(msg["data"]))
                except Exception:
                    # best-effort
                    pass
            await asyncio.sleep(0.1)
    finally:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
            await r.close()
        except Exception:
            pass

