from fastapi import APIRouter

router = APIRouter(prefix="/developer", tags=["developer"])


@router.get("/examples")
def examples():
    return {
        "curl": """curl -H "X-API-Key: <YOUR_KEY>" https://api.getappshots.com/api/v1/screenshots""",
        "python": """import requests\nr = requests.get("https://api.getappshots.com/api/v1/screenshots", headers={"X-API-Key": "<YOUR_KEY>"})\nprint(r.json())""",
        "js": """const r = await fetch("https://api.getappshots.com/api/v1/screenshots", { headers: { "X-API-Key": "<YOUR_KEY>" } });\nconsole.log(await r.json());""",
    }

