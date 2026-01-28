# 🚀 Complete Deployment Guide

**Last Updated**: January 18, 2026  
**Deployment Readiness**: ✅ 100%

---

## 📋 Quick Command Reference

```bash
# Check if ready to deploy
npm run check:deployment

# Set up all external services (interactive)
npm run setup:services

# Set up database only
npm run setup:database

# Deploy to Vercel (full wizard)
npm run deploy:vercel

# Verify environment configuration
npm run env:check

# Sync all env to Vercel (Doppler → Development, Preview, Production)
npm run env:sync:all
```
See **[docs/ENV_SYNC_WITH_VERCEL.md](docs/ENV_SYNC_WITH_VERCEL.md)** for the full env layout and sync options.

---

## 🎯 Three Deployment Paths

Choose the path that fits your needs:

### Path 1: Automated Setup (Recommended) ⏱️ 1-2 hours
**Best for**: First-time deployment, complete automation

```bash
# Step 1: Run external services setup wizard
npm run setup:services
# Follow the interactive prompts for Clerk, Stripe, Database, Storage, Redis

# Step 2: Run deployment wizard
npm run deploy:vercel
# Wizard handles: Vercel login, project linking, migrations, deployment
```

**What this does:**
- Walks you through creating accounts for all services
- Collects all API keys and credentials
- Generates `.env.local` file automatically
- Tests database connection
- Runs migrations
- Deploys to Vercel with full configuration

---

### Path 2: Manual Setup (Advanced) ⏱️ 2-3 hours
**Best for**: Experienced developers who want full control

#### Step 1: Set Up External Services

**Clerk (Authentication)**
1. Visit https://dashboard.clerk.com
2. Create application
3. Copy keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ADMIN_EMAILS=your@email.com
   ```

**Stripe (Payments)**
1. Visit https://dashboard.stripe.com
2. Get API keys (Developers > API Keys)
3. Create products and pricing
4. Set up webhook: `/api/stripe/webhook`
5. Copy to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO=price_...
   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
   ```

**Database (PostgreSQL)**

Option A - Local Docker:
```bash
docker run --name getappshots-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Add to .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/getappshots?schema=public"
```

Option B - Vercel Postgres:
1. Go to Vercel project > Storage > Create Database > Postgres
2. Copy `DATABASE_URL` to `.env.local`

**Storage (Cloudflare R2)**
1. Visit https://dash.cloudflare.com
2. Navigate to R2 Object Storage
3. Create bucket and API token
4. Add to `.env.local`:
   ```bash
   R2_ACCOUNT_ID=...
   R2_BUCKET_NAME=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   STORAGE_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
   STORAGE_BUCKET=...
   STORAGE_REGION=auto
   STORAGE_ACCESS_KEY_ID=...
   STORAGE_SECRET_ACCESS_KEY=...
   ```

#### Step 2: Run Migrations

```bash
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

#### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

### Path 3: Hybrid (Fastest with Integrations) ⏱️ 40 minutes
**Best for**: Speed + security using Vercel integrations

#### Step 1: Vercel Integrations (15 min)
1. Go to Vercel project > Settings > Integrations
2. Install these integrations:
   - **Clerk** → Auto-syncs auth keys
   - **Stripe** → Auto-syncs payment keys  
   - **Vercel Postgres** → Auto-creates database
   - **Vercel KV** → Auto-creates Redis (optional)

#### Step 2: Doppler for Storage (10 min)
1. Create Doppler account at https://doppler.com
2. Create project and add storage credentials
3. Install Doppler integration in Vercel
4. Storage keys auto-sync to Vercel

#### Step 3: Manual Variables (5 min)
In Vercel > Settings > Environment Variables, add:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ADMIN_EMAILS=your@email.com
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

#### Step 4: Deploy (10 min)
```bash
vercel --prod
```

**Result**: 90% of variables auto-synced, fully automated secret rotation!

---

## 📚 Detailed Step-by-Step Instructions

### Part 1: External Services Setup

#### 🔐 Clerk Setup (10 minutes)

**What is Clerk?**
Clerk handles user authentication, sign-up, sign-in, and user management.

**Steps:**
1. Go to https://dashboard.clerk.com
2. Click "Add application"
3. Name: "AppShot.ai" (or your preferred name)
4. Choose "Next.js" as framework
5. Copy your keys:
   - Publishable Key (starts with `pk_test_...`)
   - Secret Key (starts with `sk_test_...`)

6. Configure redirect URLs:
   - Go to "Paths" in settings
   - Add these paths:
     - Sign in URL: `/sign-in`
     - Sign up URL: `/sign-up`
     - After sign in: `/dashboard`
     - After sign up: `/dashboard`

7. Add allowed origins (after deployment):
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

**Environment Variables:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ADMIN_EMAILS=your@email.com,admin@yourdomain.com
```

