from celery import Celery
from celery.schedules import crontab
from kombu import Exchange, Queue

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

# Queues / priorities
celery_app.conf.task_queues = (
    Queue("urgent", Exchange("urgent"), routing_key="urgent"),
    Queue("normal", Exchange("normal"), routing_key="normal"),
    Queue("low", Exchange("low"), routing_key="low"),
    Queue("dead", Exchange("dead"), routing_key="dead"),
)
celery_app.conf.task_default_queue = "normal"
celery_app.conf.task_default_exchange = "normal"
celery_app.conf.task_default_routing_key = "normal"

# Scheduled jobs (cron)
celery_app.conf.beat_schedule = {
    "cleanup-old-screenshots": {
        "task": "cleanup_old_files",
        "schedule": crontab(minute=0, hour=3),  # daily 03:00
    }
}

