from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_principal
from app.db.session import get_db
from app.processing.scrapers import scrape_app_store, scrape_play_store
from app.services.screenshots import ScreenshotsService
from app.tasks.screenshot_tasks import enqueue_screenshot_processing

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/scrape")
async def scrape_and_enqueue(payload: dict, user=Depends(get_principal), db: AsyncSession = Depends(get_db)):
    """
    Input:
      { "platform": "appstore"|"playstore", "app_id": "<id or package>" }
    Output:
      { "batchId": "<synthetic>", "count": N, "screenshotIds": [...] }
    """
    platform = payload.get("platform")
    app_id = payload.get("app_id")
    if platform not in ("appstore", "playstore") or not app_id:
        from app.core.exceptions import http_error

        raise http_error(400, "Invalid payload")

    result = await (scrape_app_store(app_id) if platform == "appstore" else scrape_play_store(app_id))
    urls = result.screenshots[:30]
    batch_id = f"{platform}:{app_id}"

    svc = ScreenshotsService(db)
    ids = []
    for idx, url in enumerate(urls):
        s = await svc.create(user_id=user.id, app_id=app_id, platform=platform, url=url, metadata={"title": result.title, "developer": result.developer})
        ids.append(str(s.id))
        enqueue_screenshot_processing(str(s.id), batch_id=batch_id, idx=idx, priority="normal")

    return {"batchId": batch_id, "count": len(ids), "screenshotIds": ids}

