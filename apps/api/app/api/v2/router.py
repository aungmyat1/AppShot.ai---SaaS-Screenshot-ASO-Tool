from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/health", tags=["health"])
def health():
    return {"ok": True, "version": "v2"}

