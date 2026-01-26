#!/bin/bash
# GitHub Branch Protection Configuration Script (Bash)
# This script configures branch protection rules using GitHub CLI
# 
# Prerequisites:
#   1. Install GitHub CLI: https://cli.github.com/
#   2. Authenticate: gh auth login
#
# Usage:
#   ./scripts/configure-branch-protection.sh
#   ./scripts/configure-branch-protection.sh main
#   ./scripts/configure-branch-protection.sh staging
#   ./scripts/configure-branch-protection.sh develop
#   ./scripts/configure-branch-protection.sh all

set -e

REPO_OWNER="aungmyat1"
REPO_NAME="AppShot.ai---SaaS-Screenshot-ASO-Tool"
BRANCH="${1:-all}"

# Function to configure branch protection
configure_branch() {
    local branch_name=$1
    local required_approvals=$2
    local require_code_owners=$3
    local require_linear_history=$4
    local enforce_admins=$5
    shift 5
    local status_checks=("$@")
    
    echo ""
    echo "🔒 Configuring branch protection for: $branch_name"
    
    # Build status checks JSON array
    local contexts_json="["
    local first=true
    for check in "${status_checks[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            contexts_json+=","
        fi
        contexts_json+="\"$check\""
    done
    contexts_json+="]"
    
    # Build required status checks JSON
    local required_status_checks="{\"strict\":true,\"contexts\":$contexts_json}"
    
    # Build required PR reviews JSON
    local require_code_owners_str="false"
    if [ "$require_code_owners" = "true" ]; then
        require_code_owners_str="true"
    fi
    
    local required_pr_reviews="{\"required_approving_review_count\":$required_approvals,\"dismiss_stale_reviews\":true,\"require_code_owner_reviews\":$require_code_owners_str}"
    
    # Build enforce admins string
    local enforce_admins_str="false"
    if [ "$enforce_admins" = "true" ]; then
        enforce_admins_str="true"
    fi
    
    # Build require linear history string
    local require_linear_history_str="false"
    if [ "$require_linear_history" = "true" ]; then
        require_linear_history_str="true"
    fi
    
    # Execute the API call
    gh api "repos/$REPO_OWNER/$REPO_NAME/branches/$branch_name/protection" \
        --method PUT \
        --field "required_status_checks=$required_status_checks" \
        --field "enforce_admins=$enforce_admins_str" \
        --field "required_pull_request_reviews=$required_pr_reviews" \
        --field "restrictions=null" \
        --field "required_linear_history=$require_linear_history_str" \
        --field "allow_force_pushes=false" \
        --field "allow_deletions=false"
    
    echo "✅ Successfully configured protection for $branch_name"
}

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed."
    echo ""
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo ""
    echo "Authenticate with: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Configure main branch
if [ "$BRANCH" = "all" ] || [ "$BRANCH" = "main" ]; then
    configure_branch "main" 2 true true true \
        "Web • lint / typecheck / unit tests" \
        "API • black / pylint / mypy / pytest" \
        "API • integration smoke (uvicorn + /health)" \
        "Web • E2E (Playwright)" \
        "Security • dependency and secret scanning"
fi

# Configure staging branch
if [ "$BRANCH" = "all" ] || [ "$BRANCH" = "staging" ]; then
    configure_branch "staging" 1 false false false \
        "Web • lint / typecheck / unit tests" \
        "API • black / pylint / mypy / pytest" \
        "Web • E2E (Playwright)"
fi

# Configure develop branch
if [ "$BRANCH" = "all" ] || [ "$BRANCH" = "develop" ]; then
    configure_branch "develop" 1 false false false \
        "Web • lint / typecheck / unit tests" \
        "API • black / pylint / mypy / pytest"
fi

echo ""
echo "✅ Configuration complete!"
