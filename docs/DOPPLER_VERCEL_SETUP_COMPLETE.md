# Complete Doppler to Vercel Setup Guide

This guide provides a complete, step-by-step setup for integrating Doppler with Vercel for automated secrets management in your deployment pipeline.

## 🎯 Overview

This setup will:
- ✅ Automate 9 storage-related secrets via Doppler → Vercel sync
- ✅ Set up environment-specific configurations (dev, staging, prod)
- ✅ Integrate with Vercel's built-in integrations (Clerk, Stripe, Database)
- ✅ Provide a complete secrets management solution for Vercel deployment

**Time Required**: ~40 minutes  
**Automation Level**: 85%+ (16+ variables auto-synced)

---

## 📋 Prerequisites

1. **Doppler Account**
   - Sign up at [doppler.com](https://doppler.com) (free tier is sufficient)
   - Install Doppler CLI (see below)

2. **Vercel Account**
   - Your project already set up in Vercel
   - Access to project settings

3. **Storage Credentials**
   - Cloudflare R2 or AWS S3 credentials ready
   - Separate credentials for dev/staging/prod environments

---

## 🚀 Step 1: Install Doppler CLI

### macOS
```bash
brew install dopplerhq/doppler/doppler
```

### Linux
```bash
curl -Ls https://cli.doppler.com/install.sh | sh
```

### Windows
```bash
winget install doppler
```

### Verify Installation
```bash
doppler --version
```

---

## 🔐 Step 2: Login to Doppler

```bash
doppler login
```

This will open your browser to authenticate. Once logged in, you'll see:
```
✓ Authenticated
```

---

## ⚙️ Step 3: Run Automated Setup Script

The project includes an automated setup script that:
- Sets up the Doppler project
- Creates/uses existing environments
- Creates configs for dev, staging, and prod

### Run Setup
```bash
npm run doppler:setup
```

Or directly:
```bash
node scripts/doppler-setup.js
```

### What the Script Does

1. **Checks Prerequisites**
   - Verifies Doppler CLI is installed
   - Verifies you're logged in

2. **Sets Up Project**
   - Configures project: `getappshots`
   - Uses existing environments or creates new ones

3. **Creates Configurations**
   - `dev` config → Development environment
   - `staging` config → Preview environment  
   - `prod` config → Production environment

4. **Provides Next Steps**
   - Instructions for adding secrets
   - Vercel integration setup
   - Complete deployment checklist

---

## 🔑 Step 4: Add Storage Secrets to Doppler

For each config (dev, staging, prod), add your storage credentials:

### Development Config
```bash
doppler secrets set --config dev \
  R2_ACCOUNT_ID="your-dev-account-id" \
  R2_BUCKET_NAME="getappshots-dev" \
  R2_ACCESS_KEY_ID="dev-access-key" \
  R2_SECRET_ACCESS_KEY="dev-secret-key" \
  STORAGE_ENDPOINT_URL="https://account-id.r2.cloudflarestorage.com" \
  STORAGE_BUCKET="getappshots-dev" \
  STORAGE_REGION="auto" \
  STORAGE_ACCESS_KEY_ID="dev-access-key" \
  STORAGE_SECRET_ACCESS_KEY="dev-secret-key"
```

### Staging Config
```bash
doppler secrets set --config staging \
  R2_ACCOUNT_ID="your-staging-account-id" \
  R2_BUCKET_NAME="getappshots-staging" \
  R2_ACCESS_KEY_ID="staging-access-key" \
  R2_SECRET_ACCESS_KEY="staging-secret-key" \
  STORAGE_ENDPOINT_URL="https://account-id.r2.cloudflarestorage.com" \
  STORAGE_BUCKET="getappshots-staging" \
  STORAGE_REGION="auto" \
  STORAGE_ACCESS_KEY_ID="staging-access-key" \
  STORAGE_SECRET_ACCESS_KEY="staging-secret-key"
```

### Production Config
```bash
doppler secrets set --config prod \
  R2_ACCOUNT_ID="your-prod-account-id" \
  R2_BUCKET_NAME="getappshots-prod" \
  R2_ACCESS_KEY_ID="prod-access-key" \
  R2_SECRET_ACCESS_KEY="prod-secret-key" \
  STORAGE_ENDPOINT_URL="https://account-id.r2.cloudflarestorage.com" \
  STORAGE_BUCKET="getappshots-prod" \
  STORAGE_REGION="auto" \
  STORAGE_ACCESS_KEY_ID="prod-access-key" \
  STORAGE_SECRET_ACCESS_KEY="prod-secret-key"
```

### Verify Secrets
```bash
# Check dev config
doppler secrets --config dev

# Check staging config
doppler secrets --config staging

# Check prod config
doppler secrets --config prod
```

---

## 🔗 Step 5: Install Doppler Integration in Vercel

### 5.1 Navigate to Integrations
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`getappshots`)
3. Go to **Settings** → **Integrations**