---

#### 💳 Stripe Setup (20 minutes)

**What is Stripe?**
Stripe handles payments, subscriptions, and billing.

**Steps:**
1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Switch to **Test mode** (toggle in sidebar)

4. **Get API Keys:**
   - Go to Developers > API Keys
   - Copy "Publishable key" and "Secret key"

5. **Create Products:**
   - Go to Products > Add Product
   - Create a "Pro" or "Premium" plan:
     - Name: "Pro Plan"
     - Description: "Premium features"
     - Pricing: Set your price (e.g., $29/month)
     - Copy the **Price ID** (starts with `price_test_...`)

6. **Set Up Webhooks:**
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - For local testing: Use Stripe CLI
   - For production: `https://yourdomain.com/api/stripe/webhook`
   - Select these events:
     ```
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.created
     invoice.finalized
     invoice.paid
     invoice.payment_failed
     ```
   - Copy the **Webhook Signing Secret** (starts with `whsec_...`)

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_test_...
```

**Local Stripe Testing:**
```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

#### 🗄️ Database Setup (15 minutes)

**What database do you need?**
PostgreSQL 16+ for storing users, subscriptions, screenshots, etc.

**Option A: Vercel Postgres (Recommended for Vercel)**

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Choose region (pick one close to your users)
5. Click "Create"
6. Go to ".env.local" tab
7. Copy the `DATABASE_URL`

**Option B: Local Docker (For Development)**

```bash
# Start PostgreSQL container
docker run --name getappshots-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/getappshots?schema=public"
```

**Option C: Cloud Providers**

- **Neon** (Serverless): https://neon.tech
- **Supabase**: https://supabase.com
- **AWS RDS**: Most flexible, more setup
- **Google Cloud SQL**: Good for GCP users

**Run Migrations:**
```bash
# Generate Prisma Client
npx prisma generate --schema apps/web/prisma/schema.prisma

# Apply migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# (Optional) View database
npx prisma studio --schema apps/web/prisma/schema.prisma
```

**Environment Variable:**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require"
```

---

#### 📦 Storage Setup (15 minutes)

**What storage do you need?**
S3-compatible storage for screenshots and files.

**Option A: Cloudflare R2 (Recommended)**

Why R2?
- S3-compatible API
- No egress fees (free data transfer)
- Fast global CDN
- Cheaper than S3

Steps:
1. Go to https://dash.cloudflare.com
2. Navigate to R2 Object Storage
3. Click "Create bucket"
   - Name: `getappshots-prod` (or your choice)
   - Location: Automatic
4. Go to "Manage R2 API Tokens"
5. Click "Create API Token"
   - Name: "getappshots-api"
   - Permissions: "Edit"
   - Apply to: "Select buckets" → choose your bucket
6. Copy Account ID, Access Key, Secret Key

**Environment Variables:**
```bash
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=getappshots-prod
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
STORAGE_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com
STORAGE_BUCKET=getappshots-prod
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=your_access_key
STORAGE_SECRET_ACCESS_KEY=your_secret_key
```

**Option B: AWS S3**

1. Go to AWS Console > S3
2. Create bucket
3. Create IAM user with S3 permissions
4. Generate access keys

**Environment Variables:**
```bash
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=your_aws_key
STORAGE_SECRET_ACCESS_KEY=your_aws_secret
STORAGE_ENDPOINT_URL=https://s3.us-east-1.amazonaws.com
```

---

#### 🔄 Redis Setup (10 minutes) - Optional

**What is Redis used for?**
Caching, rate limiting, and background job queues.

**Option A: Vercel KV (Easiest)**

1. Vercel project > Storage > Create Database > KV
2. Copy `KV_URL` or `REDIS_URL`

**Option B: Local Docker**

```bash
docker run --name getappshots-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Connection string
REDIS_URL="redis://localhost:6379"
```

**Option C: Upstash (Serverless)**

1. Go to https://upstash.com
2. Create Redis database
3. Copy connection string

**Environment Variable:**
```bash
REDIS_URL="redis://your-redis-url:6379"
```

---

### Part 2: Vercel Deployment

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Link Project

```bash
vercel link
```

Follow prompts:
- Create new project or link existing?
- Choose your scope/team
- Project name: getappshots (or your choice)

#### Step 4: Push Environment Variables

You have two options:

**Option A: Use Vercel Dashboard (Recommended)**
1. Go to project > Settings > Environment Variables
2. Add all variables from `.env.local`
3. Set appropriate environments (Development, Preview, Production)

**Option B: Use Vercel CLI**
```bash
# For each variable
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME development
```

#### Step 5: Deploy

**Preview Deployment (for testing):**
```bash
vercel
```

**Production Deployment:**
```bash
vercel --prod
```

---

## 🧪 Testing Your Deployment

### 1. Authentication Test
- Visit your deployment URL
- Click "Sign Up"
- Create a test account
- Verify email confirmation
- Sign in successfully

### 2. Payment Test
- Go to billing/pricing page
- Click subscribe
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- Verify subscription created

### 3. Screenshot Test
- Go to dashboard
- Enter an app URL (e.g., `com.spotify.music`)
- Click "Generate Screenshots"
- Verify screenshots load
- Test download functionality

### 4. Storage Test
- Upload a file
- Verify it appears in R2/S3 bucket
- Verify public URL works

---

## 🔧 Troubleshooting

### Build Fails

**Error: Missing environment variable**
```bash
# Solution: Add missing variable in Vercel dashboard
# Or run locally:
npm run env:check
```

**Error: Prisma Client not generated**
```bash
# Solution: Prisma generation is in build command
# Check apps/web/package.json build script includes:
# prisma generate --schema prisma/schema.prisma
```

### Database Issues

**Error: Can't connect to database**
```bash
# Check connection string format
# Should be: postgresql://user:pass@host:5432/db?schema=public

