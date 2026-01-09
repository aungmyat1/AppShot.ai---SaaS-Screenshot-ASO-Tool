## Docker (local dev)

This folder provides Docker files and a compose setup for local development.

### Start services

From repo root:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```

Services:
- `web`: Next.js app (`apps/web`) on port `3000`
- `api`: FastAPI (`apps/api`) on port `8000`
- `postgres`: Postgres on `5432`
- `redis`: Redis on `6379`