### 5.2 Add Doppler Integration
1. Click **"Browse Integrations"** or search for "Doppler"
2. Find **"Doppler"** in the list
3. Click **"Add Integration"**

### 5.3 Authorize Connection
1. Click **"Connect"** or **"Authorize"**
2. You'll be redirected to Doppler to authorize Vercel
3. Click **"Authorize"** in Doppler
4. You'll be redirected back to Vercel

### 5.4 Configure Environment Mappings
After authorization, configure which Doppler configs map to which Vercel environments:

1. **Select Doppler Project**
   - Choose: `getappshots`

2. **Map Configs to Environments**
   - **Development** → Select Doppler config: `dev`
   - **Preview** → Select Doppler config: `staging`
   - **Production** → Select Doppler config: `prod`

3. **Save Configuration**
   - Click **"Save"** or **"Update Integration"**

### 5.5 Verify Sync
1. Go to **Settings** → **Environment Variables**
2. You should see secrets from Doppler automatically synced
3. They'll be marked with a Doppler icon or label
4. Verify they're set for the correct environments

---

## 🔌 Step 6: Set Up Vercel Built-in Integrations

These integrations automatically sync secrets (no manual setup needed after installation):

### 6.1 Clerk Integration (2 vars auto-synced)
1. **Settings** → **Integrations** → Search "Clerk"
2. Click **"Add Integration"**
3. Select your Clerk app
4. ✅ **Auto-synced**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### 6.2 Stripe Integration (2 vars auto-synced)
1. **Settings** → **Integrations** → Search "Stripe"
2. Click **"Add Integration"**
3. Select your Stripe account
4. ✅ **Auto-synced**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 6.3 Vercel Postgres (1 var auto-created)
1. **Storage** → **Create Database** → **Postgres**
2. Select region
3. ✅ **Auto-created**: `POSTGRES_URL`

### 6.4 Vercel KV (Optional - 2 vars auto-created)
1. **Storage** → **Create Database** → **KV**
2. ✅ **Auto-created**: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

---

## 📝 Step 7: Add Remaining Environment Variables

In **Vercel Dashboard** → **Settings** → **Environment Variables**, add these for each environment:

### For Development Environment
```
DATABASE_URL = $POSTGRES_URL
JWT_SECRET_KEY = dev-jwt-secret-change-me
SCRAPE_QUEUE_MODE = sync
PLAY_SCRAPE_MODE = html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT = false
ADMIN_EMAILS = dev-admin@example.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
STRIPE_WEBHOOK_SECRET = whsec_test_...
STRIPE_PRICE_PRO = price_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO = price_test_...
```

### For Preview Environment
```
DATABASE_URL = $POSTGRES_URL
JWT_SECRET_KEY = staging-jwt-secret-change-me
SCRAPE_QUEUE_MODE = sync
PLAY_SCRAPE_MODE = html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT = false
ADMIN_EMAILS = staging-admin@example.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
STRIPE_WEBHOOK_SECRET = whsec_test_...
STRIPE_PRICE_PRO = price_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO = price_test_...
```

### For Production Environment
```
DATABASE_URL = $POSTGRES_URL
JWT_SECRET_KEY = [GENERATE SECURE RANDOM STRING]
SCRAPE_QUEUE_MODE = sync
PLAY_SCRAPE_MODE = html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT = false
ADMIN_EMAILS = admin@yourdomain.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
STRIPE_WEBHOOK_SECRET = whsec_live_...
STRIPE_PRICE_PRO = price_live_...
NEXT_PUBLIC_STRIPE_PRICE_PRO = price_live_...
```

**Important**: 
- Mark sensitive variables as **"Sensitive"** in Vercel
- Use different `JWT_SECRET_KEY` for each environment
- Use test Stripe keys for dev/preview, live keys for production

---

## ✅ Step 8: Verify Complete Setup

### 8.1 Check Doppler Integration
```bash
npm run env:check:doppler
```

Or manually:
1. Vercel Dashboard → **Settings** → **Integrations**
2. Verify Doppler shows as "Connected"
3. Check last sync time

