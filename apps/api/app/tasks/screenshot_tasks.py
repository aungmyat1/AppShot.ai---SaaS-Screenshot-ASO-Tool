import asyncio
import io
import json
from dataclasses import asdict
from datetime import datetime, timezone

import httpx
from PIL import Image
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import SessionLocal
from app.repositories.screenshots import ScreenshotsRepository
from app.storage.s3 import presign_get, upload_bytes
from app.tasks.celery_app import celery_app


async def _publish_progress(batch_id: str, payload: dict):
    if not settings.REDIS_URL:
        return
    try:
        r = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        await r.publish(f"progress:{batch_id}", json.dumps(payload))
        await r.close()
    except Exception:
        return


async def _download(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if ct and "image" not in ct:
            raise RuntimeError("Not an image response")
        content = r.content
        if len(content) < 1024:
            raise RuntimeError("Image too small")
        return content


def _to_webp_and_thumb(image_bytes: bytes) -> tuple[bytes, bytes, dict]:
    im = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    meta = {"width": im.width, "height": im.height, "format": "webp"}

    out_webp = io.BytesIO()
    im.save(out_webp, format="WEBP", quality=85, method=6)

    thumb = im.copy()
    thumb.thumbnail((512, 512))
    out_thumb = io.BytesIO()
    thumb.save(out_thumb, format="WEBP", quality=80, method=6)

    return out_webp.getvalue(), out_thumb.getvalue(), meta


@celery_app.task(name="process_screenshot", autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def process_screenshot(screenshot_id: str, batch_id: str | None = None, idx: int | None = None):
    """
    Download -> optimize (WebP) -> thumbnail -> upload -> update DB.
    Publishes progress events to Redis pubsub if configured.
    """

    async def _run():
        async with SessionLocal() as db:  # type: AsyncSession
            repo = ScreenshotsRepository(db)
            s = await repo.update_status(screenshot_id, "PROCESSING")
            if not s:
                return

            try:
                raw = await _download(s.url)
                webp, thumb, meta = _to_webp_and_thumb(raw)

                prefix = f"screenshots/{s.user_id}/{s.id}"
                webp_key = f"{prefix}/image.webp"
                thumb_key = f"{prefix}/thumb.webp"
                upload_bytes(webp_key, webp, "image/webp")
                upload_bytes(thumb_key, thumb, "image/webp")

                # Presigned URLs for private buckets
                webp_url = settings.STORAGE_PUBLIC_BASE_URL and f"{settings.STORAGE_PUBLIC_BASE_URL.rstrip('/')}/{webp_key}" or presign_get(webp_key)
                thumb_url = settings.STORAGE_PUBLIC_BASE_URL and f"{settings.STORAGE_PUBLIC_BASE_URL.rstrip('/')}/{thumb_key}" or presign_get(thumb_key)

                # Persist to metadata column (meta is aliased to "metadata" in DB)
                s.meta = {**(s.meta or {}), **meta, "webp_key": webp_key, "thumb_key": thumb_key, "webp_url": webp_url, "thumb_url": thumb_url}  # type: ignore[attr-defined]
                s.status = "COMPLETE"
                await db.commit()

                if batch_id:
                    await _publish_progress(
                        batch_id,
                        {
                            "type": "screenshot.complete",
                            "screenshotId": str(s.id),
                            "idx": idx,
                            "ts": datetime.now(timezone.utc).isoformat(),
                        },
                    )
            except Exception as e:
                s.status = "FAILED"
                s.meta = {**(s.meta or {}), "error": str(e)}  # type: ignore[attr-defined]
                await db.commit()
                if batch_id:
                    await _publish_progress(
                        batch_id,
                        {
                            "type": "screenshot.failed",
                            "screenshotId": str(s.id),
                            "idx": idx,
                            "error": str(e),
                            "ts": datetime.now(timezone.utc).isoformat(),
                        },
                    )
                raise

    asyncio.run(_run())


@celery_app.task(name="cleanup_old_files")
def cleanup_old_files():
    # Placeholder: implement lifecycle rules at bucket level in production.
    return {"ok": True}


def enqueue_screenshot_processing(screenshot_id: str, *, batch_id: str | None = None, idx: int | None = None, priority: str = "normal"):
    """
    Priority queues: urgent | normal | low
    Dead-letter queue: dead (handled by Celery retry/max_retries + routing in infra)
    """
    try:
        process_screenshot.apply_async(args=[screenshot_id, batch_id, idx], queue=priority)
    except Exception:
        return

