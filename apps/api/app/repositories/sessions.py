from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import Session


class SessionsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        *,
        user_id,
        refresh_token_hash: str,
        expires_at: datetime,
        ip: str | None,
        user_agent: str | None,
        device_fingerprint: str | None,
    ) -> Session:
        s = Session(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
            ip=ip,
            user_agent=user_agent,
            device_fingerprint=device_fingerprint,
        )
        self.db.add(s)
        await self.db.commit()
        await self.db.refresh(s)
        return s

    async def get_by_refresh_hash(self, refresh_token_hash: str) -> Session | None:
        res = await self.db.execute(select(Session).where(Session.refresh_token_hash == refresh_token_hash))
        return res.scalar_one_or_none()

    async def revoke(self, session: Session):
        session.revoked_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(session)
        return session

