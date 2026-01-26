# Branch, Environment, and Protection Configuration

## Current Status

**Current Branch:** `main` (Production)  
**Repository:** `https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool.git`  
**Date:** January 26, 2026

---

## Branch Configuration Summary

### Branch → Environment Mapping

| Branch | Environment | Doppler Config | Vercel Env | Database | Stripe Mode | Auto-Deploy |
|--------|-------------|---------------|------------|----------|-------------|-------------|
| `main` | Production | `production` | Production | Prod DB | Live | ✅ Yes |
| `staging` | Staging | `preview` | Preview | Staging DB | Test | ✅ Yes |
| `develop` | Development | `development` | Development | Dev DB | Test | ✅ Yes |
| `feature/*` | Development | `development` | Development | Dev DB | Test | ❌ Manual |
| `bugfix/*` | Development | `development` | Development | Dev DB | Test | ❌ Manual |
| `hotfix/*` | Production | `production` | Production | Prod DB | Live | ❌ Manual |
| `release/*` | Staging | `preview` | Preview | Staging DB | Test | ❌ Manual |

---

## Environment Variables Configuration

### Production Environment (main branch) - REQUIRED

Since you're on the `main` branch, ensure these production environment variables are configured:

#### Database
```bash
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/getappshots_prod?sslmode=require
DATABASE_URL_ASYNC=postgresql+asyncpg://prod-user:prod-pass@prod-host:5432/getappshots_prod
```

#### Authentication (Clerk) - Production Keys
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### Payments (Stripe) - Live Mode
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_STARTER=price_...
```

#### Storage (Cloudflare R2) - Production
```bash
R2_ACCOUNT_ID=prod-account-id
R2_BUCKET_NAME=getappshots-prod
R2_ACCESS_KEY_ID=prod-access-key
R2_SECRET_ACCESS_KEY=prod-secret-key
STORAGE_ENDPOINT_URL=https://account-id.r2.cloudflarestorage.com
STORAGE_BUCKET=getappshots-prod
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=prod-access-key
STORAGE_SECRET_ACCESS_KEY=prod-secret-key
STORAGE_PUBLIC_BASE_URL=https://cdn.getappshots.com
```

#### Application Configuration
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://getappshots.com
API_URL=https://api.getappshots.com
PORT=3000
```

#### Security
```bash
JWT_SECRET_KEY=<strong-random-secret-32-chars-min>
CORS_ORIGINS=https://getappshots.com,https://www.getappshots.com
```

#### Optional (Recommended)
```bash
REDIS_URL=redis://prod-redis-host:6379/0
SENTRY_DSN=https://...@sentry.io/...
ANALYTICS_ID=...
LOG_LEVEL=info
```

### Verify Environment Variables

**Quick Verification (All-in-One):**
```bash
# Run all verification checks
npm run branch:env:verify

# Run verification and sync production environment
npm run branch:env:verify:sync
```

**Manual Step-by-Step Verification:**
```bash
# Check current branch
git branch --show-current

# Verify environment variables (if using Doppler)
npm run env:check:doppler

# Sync production environment variables from Doppler to Vercel
npm run env:sync:prod

# Check Clerk configuration
npm run env:check:clerk
```

**What the verification script checks:**
- ✅ Current git branch and environment mapping
- ✅ Doppler integration status
- ✅ Clerk configuration
- ✅ Optional: Production environment sync (with `--sync` flag)

---

## GitHub Branch Protection Rules

### Main Branch Protection (Production) - CRITICAL

**Branch Pattern:** `main`

#### Required Settings:

1. **Require pull request reviews before merging**
   - ✅ Enable
   - **Required number of reviewers:** `2` (recommended for production)
   - ✅ Require approval from code owners (if CODEOWNERS file exists)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners

2. **Require status checks to pass before merging**
   - ✅ Enable
   - ✅ Require branches to be up to date before merging
   - **Required status checks:**
     - `Web • lint / typecheck / unit tests`
     - `API • black / pylint / mypy / pytest`
     - `API • integration smoke (uvicorn + /health)`
     - `Web • E2E (Playwright)`
     - `Security • dependency and secret scanning` (optional but recommended)

3. **Require conversation resolution before merging**
   - ✅ Enable

4. **Require signed commits**
   - ✅ Enable (recommended for production)

5. **Require linear history**
   - ✅ Enable (prevents merge commits, enforces rebase/squash)

6. **Restrict who can push to matching branches**
   - ✅ Enable
   - Restrict to: Repository administrators and specific teams/users

7. **Do not allow bypassing the above settings**
   - ✅ Include administrators

8. **Allow force pushes**
   - ❌ Disable

9. **Allow deletions**
   - ❌ Disable

10. **Lock branch**
    - ❌ Disable (unless emergency maintenance)

---

### Develop Branch Protection (Development)

**Branch Pattern:** `develop`

#### Required Settings:

1. **Require pull request reviews before merging**
   - ✅ Enable
   - **Required number of reviewers:** `1`
   - ✅ Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - ✅ Enable
   - ✅ Require branches to be up to date before merging
   - **Required status checks:**
     - `Web • lint / typecheck / unit tests`
     - `API • black / pylint / mypy / pytest`

3. **Require conversation resolution before merging**
   - ✅ Enable

4. **Do not allow bypassing the above settings**
   - ⚠️ Optional: Allow administrators to bypass (for faster development)

5. **Allow force pushes**
   - ❌ Disable

6. **Allow deletions**
   - ❌ Disable

---

### Staging Branch Protection

**Branch Pattern:** `staging`

