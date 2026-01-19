# 🚀 Quick Action Checklist: Clerk, Vercel, Doppler Setup

**Estimated Time**: 2-3 hours total  
**Difficulty**: Beginner-Friendly  
**Required**: API keys from 4 external services + Vercel token

---

## PHASE 1: Gather Credentials (45-60 min)

### Step 1.1: Clerk Authentication
**Time**: 10 minutes | **Cost**: FREE

```bash
# Visit: https://dashboard.clerk.com/
# Sign up or log in

# Steps:
1. Create new application
2. Go to Settings → API Keys
3. Copy and save:
   ✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (starts with pk_)
   ✓ CLERK_SECRET_KEY (starts with sk_)

# Go to Settings → Redirect URLs
4. Add these URLs:
   - http://localhost:3000
   - http://localhost:3000/sign-in
   - http://localhost:3000/sign-up
   - https://your-domain.com (production)
```

**Progress**: [ ] Clerk keys obtained

---

### Step 1.2: Stripe Payment
**Time**: 15 minutes | **Cost**: FREE

```bash
# Visit: https://dashboard.stripe.com/
# Sign up or log in

# Steps:
1. Go to Developers → API Keys
2. Copy test keys (for development):
   ✓ STRIPE_SECRET_KEY (starts with sk_test_)
   ✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (starts with pk_test_)

# Create Products:
3. Go to Products → Create product
   - Name: "Pro" plan
   - Type: Recurring
   - Copy price ID: ✓ NEXT_PUBLIC_STRIPE_PRICE_PRO (price_xxx)
   
   - (Optional) Name: "Starter" plan
   - Copy price ID: ✓ NEXT_PUBLIC_STRIPE_PRICE_STARTER (price_xxx)

# Setup Webhook:
4. Go to Developers → Webhooks → Add endpoint
   - URL: https://your-domain.com/api/stripe/webhook
   - Events: Select all (or minimum):
     * customer.subscription.created
     * customer.subscription.updated
     * customer.subscription.deleted
     * invoice.paid
     * invoice.payment_failed
   - Copy signing secret: ✓ STRIPE_WEBHOOK_SECRET (whsec_xxx)
```

**Progress**: [ ] Stripe keys obtained

---

### Step 1.3: Database (PostgreSQL)
**Time**: 10-20 minutes | **Cost**: FREE (or via Vercel Postgres)

#### Option A: Vercel Postgres (Recommended for Vercel deployment)
```bash
# In Vercel Dashboard:
1. Go to your project
2. Storage → Create Database → Postgres
3. Select region (same as apps/web)
4. Copy connection string: ✓ DATABASE_URL
```

#### Option B: External Database
```bash
# Using your existing database:
1. Get connection string from your provider
   Format: postgresql://user:pass@host:5432/dbname?sslmode=require
2. Save: ✓ DATABASE_URL

# Or use Docker locally:
docker run --name appshot-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/getappshots
```

**Progress**: [ ] DATABASE_URL obtained

---

### Step 1.4: Storage (Cloudflare R2 or AWS S3)
**Time**: 15-30 minutes | **Cost**: FREE tier available

#### Option A: Cloudflare R2 (Recommended)
```bash
# Visit: https://dash.cloudflare.com/
# Sign up or log in

# Steps:
1. Navigate to R2 (in sidebar)
2. Create Bucket
   - Name: getappshot-dev (for dev environment)
   - Region: Auto
3. Go to Settings → R2 API Tokens → Create Token
4. Select "Edit" permissions for your bucket
5. Copy and save:
   ✓ Account ID (shown on R2 overview)
   ✓ R2_BUCKET_NAME (from step 2)
   ✓ Access Key ID (from token creation)
   ✓ Secret Access Key (from token creation)
   
   ✓ STORAGE_ENDPOINT_URL = https://{ACCOUNT_ID}.r2.cloudflarestorage.com
   ✓ R2_PUBLIC_URL = https://pub-{randomId}.r2.dev (or custom domain)
```

#### Option B: AWS S3
```bash
# Visit: https://console.aws.amazon.com/
# Steps:
1. Create S3 bucket (us-east-1 or your region)
2. Go to IAM → Create user with S3 access
3. Copy credentials:
   ✓ STORAGE_ACCESS_KEY_ID
   ✓ STORAGE_SECRET_ACCESS_KEY
   
   ✓ STORAGE_ENDPOINT_URL = https://s3.{region}.amazonaws.com
   ✓ STORAGE_BUCKET = your-bucket-name
   ✓ STORAGE_REGION = us-east-1
```

**Progress**: [ ] Storage credentials obtained

---

## PHASE 2: Local Development Setup (20 min)

### Step 2.1: Install Doppler CLI
**Time**: 5 minutes

