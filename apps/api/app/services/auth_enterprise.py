from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pyotp
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import http_error
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.sessions import SessionsRepository
from app.repositories.tokens import TokensRepository
from app.repositories.users import UsersRepository
from app.utils.tokens import new_token, sha256_hex


class EnterpriseAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UsersRepository(db)
        self.sessions = SessionsRepository(db)
        self.tokens = TokensRepository(db)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _refresh_exp(self) -> datetime:
        return self._now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    async def register(self, *, email: str, password: str) -> tuple[User, str]:
        existing = await self.users.get_by_email(email)
        if existing:
            raise http_error(409, "Email already registered")
        user = await self.users.create(email=email, password_hash=hash_password(password))
        # Issue email verification token
        await self.issue_email_verification(user)
        token = create_access_token(str(user.id), extra_claims={"role": user.role})
        return user, token

    async def issue_email_verification(self, user: User) -> str:
        raw = new_token()
        token_hash = sha256_hex(raw)
        expires_at = self._now() + timedelta(hours=24)
        await self.tokens.create_email_verification(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
        # TODO: send email via provider; for now log.
        # eslint-disable-next-line: not available; keep print
        print(f"[email-verification] user={user.email} token={raw}")
        return raw

    async def verify_email(self, token: str) -> None:
        t = await self.tokens.get_email_verification(sha256_hex(token))
        if not t or t.used_at is not None or t.expires_at < self._now():
            raise http_error(400, "Invalid or expired token")
        user = await self.users.get_by_id(t.user_id)
        if not user:
            raise http_error(404, "User not found")
        user.email_verified = True
        await self.db.commit()
        await self.tokens.mark_email_used(t)

    async def request_password_reset(self, email: str) -> None:
        user = await self.users.get_by_email(email)
        if not user:
            return
        raw = new_token()
        token_hash = sha256_hex(raw)
        expires_at = self._now() + timedelta(minutes=30)
        await self.tokens.create_password_reset(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
        print(f"[password-reset] user={user.email} token={raw}")

    async def reset_password(self, token: str, new_password: str) -> None:
        t = await self.tokens.get_password_reset(sha256_hex(token))
        if not t or t.used_at is not None or t.expires_at < self._now():
            raise http_error(400, "Invalid or expired token")
        user = await self.users.get_by_id(t.user_id)
        if not user:
            raise http_error(404, "User not found")
        user.password_hash = hash_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        await self.db.commit()
        await self.tokens.mark_reset_used(t)

    async def login(
        self,
        *,
        email: str,
        password: str,
        ip: str | None,
        user_agent: str | None,
        device_fingerprint: str | None,
        totp_code: str | None,
    ) -> tuple[User, str, str]:
        user = await self.users.get_by_email(email)
        if not user:
            raise http_error(401, "Invalid credentials")

        if user.locked_until and user.locked_until > self._now():
            raise http_error(429, "Account temporarily locked. Try again later.")

        if not verify_password(password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.LOGIN_MAX_ATTEMPTS:
                user.locked_until = self._now() + timedelta(minutes=settings.LOGIN_LOCK_MINUTES)
            await self.db.commit()
            raise http_error(401, "Invalid credentials")

        if settings.REQUIRE_EMAIL_VERIFICATION and not user.email_verified:
            raise http_error(403, "Email not verified")

        if user.mfa_enabled:
            if not totp_code or not user.totp_secret:
                raise http_error(401, "MFA required")
            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(totp_code, valid_window=1):
                raise http_error(401, "Invalid MFA code")

        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = self._now()
        await self.db.commit()

        access = create_access_token(str(user.id), extra_claims={"role": user.role})

        refresh_raw = new_token()
        refresh_hash = sha256_hex(refresh_raw)
        await self.sessions.create(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            expires_at=self._refresh_exp(),
            ip=ip,
            user_agent=user_agent,
            device_fingerprint=device_fingerprint,
        )

        return user, access, refresh_raw

    async def refresh(self, refresh_token: str, device_fingerprint: str | None) -> tuple[str, str]:
        refresh_hash = sha256_hex(refresh_token)
        session = await self.sessions.get_by_refresh_hash(refresh_hash)
        if not session or session.revoked_at is not None or session.expires_at < self._now():
            raise http_error(401, "Invalid refresh token")

        user = await self.users.get_by_id(session.user_id)
        if not user:
            raise http_error(401, "Invalid refresh token")

        # Optional device binding
        if session.device_fingerprint and device_fingerprint and session.device_fingerprint != device_fingerprint:
            raise http_error(401, "Invalid refresh token")

        # Rotate refresh token
        await self.sessions.revoke(session)

        new_refresh = new_token()
        new_refresh_hash = sha256_hex(new_refresh)
        await self.sessions.create(
            user_id=user.id,
            refresh_token_hash=new_refresh_hash,
            expires_at=self._refresh_exp(),
            ip=session.ip,
            user_agent=session.user_agent,
            device_fingerprint=session.device_fingerprint,
        )

        access = create_access_token(str(user.id), extra_claims={"role": user.role})
        return access, new_refresh

    async def logout(self, refresh_token: str) -> None:
        refresh_hash = sha256_hex(refresh_token)
        session = await self.sessions.get_by_refresh_hash(refresh_hash)
        if not session:
            return
        await self.sessions.revoke(session)

    async def mfa_setup(self, user: User) -> tuple[str, str]:
        secret = pyotp.random_base32()
        issuer = "GetAppShots"
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name=issuer)
        user.totp_secret = secret
        await self.db.commit()
        return secret, uri

    async def mfa_enable(self, user: User, code: str) -> None:
        if not user.totp_secret:
            raise http_error(400, "MFA not initialized")
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):
            raise http_error(400, "Invalid code")
        user.mfa_enabled = True
        await self.db.commit()

    async def mfa_disable(self, user: User, code: str) -> None:
        if not user.totp_secret:
            raise http_error(400, "MFA not initialized")
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):
            raise http_error(400, "Invalid code")
        user.mfa_enabled = False
        user.totp_secret = None
        await self.db.commit()

