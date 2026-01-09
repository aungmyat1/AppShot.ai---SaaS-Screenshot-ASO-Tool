import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal
from app.repositories.screenshots import ScreenshotsRepository
from app.tasks.celery_app import celery_app


@celery_app.task(name="process_screenshot")
def process_screenshot(screenshot_id: str):
    """
    Celery entrypoint (sync function). It runs async DB updates in an event loop.
    In a real system, this would download/process/store screenshots.
    """

    async def _run():
        async with SessionLocal() as db:  # type: AsyncSession
            repo = ScreenshotsRepository(db)
            await repo.update_status(screenshot_id, "PROCESSING")
            # TODO: real screenshot processing pipeline
            await asyncio.sleep(1)
            await repo.update_status(screenshot_id, "COMPLETE")

    asyncio.run(_run())


def enqueue_screenshot_processing(screenshot_id: str):
    """
    Enqueue via Celery if configured; otherwise no-op (keeps API usable in dev).
    """
    try:
        process_screenshot.delay(screenshot_id)
    except Exception:
        return

