from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UsersRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        res = await self.db.execute(select(User).where(User.email == email))
        return res.scalar_one_or_none()

    async def get_by_id(self, user_id) -> User | None:
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def create(self, *, email: str, password_hash: str, role: str = "user", subscription_tier: str = "free") -> User:
        u = User(email=email, password_hash=password_hash, role=role, subscription_tier=subscription_tier)
        self.db.add(u)
        await self.db.commit()
        await self.db.refresh(u)
        return u

