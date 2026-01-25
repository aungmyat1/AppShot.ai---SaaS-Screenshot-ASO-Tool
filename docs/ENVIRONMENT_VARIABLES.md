# Environment Variables Configuration

This document provides a comprehensive guide for managing environment variables across different branches and environments.

## Environment Mapping

### Branch → Environment → Configuration

| Branch | Environment | Doppler Config | Vercel Environment | Purpose |
|--------|-------------|---------------|-------------------|---------|
| `main` | Production | `production` | Production | Live production environment |
| `staging` | Staging | `preview` | Preview | Pre-production testing |
| `develop` | Development | `development` | Development | Active development |
| `feature/*` | Development | `development` | Development | Feature development |

## Environment-Specific Variables

### Production (main branch)

**Database:**
```bash
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/getappshots_prod
```

**Authentication (Clerk):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Payments (Stripe):**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Storage:**
```bash
R2_ACCOUNT_ID=prod-account-id
R2_BUCKET_NAME=getappshots-prod
R2_ACCESS_KEY_ID=prod-access-key
R2_SECRET_ACCESS_KEY=prod-secret-key
STORAGE_PUBLIC_BASE_URL=https://cdn.getappshots.com
```

**API Configuration:**
```bash
NODE_ENV=production
API_URL=https://api.getappshots.com
NEXT_PUBLIC_APP_URL=https://getappshots.com
```

**Security:**
```bash
JWT_SECRET_KEY=<strong-random-secret>
ENCRYPTION_KEY=<strong-random-key>
```

### Staging (staging branch)

**Database:**
```bash
DATABASE_URL=postgresql://staging-user:staging-pass@staging-host:5432/getappshots_staging
```

**Authentication (Clerk):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Payments (Stripe):**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Storage:**
```bash
R2_ACCOUNT_ID=staging-account-id
R2_BUCKET_NAME=getappshots-staging
R2_ACCESS_KEY_ID=staging-access-key
R2_SECRET_ACCESS_KEY=staging-secret-key
STORAGE_PUBLIC_BASE_URL=https://staging-cdn.getappshots.com
```

**API Configuration:**
```bash
NODE_ENV=staging
API_URL=https://staging-api.getappshots.com
NEXT_PUBLIC_APP_URL=https://staging.getappshots.com
```

### Development (develop branch)

**Database:**
```bash
DATABASE_URL=postgresql://dev-user:dev-pass@localhost:5432/getappshots_dev
```

**Authentication (Clerk):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Payments (Stripe):**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Storage:**
```bash
R2_ACCOUNT_ID=dev-account-id
R2_BUCKET_NAME=getappshots-dev
R2_ACCESS_KEY_ID=dev-access-key
R2_SECRET_ACCESS_KEY=dev-secret-key
STORAGE_PUBLIC_BASE_URL=http://localhost:9000
```

**API Configuration:**
```bash
NODE_ENV=development
API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Development Features:**
```bash
DEV_PASSWORD=dev-access-password
ENABLE_DEBUG=true
LOG_LEVEL=debug
```

## Variable Categories

### Required Variables (All Environments)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` or `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name | `getappshots-prod` |
| `R2_ACCESS_KEY_ID` | R2 access key ID | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | `...` |
| `JWT_SECRET_KEY` | JWT signing secret | `<random-string>` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `null` |
| `CELERY_BROKER_URL` | Celery broker URL | `null` |
| `SENTRY_DSN` | Sentry DSN for error tracking | `null` |
| `ANALYTICS_ID` | Analytics tracking ID | `null` |
| `LOG_LEVEL` | Logging level | `info` |

## Managing Variables

### Using Doppler (Recommended)

#### Setup
```bash
# Install Doppler CLI
npm install -g @doppler/cli

# Login to Doppler
doppler login

# Setup project
npm run doppler:setup
```

#### Sync Variables to Vercel
```bash
# Development environment
npm run env:sync:dev

# Staging/Preview environment
npm run env:sync:preview

# Production environment
npm run env:sync:prod
```

#### Verify Variables
```bash
# Check all environments
npm run env:check

# Check Clerk configuration
npm run env:check:clerk

# Check Doppler integration
npm run env:check:doppler
```

### Manual Configuration

#### Vercel Dashboard
1. Go to Project → Settings → Environment Variables
2. Add variables for each environment:
   - ☑️ Development
   - ☑️ Preview
   - ☑️ Production
3. Save changes

#### Local Development
```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
# Use environment-specific files:
# .env.development.local (for develop branch)
# .env.staging.local (for staging branch)
# .env.production.local (for main branch)
```

## Variable Naming Conventions

### Public Variables (Next.js)
- Prefix: `NEXT_PUBLIC_`
- Example: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Accessible in browser/client-side code

### Private Variables
- No prefix
- Example: `CLERK_SECRET_KEY`
- Server-side only

### Service-Specific Prefixes
- `R2_*` - Cloudflare R2
- `STRIPE_*` - Stripe
- `CLERK_*` - Clerk
- `DATABASE_*` - Database
- `REDIS_*` - Redis

## Security Best Practices

### ✅ Do
- Use Doppler for secret management
- Rotate secrets regularly
- Use different keys for each environment
- Use strong, random secrets
- Review variable access regularly

### ❌ Don't
- Commit secrets to git
- Share secrets in plain text
- Use production keys in development
- Hardcode secrets in code
- Use weak or predictable secrets

## Environment-Specific Configuration Files

### File Structure
```
.env.example              # Template (committed)
.env.local                # Local overrides (gitignored)
.env.development.local    # Development overrides (gitignored)
.env.staging.local        # Staging overrides (gitignored)
.env.production.local     # Production overrides (gitignored)
```

### Loading Order
1. `.env`
2. `.env.local`
3. `.env.[NODE_ENV]`
4. `.env.[NODE_ENV].local`

## Troubleshooting

### Missing Variables
```bash
# Check which variables are missing
npm run env:check

# Verify Doppler sync
npm run env:check:doppler

# Check Vercel variables
vercel env ls
```

### Wrong Environment
```bash
# Check current branch
git branch --show-current

# Sync correct environment
npm run env:sync:dev      # for develop
npm run env:sync:preview  # for staging
npm run env:sync:prod     # for main
```

### Variable Not Loading
1. Verify variable name matches exactly
2. Check for typos
3. Ensure variable is set for correct environment
4. Restart development server
5. Clear Next.js cache: `rm -rf .next`

## Quick Reference

### Check Current Environment
```bash
# Check branch
git branch --show-current

# Check Node environment
echo $NODE_ENV

# List all environment variables (local)
npm run env:list
```

### Switch Environments
```bash
# Switch to develop
git checkout develop
npm run env:sync:dev

# Switch to staging
git checkout staging
npm run env:sync:preview

# Switch to production
git checkout main
npm run env:sync:prod
```

## Related Documentation

- [Git Branching Strategy](./GIT_BRANCHING_STRATEGY.md)
- [Doppler Setup](./QUICK_SETUP_SECRETS.md)
- [Vercel Deployment](./DEPLOY_VERCEL_INTEGRATIONS.md)
- [Launch Plan](../LAUNCH_PLAN.md)
