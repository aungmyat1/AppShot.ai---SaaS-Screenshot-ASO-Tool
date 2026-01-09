from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_token import EmailVerificationToken
from app.models.password_reset_token import PasswordResetToken


class TokensRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_email_verification(self, *, user_id, token_hash: str, expires_at):
        t = EmailVerificationToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self.db.add(t)
        await self.db.commit()
        await self.db.refresh(t)
        return t

    async def get_email_verification(self, token_hash: str):
        res = await self.db.execute(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash))
        return res.scalar_one_or_none()

    async def mark_email_used(self, token):
        from datetime import datetime, timezone

        token.used_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def create_password_reset(self, *, user_id, token_hash: str, expires_at):
        t = PasswordResetToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self.db.add(t)
        await self.db.commit()
        await self.db.refresh(t)
        return t

    async def get_password_reset(self, token_hash: str):
        res = await self.db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
        return res.scalar_one_or_none()

    async def mark_reset_used(self, token):
        from datetime import datetime, timezone

        token.used_at = datetime.now(timezone.utc)
        await self.db.commit()

