from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.screenshots import ScreenshotCreate, ScreenshotOut
from app.services.screenshots import ScreenshotsService
from app.tasks.screenshot_tasks import enqueue_screenshot_processing

router = APIRouter(prefix="/screenshots", tags=["screenshots"])


@router.get("", response_model=list[ScreenshotOut])
async def list_screenshots(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await ScreenshotsService(db).list(user.id)


@router.post("", response_model=ScreenshotOut)
async def create_screenshot(payload: ScreenshotCreate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = await ScreenshotsService(db).create(
        user_id=user.id, app_id=payload.app_id, platform=payload.platform, url=payload.url, metadata=payload.metadata
    )
    enqueue_screenshot_processing(str(s.id))
    return s


@router.get("/{screenshot_id}", response_model=ScreenshotOut)
async def get_screenshot(screenshot_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = await ScreenshotsService(db).get(user.id, screenshot_id)
    if not s:
        from app.core.exceptions import http_error

        raise http_error(404, "Not found")
    return s

