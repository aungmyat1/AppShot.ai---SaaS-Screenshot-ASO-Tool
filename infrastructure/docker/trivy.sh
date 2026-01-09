#!/usr/bin/env sh
set -eu

# Simple local container security scan (requires Trivy installed).
# Usage:
#   docker compose -f infrastructure/docker/docker-compose.staging.yml build
#   ./infrastructure/docker/trivy.sh

WEB_IMAGE="${WEB_IMAGE:-getappshots-web}"
API_IMAGE="${API_IMAGE:-getappshots-api}"

echo "Scanning images:"
echo " - ${WEB_IMAGE}"
echo " - ${API_IMAGE}"

trivy image --severity CRITICAL,HIGH --no-progress "${WEB_IMAGE}"
trivy image --severity CRITICAL,HIGH --no-progress "${API_IMAGE}"