### 8.2 Check Environment Variables
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Verify all variables are present
3. Check that Doppler-synced vars have Doppler icon
4. Verify environment assignments (Development/Preview/Production)

### 8.3 Test Deployment
```bash
# Deploy to preview
vercel

# Or deploy to production
vercel --prod
```

### 8.4 Check Build Logs
- Verify no secret-related errors
- Check that secrets are accessible
- Test application features that require secrets

---

## 📊 What Gets Automated

| Service | Method | Variables | Automation |
|---------|--------|-----------|------------|
| **Storage (R2/S3)** | Doppler Integration | 9 vars | ✅ 100% |
| **Clerk** | Vercel Integration | 2 vars | ✅ 100% |
| **Stripe** | Vercel Integration | 2 vars | ✅ 100% |
| **Database** | Vercel Postgres | 1 var | ✅ 100% |
| **Redis** | Vercel KV | 2 vars | ✅ 100% |
| **Custom Configs** | Vercel Env Vars | ~5 vars | ⚠️ Manual |

**Total**: ~16 variables auto-synced, ~5 manual (simple configs)

---

## 🔄 How It Works

### Automatic Sync Flow

1. **Secrets in Doppler** → Automatically sync to Vercel
2. **Changes in Doppler** → Real-time updates in Vercel (10-30 seconds)
3. **Environment Mapping** → Each Vercel environment gets secrets from its mapped Doppler config
4. **No Manual Steps** → Once configured, fully automated

### Environment Mapping

```
Vercel Development  → Doppler dev config
Vercel Preview      → Doppler staging config
Vercel Production   → Doppler prod config
```

---

## 🛠️ Troubleshooting

### Integration Not Syncing

**Problem**: Secrets not appearing in Vercel after adding to Doppler

**Solutions**:
1. Check integration status in Vercel Dashboard
2. Verify environment mappings are correct
3. Wait 10-30 seconds (sync may take time)
4. Re-authorize the integration if needed
5. Check Doppler dashboard for sync errors

### Wrong Secrets Syncing

**Problem**: Wrong environment secrets appearing

**Solutions**:
1. Verify environment mappings in Vercel integration settings
2. Check which Doppler config is mapped to which Vercel environment
3. Ensure secrets are in the correct Doppler config

### Variables Not Available in Deployment

**Solutions**:
1. Verify secrets are set for the correct environment
2. Redeploy after adding/updating secrets
3. Check Vercel build logs for errors
4. Verify secret names match what code expects

### Doppler CLI Errors

**Problem**: "Invalid environment id"

**Solutions**:
1. Check existing environments: `doppler environments`
2. Use existing environment IDs (dev, preview, prd)
3. Or create new environments: `doppler environments create <name> <slug>`

---

## 📚 Additional Resources

- **[Doppler-Vercel Integration Guide](./DOPPLER_VERCEL_INTEGRATION.md)** - Complete integration documentation
- **[Quick Setup Secrets](./QUICK_SETUP_SECRETS.md)** - Quick 40-minute setup guide
- **[Recommended Secrets Strategy](./RECOMMENDED_SECRETS_STRATEGY.md)** - Best practices
- **[Doppler Documentation](https://docs.doppler.com)** - Official Doppler docs
- **[Vercel Integrations](https://vercel.com/integrations)** - Vercel integration docs

---

## ✅ Setup Checklist

- [ ] Doppler CLI installed
- [ ] Logged in to Doppler
- [ ] Ran `npm run doppler:setup`
- [ ] Added storage secrets to dev config
- [ ] Added storage secrets to staging config
- [ ] Added storage secrets to prod config
- [ ] Installed Doppler integration in Vercel
- [ ] Configured environment mappings (dev/staging/prod)
- [ ] Installed Clerk integration in Vercel
- [ ] Installed Stripe integration in Vercel
- [ ] Created Vercel Postgres database
- [ ] Added remaining environment variables in Vercel
- [ ] Marked sensitive variables as "Sensitive"
- [ ] Verified sync in Vercel Dashboard
- [ ] Tested deployment
- [ ] Verified secrets are accessible in deployment

---

## 🎉 Success!

Once all steps are complete, you have:
- ✅ **85%+ automation** for secrets management
- ✅ **Real-time sync** from Doppler to Vercel
- ✅ **Environment-specific** configurations
- ✅ **Secure** encrypted storage
- ✅ **Audit trails** for all secret access
- ✅ **Zero secrets in code**

Your deployment is now ready with automated secrets management! 🚀
