from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.screenshot import Screenshot


class ScreenshotsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(self, user_id):
        res = await self.db.execute(select(Screenshot).where(Screenshot.user_id == user_id).order_by(Screenshot.created_at.desc()))
        return list(res.scalars().all())

    async def get_for_user(self, user_id, screenshot_id):
        res = await self.db.execute(select(Screenshot).where(Screenshot.user_id == user_id, Screenshot.id == screenshot_id))
        return res.scalar_one_or_none()

    async def create(self, *, user_id, app_id: str, platform: str, url: str, metadata: dict) -> Screenshot:
        s = Screenshot(user_id=user_id, app_id=app_id, platform=platform, url=url, meta=metadata, status="QUEUED")
        self.db.add(s)
        await self.db.commit()
        await self.db.refresh(s)
        return s

    async def update_status(self, screenshot_id, status: str):
        res = await self.db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
        s = res.scalar_one_or_none()
        if not s:
            return None
        s.status = status
        await self.db.commit()
        await self.db.refresh(s)
        return s

