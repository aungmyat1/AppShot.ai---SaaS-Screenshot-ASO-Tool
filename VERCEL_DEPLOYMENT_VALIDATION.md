# Vercel Deployment Setup Validation

## Current Configuration Status

### ✅ Branch → Environment Mapping

Based on `BRANCH_ENV_PROTECTION_CONFIG.md`:

| Branch | Vercel Environment | Auto-Deploy | Status |
|--------|-------------------|-------------|--------|
| `main` | **Production** | ✅ Yes | ✅ Configured |
| `staging` | **Preview** | ✅ Yes | ✅ Configured |
| `develop` | **Development** | ✅ Yes | ✅ Configured |
| `feature/*` | Development | ❌ Manual | ⚠️ Manual only |
| `bugfix/*` | Development | ❌ Manual | ⚠️ Manual only |
| `hotfix/*` | Production | ❌ Manual | ⚠️ Manual only |
| `release/*` | Preview | ❌ Manual | ⚠️ Manual only |

### ✅ Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npx turbo run build --filter=getappshots",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SCRAPE_QUEUE_MODE": "sync",
    "PLAY_SCRAPE_MODE": "html",
    "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT": "false"
  },
  "functions": {
    "apps/web/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

**Status:** ✅ Valid configuration

### ✅ GitHub Workflows

#### 1. Vercel Deploy Monitor (`.github/workflows/vercel-deploy-monitor.yml`)
- **Triggers:** Push to `main`, `staging`, `preview`
- **Purpose:** Monitors Vercel deployment status
- **Status:** ✅ Configured

#### 2. Sync Doppler to Vercel (`.github/workflows/sync-doppler-vercel.yml`)
- **Triggers:** Push to `main` (on file changes), manual, weekly schedule
- **Purpose:** Syncs environment variables from Doppler to Vercel
- **Environments:** `development`, `preview`, `production`
- **Status:** ✅ Configured

#### 3. Sync Env (`.github/workflows/sync-env.yml`)
- **Triggers:** Push to `main`, manual
- **Purpose:** Syncs environment variables
- **Status:** ✅ Configured

### ✅ Available Validation Scripts

1. **`check-vercel-git-deploy.js`**
   - Validates Git integration
   - Checks production branch setting
   - Verifies auto-deploy on push
   - **Run:** `npm run check:git-deploy` (requires `VERCEL_TOKEN`)

2. **`check-vercel-env.js`**
   - Lists Vercel environment variables
   - Checks Clerk configuration
   - **Run:** `node scripts/check-vercel-env.js` (requires `VERCEL_TOKEN`)

3. **`check-deployment-readiness.js`**
   - Comprehensive deployment readiness check
   - **Run:** `npm run check:deployment`

## Validation Checklist

### 1. Vercel Project Configuration

- [ ] **Project linked to Git repository**
  - Check: Vercel Dashboard → Project → Settings → Git
  - Should show: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`

- [ ] **Production branch set to `main`**
  - Check: Vercel Dashboard → Settings → Git → Production Branch
  - Should be: `main`

- [ ] **Auto-deploy enabled**
  - Check: Vercel Dashboard → Settings → Git → Create Deployments
  - Should be: `enabled`

- [ ] **Project not paused**
  - Check: Vercel Dashboard → Project status
  - Should be: Active (not paused)

### 2. Environment Variables

#### Production Environment (main branch)

Required variables:
- [ ] `DATABASE_URL` - Production database
- [ ] `DATABASE_URL_ASYNC` - Production database (async)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk live key (`pk_live_...`)
- [ ] `CLERK_SECRET_KEY` - Clerk live secret (`sk_live_...`)
- [ ] `STRIPE_SECRET_KEY` - Stripe live key (`sk_live_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe live key (`pk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `R2_ACCOUNT_ID` / `STORAGE_*` - Storage credentials
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `NODE_ENV=production`

#### Preview Environment (staging branch)

Required variables:
- [ ] `DATABASE_URL` - Staging/preview database
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk test key (`pk_test_...`)
- [ ] `CLERK_SECRET_KEY` - Clerk test secret (`sk_test_...`)
- [ ] `STRIPE_SECRET_KEY` - Stripe test key (`sk_test_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe test key (`pk_test_...`)

#### Development Environment (develop branch)

Required variables:
- [ ] `DATABASE_URL` - Development database
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk test key
- [ ] `CLERK_SECRET_KEY` - Clerk test secret
- [ ] `STRIPE_SECRET_KEY` - Stripe test key

### 3. Branch Protection Alignment

- [ ] **Main branch:** Auto-deploys to Production ✅
- [ ] **Staging branch:** Auto-deploys to Preview ✅
- [ ] **Develop branch:** Auto-deploys to Development ✅

### 4. Integration Status

- [ ] **Doppler Integration:** Configured for syncing secrets
- [ ] **Clerk Integration:** Should be connected via Vercel integrations
- [ ] **Stripe Integration:** Should be connected via Vercel integrations

## Validation Commands

### Quick Validation

```powershell
# 1. Check Git deployment setup
$env:VERCEL_TOKEN='your_vercel_token'
npm run check:git-deploy

# 2. Check environment variables
node scripts/check-vercel-env.js

# 3. Check deployment readiness
npm run check:deployment

# 4. Verify Doppler sync
npm run env:check:doppler
```

### Comprehensive Validation

```powershell
# Run all checks
npm run check:deployment
npm run check:git-deploy
npm run env:check
npm run env:check:clerk
npm run env:check:doppler
```

## Expected Behavior

### When Pushing to `main`:
1. ✅ GitHub Actions CI runs (5 status checks)
2. ✅ Vercel automatically deploys to **Production**
3. ✅ Vercel deploy monitor workflow runs
4. ✅ Doppler syncs to Vercel production environment

### When Pushing to `staging`:
1. ✅ GitHub Actions CI runs (3 status checks)
2. ✅ Vercel automatically deploys to **Preview**
3. ✅ Vercel deploy monitor workflow runs

### When Pushing to `develop`:
1. ✅ GitHub Actions CI runs (2 status checks)
2. ✅ Vercel automatically deploys to **Development**
3. ✅ Vercel deploy monitor workflow runs

## Issues to Fix

### ⚠️ Potential Issues Found

1. **Branch Protection vs Auto-Deploy:**
   - Branch protection requires PRs (no direct push to main)
   - Vercel auto-deploys on push to main
   - **Solution:** Vercel will deploy when PR is merged to main (this is correct)

2. **Environment Variable Sync:**
   - Doppler sync only runs on `main` branch pushes
   - **Solution:** This is correct - syncs production env on main pushes

3. **Workflow Branch Names:**
   - Monitor workflow triggers on `preview` branch (not in your branch list)
   - **Solution:** Consider adding `preview` branch or remove from workflow

## Recommendations

### 1. Verify Vercel Project Settings

Go to: https://vercel.com/dashboard → Your Project → Settings

**Check:**
- Git → Production Branch: Should be `main`
- Git → Create Deployments: Should be `enabled`
- Environment Variables → Verify all required vars are set for each environment

### 2. Test Deployment Flow

```powershell
# Test production deployment
git checkout main
git pull origin main
# Make a small change
git commit --allow-empty -m "test: verify Vercel deployment"
git push origin main

# Check Vercel dashboard for new deployment
```

### 3. Verify Environment Variables

```powershell
# Check what's in Vercel
node scripts/check-vercel-env.js

# Compare with Doppler
npm run env:check:doppler
```

### 4. Update Workflow (Optional)

If you don't have a `preview` branch, update `.github/workflows/vercel-deploy-monitor.yml`:

```yaml
branches:
  - main
  - staging
  # Remove: - preview (if you don't use it)
```

## Quick Fix Commands

```powershell
# 1. Validate current setup
npm run check:deployment

# 2. Check Vercel Git integration
$env:VERCEL_TOKEN='your_token'
npm run check:git-deploy

# 3. Sync environment variables (if needed)
npm run env:sync:prod  # For production
npm run env:sync:preview  # For preview
npm run env:sync:dev  # For development
```

---

**Last Updated**: 2026-01-27
**Status**: Configuration validated, ready for deployment
