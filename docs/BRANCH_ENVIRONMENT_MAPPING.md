# Branch to Environment Mapping

Quick reference guide for branch-to-environment mappings and variable configurations.

## Quick Reference Table

| Branch Pattern | Environment | Doppler Config | Vercel Env | Database | Stripe | Auto-Deploy |
|----------------|-------------|---------------|------------|----------|--------|-------------|
| `main` | Production | `production` | Production | Prod DB | Live | ✅ Yes |
| `master` | Production | `production` | Production | Prod DB | Live | ✅ Yes |
| `staging` | Staging | `preview` | Preview | Staging DB | Test | ✅ Yes |
| `develop` | Development | `development` | Development | Dev DB | Test | ✅ Yes |
| `dev` | Development | `development` | Development | Dev DB | Test | ✅ Yes |
| `feature/*` | Development | `development` | Development | Dev DB | Test | ❌ Manual |
| `bugfix/*` | Development | `development` | Development | Dev DB | Test | ❌ Manual |
| `hotfix/*` | Production | `production` | Production | Prod DB | Live | ❌ Manual |
| `release/*` | Staging | `preview` | Preview | Staging DB | Test | ❌ Manual |

## Environment Variable Sync Commands

### By Branch

```bash
# Production (main/master)
git checkout main
npm run env:sync:prod

# Staging
git checkout staging
npm run env:sync:preview

# Development (develop/dev)
git checkout develop
npm run env:sync:dev

# Feature/Bugfix branches (use development)
git checkout feature/my-feature
npm run env:sync:dev

# Hotfix branches (use production)
git checkout hotfix/critical-fix
npm run env:sync:prod
```

### Automated Setup

```bash
# Check current branch environment configuration
npm run branch:check

# Automatically sync environment variables for current branch
npm run branch:sync

# Full setup (check + sync)
npm run branch:setup
```

## Environment-Specific Variables

### Production Variables (`main` branch)

**Required:**
- `DATABASE_URL` - Production PostgreSQL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - `pk_live_...`
- `CLERK_SECRET_KEY` - `sk_live_...`
- `STRIPE_SECRET_KEY` - `sk_live_...`
- `STRIPE_PUBLISHABLE_KEY` - `pk_live_...`
- `R2_BUCKET_NAME` - `getappshots-prod`
- `NEXT_PUBLIC_APP_URL` - `https://getappshots.com`
- `NODE_ENV` - `production`

**Optional:**
- `SENTRY_DSN` - Production error tracking
- `ANALYTICS_ID` - Production analytics

### Staging Variables (`staging` branch)

**Required:**
- `DATABASE_URL` - Staging PostgreSQL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - `pk_test_...`
- `CLERK_SECRET_KEY` - `sk_test_...`
- `STRIPE_SECRET_KEY` - `sk_test_...`
- `STRIPE_PUBLISHABLE_KEY` - `pk_test_...`
- `R2_BUCKET_NAME` - `getappshots-staging`
- `NEXT_PUBLIC_APP_URL` - `https://staging.getappshots.com`
- `NODE_ENV` - `staging`

### Development Variables (`develop` branch)

**Required:**
- `DATABASE_URL` - Development PostgreSQL (often localhost)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - `pk_test_...`
- `CLERK_SECRET_KEY` - `sk_test_...`
- `STRIPE_SECRET_KEY` - `sk_test_...`
- `STRIPE_PUBLISHABLE_KEY` - `pk_test_...`
- `R2_BUCKET_NAME` - `getappshots-dev`
- `NEXT_PUBLIC_APP_URL` - `http://localhost:3000`
- `NODE_ENV` - `development`

**Development-Specific:**
- `DEV_PASSWORD` - Development access password
- `ENABLE_DEBUG` - `true`
- `LOG_LEVEL` - `debug`

## Branch Creation Workflow

### Feature Branch
```bash
# Create feature branch
npm run branch:create feature my-feature

# Or manually:
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Sync environment (uses development)
npm run branch:sync
```

### Bugfix Branch
```bash
# Create bugfix branch
npm run branch:create bugfix login-error

# Or manually:
git checkout develop
git pull origin develop
git checkout -b bugfix/login-error

# Sync environment (uses development)
npm run branch:sync
```

### Hotfix Branch
```bash
# Create hotfix branch
npm run branch:create hotfix critical-fix

# Or manually:
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Sync environment (uses production)
npm run branch:sync
```

### Release Branch
```bash
# Create release branch
npm run branch:create release v1.0.0

# Or manually:
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Sync environment (uses staging)
npm run branch:sync
```

## Deployment Triggers

### Automatic Deployments

| Branch | Trigger | Environment | Vercel Project |
|--------|---------|-------------|----------------|
| `main` | Push/PR merge | Production | `getappshots-prod` |
| `staging` | Push/PR merge | Staging | `getappshots-staging` |
| `develop` | Push/PR merge | Development | `getappshots-dev` |

### Manual Deployments

- Feature branches: Vercel preview deployments
- Bugfix branches: Vercel preview deployments
- Hotfix branches: Manual production deployment
- Release branches: Manual staging deployment

## Switching Branches Checklist

When switching branches, follow these steps:

1. **Check current branch environment**
   ```bash
   npm run branch:check
   ```

2. **Sync environment variables**
   ```bash
   npm run branch:sync
   ```

3. **Verify environment variables**
   ```bash
   npm run env:check
   ```

4. **Install dependencies (if needed)**
   ```bash
   npm ci
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Wrong Environment Variables

**Problem:** Variables don't match current branch

**Solution:**
```bash
# Check current branch
git branch --show-current

# Sync correct environment
npm run branch:sync

# Verify
npm run env:check
```

### Branch Not Recognized

**Problem:** Script doesn't recognize your branch

**Solution:**
- Feature/bugfix branches automatically use development
- Hotfix branches automatically use production
- For custom branches, manually run the appropriate sync command

### Environment Variables Not Loading

**Problem:** Variables not available in application

**Solution:**
1. Verify branch environment: `npm run branch:check`
2. Sync variables: `npm run branch:sync`
3. Restart development server
4. Clear Next.js cache: `rm -rf .next`

## Related Documentation

- [Git Branching Strategy](./GIT_BRANCHING_STRATEGY.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Doppler Setup](./QUICK_SETUP_SECRETS.md)
- [Vercel Deployment](./DEPLOY_VERCEL_INTEGRATIONS.md)
