from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import http_error
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.users import UsersRepository


class AuthService:
    def __init__(self, db: AsyncSession):
        self.users = UsersRepository(db)

    async def register(self, *, email: str, password: str):
        existing = await self.users.get_by_email(email)
        if existing:
            raise http_error(409, "Email already registered")
        user = await self.users.create(email=email, password_hash=hash_password(password))
        token = create_access_token(str(user.id), extra_claims={"role": user.role})
        return user, token

    async def login(self, *, email: str, password: str):
        user = await self.users.get_by_email(email)
        if not user:
            raise http_error(401, "Invalid credentials")
        if not verify_password(password, user.password_hash):
            raise http_error(401, "Invalid credentials")
        token = create_access_token(str(user.id), extra_claims={"role": user.role})
        return user, token