#### Required Settings:

1. **Require pull request reviews before merging**
   - ✅ Enable
   - **Required number of reviewers:** `1`
   - ✅ Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - ✅ Enable
   - ✅ Require branches to be up to date before merging
   - **Required status checks:**
     - `Web • lint / typecheck / unit tests`
     - `API • black / pylint / mypy / pytest`
     - `Web • E2E (Playwright)`

3. **Require conversation resolution before merging**
   - ✅ Enable

4. **Do not allow bypassing the above settings**
   - ⚠️ Optional: Allow administrators to bypass

5. **Allow force pushes**
   - ❌ Disable

6. **Allow deletions**
   - ❌ Disable

---

## How to Configure Branch Protection

### Option 1: GitHub Web Interface (Recommended)

1. Navigate to your repository: `https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`
2. Go to **Settings** → **Branches**
3. Click **Add rule** or edit existing rule
4. Enter branch name pattern (e.g., `main`, `develop`, `staging`)
5. Configure settings as outlined above
6. Click **Create** or **Save changes**

### Option 2: GitHub CLI (gh)

```bash
# Install GitHub CLI if not installed
# https://cli.github.com/

# Login
gh auth login

# Configure main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Web • lint / typecheck / unit tests","API • black / pylint / mypy / pytest","API • integration smoke (uvicorn + /health)","Web • E2E (Playwright)"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Configure develop branch protection
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Web • lint / typecheck / unit tests","API • black / pylint / mypy / pytest"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Configure staging branch protection
gh api repos/:owner/:repo/branches/staging/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Web • lint / typecheck / unit tests","API • black / pylint / mypy / pytest","Web • E2E (Playwright)"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

**Note:** Replace `:owner` with `aungmyat1` and `:repo` with `AppShot.ai---SaaS-Screenshot-ASO-Tool`

### Option 3: Terraform (Infrastructure as Code)

If you're using Terraform for infrastructure, you can manage branch protection via the `github_branch_protection` resource.

---

## CI/CD Status Checks Reference

Based on your `.github/workflows/ci.yml`, these are the available status checks:

| Job Name | Description | Required For |
|----------|-------------|--------------|
| `Web • lint / typecheck / unit tests` | Web app linting, type checking, and unit tests | main, staging, develop |
| `API • black / pylint / mypy / pytest` | API code formatting, linting, type checking, and tests | main, staging, develop |
| `API • integration smoke (uvicorn + /health)` | API health check and integration test | main, staging |
| `Web • E2E (Playwright)` | End-to-end tests with Playwright | main, staging |
| `Security • dependency and secret scanning` | Security vulnerability scanning | main (optional) |

---

## Action Items Checklist

### Immediate Actions (Current Branch: main)

- [ ] **Verify Production Environment Variables**
  ```bash
  npm run env:check
  npm run env:check:clerk
  npm run env:sync:prod  # If using Doppler
  ```

- [ ] **Configure Main Branch Protection**
  - Navigate to GitHub Settings → Branches
  - Add/update protection rule for `main`
  - Configure as specified above

- [ ] **Configure Develop Branch Protection**
  - Add protection rule for `develop`
  - Configure as specified above

- [ ] **Configure Staging Branch Protection**
  - Add protection rule for `staging`
  - Configure as specified above

- [ ] **Verify CI/CD Workflows**
  - Ensure all required status checks are passing
  - Test with a sample PR

### Ongoing Maintenance

- [ ] Review and update branch protection rules quarterly
- [ ] Monitor CI/CD status check performance
- [ ] Update required status checks as workflows evolve
- [ ] Document any exceptions or temporary bypasses

---

## Troubleshooting

### Branch Protection Blocking Legitimate Changes

1. **Check CI/CD Status**
   - Ensure all required status checks are passing
   - Review failed checks in the Actions tab

2. **Verify Branch is Up to Date**
   - Merge or rebase with the target branch
   - Ensure no conflicts exist

3. **Check Review Requirements**
   - Ensure required number of approvals are obtained
   - Verify reviewers have appropriate permissions

4. **Temporary Bypass (Emergency Only)**
   - If administrators can bypass, use sparingly
   - Document the reason for bypass
   - Follow up with proper PR after emergency fix

### Environment Variables Not Loading

1. **Check Current Branch**
   ```bash
   git branch --show-current
   ```

2. **Sync Correct Environment**
   ```bash
   # For main branch (production)
   npm run env:sync:prod
   
   # For staging branch
   npm run env:sync:preview
   
   # For develop branch
   npm run env:sync:dev
   ```

3. **Verify Variables**
   ```bash
   npm run env:check
   ```

---

## Related Documentation

- [Git Branching Strategy](./docs/GIT_BRANCHING_STRATEGY.md)
- [Branch Environment Mapping](./docs/BRANCH_ENVIRONMENT_MAPPING.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [GitHub Branch Protection Guide](./GITHUB_BRANCH_PROTECTION_GUIDE.md)
- [Doppler Setup](./docs/QUICK_SETUP_SECRETS.md)
- [Vercel Deployment](./docs/DEPLOY_VERCEL_INTEGRATIONS.md)

---

## Summary

**Current Configuration Status:**
- ✅ Branch: `main` (Production)
- ⚠️ Branch Protection: Needs configuration
- ⚠️ Environment Variables: Verify production settings
- ✅ CI/CD Workflows: Configured and available

**Next Steps:**
1. Configure branch protection rules for `main`, `develop`, and `staging`
2. Verify and sync production environment variables
3. Test branch protection with a sample PR
4. Document any custom exceptions or requirements
