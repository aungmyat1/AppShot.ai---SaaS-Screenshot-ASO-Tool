from celery import Celery

from app.core.config import settings

broker = settings.CELERY_BROKER_URL or settings.REDIS_URL or "redis://localhost:6379/0"
backend = settings.CELERY_RESULT_BACKEND or settings.REDIS_URL or "redis://localhost:6379/0"

celery_app = Celery("getappshots", broker=broker, backend=backend)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
)

