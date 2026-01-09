import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ScreenshotCreate(BaseModel):
  model_config = {"populate_by_name": True}

  app_id: str = Field(min_length=1, max_length=255)
  platform: str = Field(pattern="^(appstore|playstore)$")
  url: str = Field(min_length=8, max_length=2048)
  meta: dict = Field(default_factory=dict, alias="metadata")


class ScreenshotOut(BaseModel):
  model_config = {"populate_by_name": True, "from_attributes": True}

  id: uuid.UUID
  user_id: uuid.UUID
  app_id: str
  platform: str
  url: str
  meta: dict = Field(alias="metadata")
  status: str
  created_at: datetime

