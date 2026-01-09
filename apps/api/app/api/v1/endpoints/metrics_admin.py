from fastapi import APIRouter, Depends

from app.api.deps import require_roles
from app.monitoring.metrics import metrics

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics")
async def get_metrics(_: object = Depends(require_roles("admin"))):
    return metrics.snapshot()

