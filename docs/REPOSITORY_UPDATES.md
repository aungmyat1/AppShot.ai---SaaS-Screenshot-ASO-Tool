# Repository Updates Summary

This document summarizes recent updates to the repository, particularly around pricing management and deployment configuration.

## ✅ Updates Completed

### 1. Centralized Pricing Configuration
- **Created**: `apps/web/lib/pricing-config.ts`
  - Single source of truth for all pricing information
  - Defines pricing plans (FREE, STARTER, PRO) with:
    - Price in cents and dollars
    - Screenshot limits (monthly and per-job)
    - Feature lists
    - Stripe product metadata

### 2. Stripe Pricing Sync Script
- **Created**: `scripts/sync-stripe-pricing.ts`
  - Automatically syncs pricing from config to Stripe
  - Creates/updates Stripe products and prices
  - Outputs price IDs for environment variables
  - Supports `--dry-run` and `--force` flags
- **Added**: `npm run stripe:sync` command to root `package.json`

### 3. Code Updates to Use Pricing Config
- **Updated**: `apps/web/lib/limits.ts`
  - Now uses `getPricingPlan()` for screenshot limits
  - Removed hardcoded values (500, 10, 30)
  
- **Updated**: `apps/web/lib/core/process-scrape-job.ts`
  - Now uses `getPricingPlan().perJobCap` instead of hardcoded values
  
- **Updated**: `apps/web/lib/plans.ts`
  - Now uses `getPricingPlanByStripePriceId()` for price ID mapping
  
- **Updated**: `apps/web/app/page.tsx`
  - Homepage pricing section now uses `PRICING_PLANS` config
  
- **Updated**: `apps/web/app/(marketing)/pricing/page.tsx`
  - Pricing table now uses `PRICING_PLANS` config

### 4. Documentation Updates
- **Created**: `docs/STRIPE_PRICING_SYNC.md`
  - Complete guide for managing pricing
  - Instructions for syncing to Stripe
  - Troubleshooting tips
  
- **Updated**: `VERCEL_DEPLOYMENT_GUIDE.md`
  - Added automatic Stripe sync instructions
  - Updated environment variable documentation
  
- **Updated**: `VERCEL_QUICK_START.md`
  - Added Stripe sync notes to environment variables section
  
- **Updated**: `README.md`
  - Added pricing management section

### 5. Clerk Redirect Configuration
- **Updated**: All deployment guides
  - Added Clerk redirect environment variables:
    - `CLERK_SIGN_IN_FORCE_REDIRECT_URL`
    - `CLERK_SIGN_UP_FORCE_REDIRECT_URL`
    - `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
    - `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

## 📋 Files Changed

### New Files
- `apps/web/lib/pricing-config.ts`
- `scripts/sync-stripe-pricing.ts`
- `docs/STRIPE_PRICING_SYNC.md`
- `docs/REPOSITORY_UPDATES.md` (this file)

### Modified Files
- `package.json` - Added `stripe:sync` script
- `apps/web/lib/limits.ts` - Uses pricing config
- `apps/web/lib/core/process-scrape-job.ts` - Uses pricing config
- `apps/web/lib/plans.ts` - Uses pricing config
- `apps/web/app/page.tsx` - Uses pricing config
- `apps/web/app/(marketing)/pricing/page.tsx` - Uses pricing config
- `VERCEL_DEPLOYMENT_GUIDE.md` - Added sync instructions
- `VERCEL_QUICK_START.md` - Added sync notes
- `README.md` - Added pricing management section
- `DEPLOYMENT_CHECKLIST.md` - Added redirect variables

## 🔄 How to Use

### Updating Prices
1. Edit `apps/web/lib/pricing-config.ts`
2. Run `npm run stripe:sync -- --dry-run` to preview
3. Run `npm run stripe:sync` to sync to Stripe
4. Update environment variables with new price IDs
5. Redeploy application

### First Time Setup
1. Set `STRIPE_SECRET_KEY` environment variable
2. Run `npm run stripe:sync`
3. Copy price IDs from output
4. Add to `.env` and Vercel environment variables

## ✅ Verification Checklist

- [x] Pricing config file created
- [x] Sync script created and tested
- [x] All hardcoded pricing values replaced
- [x] Documentation updated
- [x] TypeScript imports working
- [x] No linter errors
- [x] All deployment guides updated

## 🎯 Benefits

1. **Single Source of Truth**: All pricing in one place
2. **Automatic Sync**: Changes automatically reflected in Stripe
3. **Type Safety**: TypeScript ensures consistency
4. **Easy Updates**: Change price in one file, sync to Stripe
5. **Documentation**: Complete guides for all processes

## 📝 Notes

- The sync script uses `tsx` to run TypeScript directly
- Price IDs are environment-specific (test vs live)
- Existing subscriptions continue with their current prices
- New prices are created for each price change (Stripe behavior)
