import asyncio
from time import perf_counter

from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router as api_v1
from app.api.v2.router import api_router as api_v2
from app.core.config import settings
from app.core.exceptions import AppError
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.websockets.manager import manager


def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, version="0.1.0")

    # Middleware
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    # Versioned APIs
    app.include_router(api_v1, prefix=settings.API_V1_PREFIX)
    app.include_router(api_v2, prefix=settings.API_V2_PREFIX)

    @app.exception_handler(AppError)
    async def app_error_handler(_req: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"error": exc.message})

    @app.get("/health", tags=["health"])
    def health():
        return {"ok": True}

    # Real-time updates (polls DB-less placeholder; suitable scaffold)
    @app.websocket("/api/v1/ws/jobs/{job_id}")
    async def ws_job_status(ws: WebSocket, job_id: str):
        topic = f"job:{job_id}"
        await manager.connect(topic, ws)
        try:
            # Simple heartbeat/poll loop. In production, broadcast on job events.
            while True:
                await manager.broadcast(topic, {"jobId": job_id, "status": "connected"})
                await asyncio.sleep(5)
        finally:
            manager.disconnect(topic, ws)

    # Usage log placeholder (demonstrates pattern)
    @app.middleware("http")
    async def timing_middleware(request: Request, call_next):
        start = perf_counter()
        resp = await call_next(request)
        _ = perf_counter() - start
        # TODO: persist UsageLog with AsyncSession in background task
        return resp

    return app


app = create_app()