```bash
# macOS
brew install dopplerhq/doppler/doppler

# Ubuntu/Debian
curl -Ls https://cli.doppler.com/install.sh | sh

# Windows (WSL2)
curl -Ls https://cli.doppler.com/install.sh | sh

# Verify installation
doppler --version
```

**Progress**: [ ] Doppler CLI installed

---

### Step 2.2: Create Doppler Account & Project
**Time**: 10 minutes

```bash
# Visit: https://doppler.com/
# Sign up (free tier - unlimited secrets)

# Login in CLI
doppler login

# Run setup script (from project root)
npm run doppler:setup

# This creates:
# - Project: "getappshots"
# - Configs: dev, staging, prod
```

**Progress**: [ ] Doppler account created & project initialized

---

### Step 2.3: Add Secrets to Doppler
**Time**: 5 minutes

```bash
# From the project root, add your credentials to Doppler:

# Database
doppler secrets set DATABASE_URL="postgresql://..." --config dev

# Clerk
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." --config dev
doppler secrets set CLERK_SECRET_KEY="sk_test_..." --config dev
doppler secrets set NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in" --config dev
doppler secrets set NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up" --config dev
doppler secrets set ADMIN_EMAILS="your-email@example.com" --config dev

# Stripe
doppler secrets set STRIPE_SECRET_KEY="sk_test_..." --config dev
doppler secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --config dev
doppler secrets set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." --config dev
doppler secrets set NEXT_PUBLIC_STRIPE_PRICE_PRO="price_..." --config dev
doppler secrets set STRIPE_PRICE_PRO="price_..." --config dev

# Storage (R2)
doppler secrets set R2_ACCOUNT_ID="xxx" --config dev
doppler secrets set R2_BUCKET_NAME="getappshot" --config dev
doppler secrets set R2_ACCESS_KEY_ID="xxx" --config dev
doppler secrets set R2_SECRET_ACCESS_KEY="xxx" --config dev
doppler secrets set STORAGE_ENDPOINT_URL="https://xxx.r2.cloudflarestorage.com" --config dev

# Optional: Other configs
doppler secrets set DATABASE_URL="..." --config staging
doppler secrets set DATABASE_URL="..." --config prod
# ... repeat for other secrets in staging/prod
```

**Progress**: [ ] Secrets added to Doppler dev/staging/prod

---

## PHASE 3: Vercel Integration (15 min)

### Step 3.1: Connect Vercel Integrations
**Time**: 10 minutes

```bash
# In Vercel Dashboard (https://vercel.com/dashboard)

# For Clerk:
1. Go to your project → Settings → Integrations
2. Search "Clerk" → Add Integration
3. Select your Clerk application
4. Authorize
✅ Auto-synced: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

# For Stripe:
5. Search "Stripe" → Add Integration
6. Select your Stripe account
7. Authorize
✅ Auto-synced: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Progress**: [ ] Clerk integration connected
**Progress**: [ ] Stripe integration connected

---

### Step 3.2: Connect Doppler to Vercel
**Time**: 5 minutes

```bash
# In Vercel Dashboard:
1. Go to your project → Settings → Integrations
2. Search "Doppler" → Add Integration
3. Authorize Doppler access
4. Select the "getappshots" project
5. Link to Vercel project

✅ Ready to sync: All Doppler secrets → Vercel
```

**Progress**: [ ] Doppler integration connected to Vercel

---

## PHASE 4: Manual Environment Variables (10 min)

### Step 4.1: Add Variables to Vercel
**Time**: 10 minutes

```bash
# In Vercel Dashboard: Project → Settings → Environment Variables

# Add these manually (not auto-synced by integrations):
1. NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
2. NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
3. ADMIN_EMAILS = your-email@example.com
4. STRIPE_WEBHOOK_SECRET = whsec_... (from Stripe)
5. NEXT_PUBLIC_STRIPE_PRICE_PRO = price_... (from Stripe)
6. STRIPE_PRICE_PRO = price_... (from Stripe)

# If using external database (not Vercel Postgres):
7. DATABASE_URL = postgresql://... (set to all environments)

# Note: R2/Storage credentials come from Doppler sync (next step)
```

**Set each for**: development, preview, production

**Progress**: [ ] Manual variables added to all environments

---

## PHASE 5: Sync Secrets (10 min)

### Step 5.1: Get Vercel Token
**Time**: 2 minutes

```bash
# Visit: https://vercel.com/account/tokens
# Create a new token (copy it)
# Save as environment variable:
export VERCEL_TOKEN="your-token-here"

# Also get from Vercel Dashboard:
# Settings → Projects → Select your project
# Copy PROJECT_ID
export VERCEL_PROJECT_ID="your-project-id"
```

**Progress**: [ ] Vercel token obtained

---

### Step 5.2: Sync Doppler → Vercel
**Time**: 5 minutes

```bash
# From project root:

