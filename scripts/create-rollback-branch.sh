#!/usr/bin/env sh
# Create a separate branch at the commit BEFORE cc9fbcf (refactor: switch to npm ci).
# Usage: ./scripts/create-rollback-branch.sh
# Then: git push origin rollback/pre-npm-ci-refactor

set -e

COMMIT="${1:-cc9fbcf}"
BRANCH="rollback/pre-npm-ci-refactor"

echo "Creating branch '$BRANCH' at commit before $COMMIT..."
git branch "$BRANCH" "${COMMIT}^"
echo "Done. Branch '$BRANCH' points to state before the refactor commit."
echo ""
echo "To push:  git push origin $BRANCH"
echo "To use it: git checkout $BRANCH"
