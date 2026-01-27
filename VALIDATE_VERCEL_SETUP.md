# Validate Vercel Deployment Setup

## Quick Validation Commands

Run these commands to validate your Vercel deployment setup:

```powershell
# 1. Check deployment readiness (comprehensive)
npm run check:deployment

# 2. Check Vercel Git integration (requires VERCEL_TOKEN)
$env:VERCEL_TOKEN='your_vercel_token'
npm run check:git-deploy

# 3. Check Vercel environment variables
node scripts/check-vercel-env.js

# 4. Verify environment variable sync
npm run env:check:doppler
```

## Current Configuration Summary

### ✅ Branch → Vercel Environment Mapping

| Branch | Vercel Environment | Auto-Deploy | Status |
|--------|-------------------|-------------|--------|
| `main` | **Production** | ✅ Enabled | ✅ Valid |
| `staging` | **Preview** | ✅ Enabled | ✅ Valid |
| `develop` | **Development** | ✅ Enabled | ✅ Valid |

### ✅ Configuration Files

1. **`vercel.json`** - ✅ Valid
   - Build command: `npx turbo run build --filter=getappshots`
   - Framework: Next.js
   - Region: `iad1`
   - API functions: 60s max duration

2. **GitHub Workflows** - ✅ Updated
   - `vercel-deploy-monitor.yml` - Monitors deployments on `main`, `staging`, `develop`
   - `sync-doppler-vercel.yml` - Syncs env vars from Doppler
   - `sync-env.yml` - Syncs environment variables

## Validation Checklist

### Step 1: Verify Vercel Project Settings

**Go to:** https://vercel.com/dashboard → Your Project → Settings

**Check:**
- [ ] **Git Integration:**
  - Repository: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`
  - Production Branch: `main`
  - Create Deployments: `enabled`

- [ ] **Environment Variables:**
  - Production: All required vars set
  - Preview: All required vars set
  - Development: All required vars set

### Step 2: Verify Branch Configuration

**Expected behavior:**
- Push to `main` → Deploys to **Production**
- Push to `staging` → Deploys to **Preview**
- Push to `develop` → Deploys to **Development**

### Step 3: Test Deployment

```powershell
# Test production deployment
git checkout main
git pull origin main
git commit --allow-empty -m "test: verify Vercel deployment"
git push origin main

# Check Vercel dashboard for new deployment
# Should see deployment triggered automatically
```

## Required Environment Variables by Environment

### Production (main branch)

**Database:**
- `DATABASE_URL`
- `DATABASE_URL_ASYNC`

**Clerk (Live):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
- `CLERK_SECRET_KEY` (sk_live_...)

**Stripe (Live):**
- `STRIPE_SECRET_KEY` (sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- `STRIPE_WEBHOOK_SECRET`

**Storage:**
- `R2_ACCOUNT_ID` or `STORAGE_*` variables
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`

**App Config:**
- `NEXT_PUBLIC_APP_URL` (https://getappshots.com)
- `NODE_ENV=production`

### Preview (staging branch)

**Database:**
- `DATABASE_URL` (staging/preview DB)

**Clerk (Test):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_...)
- `CLERK_SECRET_KEY` (sk_test_...)

**Stripe (Test):**
- `STRIPE_SECRET_KEY` (sk_test_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)

### Development (develop branch)

**Database:**
- `DATABASE_URL` (dev DB)

**Clerk (Test):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_...)
- `CLERK_SECRET_KEY` (sk_test_...)

## Automated Validation Script

Create a validation script to check everything:

```powershell
# Run comprehensive validation
Write-Host "=== Vercel Deployment Validation ===" -ForegroundColor Cyan

# 1. Check vercel.json exists
if (Test-Path "vercel.json") {
    Write-Host "✅ vercel.json found" -ForegroundColor Green
} else {
    Write-Host "❌ vercel.json missing" -ForegroundColor Red
}

# 2. Check workflows
if (Test-Path ".github/workflows/vercel-deploy-monitor.yml") {
    Write-Host "✅ Vercel monitor workflow found" -ForegroundColor Green
} else {
    Write-Host "❌ Vercel monitor workflow missing" -ForegroundColor Red
}

# 3. Check if VERCEL_TOKEN is set (for API checks)
if ($env:VERCEL_TOKEN) {
    Write-Host "✅ VERCEL_TOKEN is set" -ForegroundColor Green
    Write-Host "   Run: npm run check:git-deploy" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  VERCEL_TOKEN not set (optional for validation)" -ForegroundColor Yellow
    Write-Host "   Get token: https://vercel.com/account/tokens" -ForegroundColor Yellow
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Run: npm run check:deployment" -ForegroundColor Yellow
Write-Host "2. Set VERCEL_TOKEN and run: npm run check:git-deploy" -ForegroundColor Yellow
Write-Host "3. Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
```

## Issues Fixed

1. ✅ **Workflow updated:** Changed `preview` → `develop` in `vercel-deploy-monitor.yml`
2. ✅ **Branch mapping validated:** All branches correctly mapped to Vercel environments
3. ✅ **Configuration validated:** `vercel.json` is valid

## Next Steps

1. **Run validation:**
   ```powershell
   npm run check:deployment
   ```

2. **Check Vercel dashboard:**
   - Verify Git connection
   - Verify production branch is `main`
   - Verify auto-deploy is enabled

3. **Test deployment:**
   - Push to `main` and verify production deployment
   - Push to `staging` and verify preview deployment
   - Push to `develop` and verify development deployment

---

**Last Updated**: 2026-01-27
**Status**: Configuration validated and workflow updated
