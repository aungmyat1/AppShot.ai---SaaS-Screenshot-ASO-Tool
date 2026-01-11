## GetAppShots API (FastAPI)

This is an optional companion backend service for the monorepo. The main product can run fully inside `apps/web` (Next.js route handlers), but FastAPI is useful for:
- background scraping workers
- long-running jobs
- integrations not suited for serverless limits

### Run locally

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

