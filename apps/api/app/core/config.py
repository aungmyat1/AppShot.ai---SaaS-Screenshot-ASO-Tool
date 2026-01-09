from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "GetAppShots API"
    API_V1_PREFIX: str = "/api/v1"
    API_V2_PREFIX: str = "/api/v2"

    # Security
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # OAuth (optional)
    OAUTH_GOOGLE_CLIENT_ID: str | None = None
    OAUTH_GOOGLE_CLIENT_SECRET: str | None = None
    OAUTH_GITHUB_CLIENT_ID: str | None = None
    OAUTH_GITHUB_CLIENT_SECRET: str | None = None
    OAUTH_REDIRECT_BASE_URL: str = "http://localhost:8000"

    # Security controls
    REQUIRE_EMAIL_VERIFICATION: bool = True
    LOGIN_MAX_ATTEMPTS: int = 8
    LOGIN_LOCK_MINUTES: int = 15

    # DB
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/getappshots"

    # Redis (optional)
    REDIS_URL: str | None = None

    # Screenshot pipeline
    STORAGE_ENDPOINT_URL: str | None = None
    STORAGE_REGION: str = "auto"
    STORAGE_BUCKET: str | None = None
    STORAGE_ACCESS_KEY_ID: str | None = None
    STORAGE_SECRET_ACCESS_KEY: str | None = None
    STORAGE_PUBLIC_BASE_URL: str | None = None
    PRESIGN_EXPIRES_SECONDS: int = 3600

    PIPELINE_MAX_SCREENSHOTS: int = 30

    # Rate limiting
    DEFAULT_RATE_LIMIT_PER_MINUTE: int = 60

    # Celery
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None


settings = Settings()

