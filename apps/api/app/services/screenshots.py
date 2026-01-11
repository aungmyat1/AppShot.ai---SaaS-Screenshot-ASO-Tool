from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.screenshots import ScreenshotsRepository


class ScreenshotsService:
    def __init__(self, db: AsyncSession):
        self.repo = ScreenshotsRepository(db)

    async def create(self, *, user_id, app_id: str, platform: str, url: str, metadata: dict):
        return await self.repo.create(user_id=user_id, app_id=app_id, platform=platform, url=url, metadata=metadata)

    async def list(self, user_id):
        return await self.repo.list_for_user(user_id)

    async def get(self, user_id, screenshot_id):
        return await self.repo.get_for_user(user_id, screenshot_id)

