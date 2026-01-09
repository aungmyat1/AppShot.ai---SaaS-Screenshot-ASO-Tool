import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ScreenshotCreate(BaseModel):
  app_id: str = Field(min_length=1, max_length=255)
  platform: str = Field(pattern="^(appstore|playstore)$")
  url: str = Field(min_length=8, max_length=2048)
  metadata: dict = Field(default_factory=dict)


class ScreenshotOut(BaseModel):
  id: uuid.UUID
  user_id: uuid.UUID
  app_id: str
  platform: str
  url: str
  metadata: dict
  status: str
  created_at: datetime

