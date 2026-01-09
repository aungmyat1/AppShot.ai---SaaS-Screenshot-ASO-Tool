from fastapi import APIRouter

from app.api.v1.endpoints import api_keys, auth, auth_enterprise, developer, metrics_admin, screenshots, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(auth_enterprise.router)
api_router.include_router(users.router)
api_router.include_router(screenshots.router)
api_router.include_router(api_keys.router)
api_router.include_router(developer.router)
api_router.include_router(metrics_admin.router)

