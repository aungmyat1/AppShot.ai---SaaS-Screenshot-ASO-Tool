## Kubernetes manifests (EKS-ready)

This folder contains plain Kubernetes YAML for:
- `apps/web` (Next.js)
- `apps/api` (FastAPI)
- Celery worker/beat
- Ingress (NGINX)
- HPA
- Monitoring namespace scaffold

### Apply

```bash
kubectl apply -f infrastructure/k8s/base
kubectl apply -f infrastructure/k8s/apps
kubectl apply -f infrastructure/k8s/ingress
```

### Secrets

Use a real secret manager in production (ExternalSecrets/SSM/Secrets Manager). The included `Secret` is a placeholder.

## Kubernetes (placeholder)

This folder is reserved for Kubernetes manifests (Helm/Kustomize/etc.).

