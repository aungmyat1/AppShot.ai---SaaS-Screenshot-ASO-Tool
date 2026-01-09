## Monorepo: GetAppShots

Workspace layout:

```text
apps/
  web/        Next.js 14 SaaS app (GetAppShots)
  api/        FastAPI backend (optional/companion service)
  admin/      Admin dashboard (placeholder)
packages/
  shared/     Shared JS utilities (placeholder)
  ui/         Component library (placeholder)
  types/      Shared TypeScript types (placeholder)
infrastructure/
  docker/     Dockerfiles + compose
  k8s/        Kubernetes manifests (placeholder)
  terraform/  Terraform modules (placeholder)
docs/
  AI_ASSISTANT_CONTEXT.md
```

### Run locally

- Web:

```bash
npm install
npm run web:dev
```

- API:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r apps/api/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

See `infrastructure/docker/README.md`.