# Test connection locally
npx prisma db pull --schema apps/web/prisma/schema.prisma
```

**Error: Migrations haven't run**
```bash
# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### Clerk Issues

**Error: Redirect URL not allowed**
- Add your deployment URL to Clerk dashboard
- Go to Clerk > Settings > Paths
- Add production domain to allowed origins

### Stripe Issues

**Error: Webhook signature verification failed**
- Verify webhook endpoint URL is correct
- Check webhook secret matches
- Ensure webhook is listening to correct events

**Error: Price ID not found**
- Verify price ID in Stripe dashboard
- Ensure using correct mode (test vs live)
- Check price ID starts with `price_`

### Storage Issues

**Error: Access denied**
- Verify access keys are correct
- Check bucket permissions
- Ensure CORS is configured (if using custom domain)

---

## 📊 Post-Deployment Checklist

### Immediate
- [ ] Deployment successful
- [ ] App loads at URL
- [ ] Sign up works
- [ ] Sign in works
- [ ] Payment test successful
- [ ] Screenshot generation works
- [ ] File uploads work

### Configuration
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Webhooks configured (Stripe, Clerk)
- [ ] Environment variables verified
- [ ] Database migrations applied
- [ ] Analytics/monitoring set up

### Security
- [ ] All secrets stored securely
- [ ] No .env files in git
- [ ] API keys rotated from examples
- [ ] Admin emails configured
- [ ] Rate limiting active
- [ ] CORS configured correctly

### Performance
- [ ] Images optimized
- [ ] CDN working
- [ ] Database queries optimized
- [ ] Caching configured (if using Redis)

---

## 🔒 Vercel Protection Rules & Deploy Hooks

Configure **Protection Rules** and **Deploy Hooks** in Vercel for safe production and CI/CD:

- **Protection Rules** (Vercel → Settings → Git): Require approval before production deployment; enable “Automatically cancel old deployments”; skip builds on commits with `[skip ci]`; optional password protection for preview deployments.
- **Deploy Hooks**: Create hook URLs in Vercel → Settings → Git → Deploy Hooks. Store them as `VERCEL_DEPLOY_HOOK_PREVIEW` and `VERCEL_DEPLOY_HOOK_PRODUCTION` (never commit). Trigger via: `./scripts/deploy-hook.sh preview` or `./scripts/deploy-hook.sh production`.
- **Best practices**: Use branch protection (prevent direct pushes to `main`); test in preview before production; use descriptive branch names (`feat/`, `fix/`, `chore/`); monitor deployments and set up alerts for failures; use preview URLs for stakeholder reviews; clean up old branches (Vercel removes previews for deleted branches).

See **[docs/VERCEL_PROTECTION_AND_DEPLOY_HOOKS.md](docs/VERCEL_PROTECTION_AND_DEPLOY_HOOKS.md)** for full setup.

---

## 🎯 What's Next?

1. **Custom Domain**: Add your domain in Vercel dashboard
2. **Analytics**: Set up Vercel Analytics or Google Analytics
3. **Monitoring**: Add error tracking (Sentry, LogRocket)
4. **Testing**: Write E2E tests with Playwright
5. **Documentation**: Update README with your domain
6. **Marketing**: Launch! 🚀

---

## 📞 Getting Help

- **Documentation**: Check `/docs` folder
- **Vercel Support**: https://vercel.com/support
- **Clerk Support**: https://clerk.com/support  
- **Stripe Support**: https://support.stripe.com

---

**Congratulations!** You've successfully deployed AppShot.ai! 🎉
