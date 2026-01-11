from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import APIKey


class APIKeysRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(self, user_id):
        res = await self.db.execute(select(APIKey).where(APIKey.user_id == user_id).order_by(APIKey.created_at.desc()))
        return list(res.scalars().all())

    async def get_for_user(self, user_id, api_key_id):
        res = await self.db.execute(select(APIKey).where(APIKey.user_id == user_id, APIKey.id == api_key_id))
        return res.scalar_one_or_none()

    async def get_by_hash(self, key_hash: str) -> APIKey | None:
        res = await self.db.execute(select(APIKey).where(APIKey.key_hash == key_hash))
        return res.scalar_one_or_none()

    async def create(self, *, user_id, key_hash: str, key_last4: str, name: str | None, permissions: dict, rate_limit: int, expires_at):
        k = APIKey(
            user_id=user_id,
            key_hash=key_hash,
            key_last4=key_last4,
            name=name,
            permissions=permissions,
            rate_limit=rate_limit,
            expires_at=expires_at,
        )
        self.db.add(k)
        await self.db.commit()
        await self.db.refresh(k)
        return k

    async def revoke(self, api_key: APIKey):
        api_key.revoked_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(api_key)
        return api_key

    async def touch_used(self, api_key: APIKey):
        api_key.last_used_at = datetime.now(timezone.utc)
        await self.db.commit()
        return api_key