# Dry run (preview what will be synced)
npm run env:sync --env=development --dry-run

# If looks good, sync for real
VERCEL_TOKEN=$VERCEL_TOKEN VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID \
  npm run env:sync:dev

# Sync to staging
VERCEL_TOKEN=$VERCEL_TOKEN VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID \
  npm run env:sync:preview

# Sync to production
VERCEL_TOKEN=$VERCEL_TOKEN VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID \
  npm run env:sync:prod
```

**Progress**: [ ] Secrets synced from Doppler → Vercel

---

## PHASE 6: Validation (10 min)

### Step 6.1: Local Development Test
**Time**: 5 minutes

```bash
# Test that Doppler setup works locally
doppler run -- npm run env:check

# Should output:
# ✅ All 42+ environment variables present
# OR show missing ones (fix in Doppler)

# Start development server
doppler run -- npm run dev

# Visit: http://localhost:3000
# Check that:
# ✅ Page loads
# ✅ Authentication works (Clerk sign-in visible)
# ✅ No console errors about missing env vars
```

**Progress**: [ ] Local development validated

---

### Step 6.2: Vercel Preview Deployment
**Time**: 5 minutes

```bash
# Push to GitHub (if using GitHub integration)
git add .
git commit -m "chore: setup Clerk, Stripe, Doppler integration"
git push origin main

# In Vercel Dashboard:
1. Go to Deployments
2. Wait for preview build to complete
3. Visit preview URL
4. Test:
   ✅ Page loads
   ✅ Authentication works
   ✅ No errors in deployment logs

# If issues:
View Deployment → Logs
Look for missing environment variable errors
Add any missing variables to Vercel
```

**Progress**: [ ] Vercel preview tested

---

## ✅ SUCCESS CHECKLIST

- [ ] Phase 1: All 4 credential sources complete
- [ ] Phase 2: Doppler CLI installed & configured
- [ ] Phase 3: Vercel integrations connected
- [ ] Phase 4: Manual variables added
- [ ] Phase 5: Secrets synced to Vercel
- [ ] Phase 6: Local & preview deployments validated

---

## 🆘 Troubleshooting

### Problem: `doppler: command not found`
**Solution**: Reinstall Doppler CLI
```bash
curl -Ls https://cli.doppler.com/install.sh | sh
doppler --version
```

### Problem: `env:check` still shows missing variables
**Solution**: Make sure secrets are in Doppler dev config
```bash
# List all secrets in dev config
doppler secrets --plain

# Add missing ones
doppler secrets set KEY=value --config dev
```

### Problem: Vercel sync fails with "VERCEL_TOKEN missing"
**Solution**: Export token before running sync
```bash
export VERCEL_TOKEN="your-token-here"
npm run env:sync --env=development
```

### Problem: Clerk/Stripe integrations not auto-syncing
**Solution**: Vercel integrations may need re-authorization
1. Go to Vercel Settings → Integrations
2. Find Clerk/Stripe → Remove integration
3. Re-add integration (will prompt for re-auth)
4. Check Environment Variables → should see new vars

### Problem: Database connection fails
**Solution**: Verify DATABASE_URL format
```bash
# Correct format for PostgreSQL:
postgresql://user:password@host:5432/dbname?sslmode=require

# Test connection locally:
doppler run -- psql $DATABASE_URL -c "SELECT 1;"
```

---

## 📚 Reference Documentation

- [Quick Setup Secrets](docs/QUICK_SETUP_SECRETS.md) - Full guide with more details
- [Recommended Secrets Strategy](docs/RECOMMENDED_SECRETS_STRATEGY.md) - Architecture & best practices
- [Environment Variables Guide](docs/SETUP_ENVIRONMENT_VARIABLES.md) - Detailed variable explanations
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-launch checklist

---

## 💡 Pro Tips

1. **Use environment-specific configs in Doppler**
   - `dev` → local development (loose security OK)
   - `staging` → preview deployments (medium security)
   - `prod` → production (maximum security, no dev keys)

2. **Test webhook secrets locally with ngrok**
   ```bash
   ngrok http 3000
   # Add ngrok URL to Stripe webhook: https://your-ngrok-url.ngrok.io/api/stripe/webhook
   ```

3. **Rotate secrets regularly**
   - Update in external service (Clerk, Stripe, etc.)
   - Update in Doppler
   - Re-sync to Vercel: `npm run env:sync:prod`

4. **Monitor Doppler audit logs**
   - Doppler Dashboard → Audit Logs
   - See who accessed/changed secrets and when

---

**Status**: Ready to begin setup  
**Last Updated**: Jan 19, 2026  
**Questions?**: See [docs/README.md](docs/README.md) for team coordination
