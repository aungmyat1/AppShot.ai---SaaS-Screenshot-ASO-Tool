#!/usr/bin/env sh
# Trigger Vercel deployment via Deploy Hook URL (no secrets in repo).
# Set VERCEL_DEPLOY_HOOK_PREVIEW and/or VERCEL_DEPLOY_HOOK_PRODUCTION in env or GitHub Secrets.
# Usage: ./scripts/deploy-hook.sh [preview|production]

set -e

TARGET="${1:-}"

case "$TARGET" in
  preview)
    URL="${VERCEL_DEPLOY_HOOK_PREVIEW:?Set VERCEL_DEPLOY_HOOK_PREVIEW}"
    echo "Triggering preview deployment..."
    ;;
  production)
    URL="${VERCEL_DEPLOY_HOOK_PRODUCTION:?Set VERCEL_DEPLOY_HOOK_PRODUCTION}"
    echo "Triggering production deployment..."
    ;;
  *)
    echo "Usage: $0 preview|production"
    echo "  preview     - uses VERCEL_DEPLOY_HOOK_PREVIEW"
    echo "  production  - uses VERCEL_DEPLOY_HOOK_PRODUCTION"
    echo "Never commit hook URLs; use Vercel env vars or GitHub Secrets."
    exit 1
    ;;
esac

curl -fsS -X POST "$URL" && echo "Deploy hook sent." || { echo "Request failed."; exit 1; }
