import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: str
    subscription_tier: str
    created_at: datetime


class UserUpdate(BaseModel):
    role: str | None = None
    subscription_tier: str | None = None

