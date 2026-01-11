## Docker

This folder provides **production-ready multi-stage Dockerfiles** and **compose setups** for dev and staging.

### Development (hot reload)

From repo root:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

Services:
- `web` (Next.js) on `3000`
- `api` (FastAPI) on `8000`
- `celery-worker`, `celery-beat`
- `postgres` on `5432`
- `redis` on `6379`

### Staging (production-like)

```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml up --build
```

### Trivy scan (optional)

If you have Trivy installed:

```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml build
chmod +x infrastructure/docker/trivy.sh
./infrastructure/docker/trivy.sh
```

