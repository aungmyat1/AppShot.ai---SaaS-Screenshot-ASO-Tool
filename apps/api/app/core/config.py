from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "GetAppShots API"
    API_V1_PREFIX: str = "/api/v1"
    API_V2_PREFIX: str = "/api/v2"

    # Security
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # DB
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/getappshots"

    # Redis (optional)
    REDIS_URL: str | None = None

    # Rate limiting
    DEFAULT_RATE_LIMIT_PER_MINUTE: int = 60

    # Celery
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None


settings = Settings()

