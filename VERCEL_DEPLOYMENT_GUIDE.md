# Vercel Deployment Guide - AppShot.ai

Complete step-by-step guide to deploy AppShot.ai on Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A Vercel account ([sign up](https://vercel.com/signup))
2. ✅ A GitHub/GitLab/Bitbucket account (for repository hosting)
3. ✅ External services set up (see below)

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Push to Git

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket):

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify Project Structure

Your project should have:
- ✅ `apps/web/` - Next.js application
- ✅ `package.json` at root (monorepo setup)
- ✅ `apps/web/package.json` - Web app dependencies
- ✅ `apps/web/prisma/schema.prisma` - Database schema

---

## 🔧 Step 2: Configure Next.js for Vercel

The project is already configured for Vercel, but verify `apps/web/next.config.mjs`:

```javascript
// apps/web/next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  // Note: 'output: "standalone"' is for Docker, Vercel ignores it
  images: {
    remotePatterns: [
      // App Store images
      { protocol: "https", hostname: "is1-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is2-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is3-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is4-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is5-ssl.mzstatic.com" },
      // Google Play images
      { protocol: "https", hostname: "play-lh.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};
```

---

## 🌐 Step 3: Set Up External Services

### 3.1 PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. In Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "Postgres"
3. Choose a plan and region
4. Copy the connection string (will be used as `DATABASE_URL`)

**Option B: External PostgreSQL**
- Use services like:
  - [Neon](https://neon.tech) (serverless Postgres)
  - [Supabase](https://supabase.com)
  - [Railway](https://railway.app)
  - [AWS RDS](https://aws.amazon.com/rds/)
- Get connection string in format: `postgresql://user:password@host:port/database?schema=public`

### 3.2 Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your keys from **Settings → API Keys**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
4. Configure redirect URLs in **Settings → Redirect URLs**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.vercel.app` (or your custom domain)
5. Add sign-in/sign-up URLs (optional but recommended):
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
6. Configure redirect behavior using environment variables (recommended):
   - `CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard` - Always redirect here after sign-in
   - `CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard` - Always redirect here after sign-up
   - `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard` - Fallback if no redirect_url query param
   - `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard` - Fallback if no redirect_url query param
   
   **Note:** Force redirect URLs override all other redirects. Fallback URLs are used only when no `redirect_url` query parameter is present in the initial URL.

### 3.3 Stripe Payment Processing

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from **Developers → API keys**:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
3. **Create products and prices** (Recommended: Use automatic sync):
   
   **Option A: Automatic Sync (Recommended)**
   - Pricing is configured in `apps/web/lib/pricing-config.ts`
   - Run `npm run stripe:sync` to automatically create/update Stripe products and prices
   - The script will output the price IDs to add to your environment variables
   - See [STRIPE_PRICING_SYNC.md](./docs/STRIPE_PRICING_SYNC.md) for detailed instructions
   
   **Option B: Manual Setup**
   - Go to **Products** → Create product
   - Create a "Pro" plan and note the Price ID (starts with `price_`)
   - Set `STRIPE_PRICE_PRO` and `NEXT_PUBLIC_STRIPE_PRICE_PRO` to this Price ID
   
4. Set up webhook:
   - Go to **Developers → Webhooks**
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.vercel.app/api/stripe/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.created`
     - `invoice.finalized`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### 3.4 Storage (Cloudflare R2 - Recommended)

1. Sign up for [Cloudflare](https://dash.cloudflare.com/sign-up)
2. Go to **R2** in the dashboard
3. Create a new bucket
4. Go to **R2 API** → **Manage R2 API Tokens**
5. Create API token with read/write permissions
6. Note down:
   - **Account ID** → `R2_ACCOUNT_ID`
   - **Bucket name** → `R2_BUCKET_NAME`
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
7. Set storage variables:
   - `STORAGE_ENDPOINT_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
   - `STORAGE_BUCKET=<R2_BUCKET_NAME>`
   - `STORAGE_REGION=auto`
   - `STORAGE_ACCESS_KEY_ID=<R2_ACCESS_KEY_ID>`
   - `STORAGE_SECRET_ACCESS_KEY=<R2_SECRET_ACCESS_KEY>`
   - `STORAGE_PUBLIC_BASE_URL` (optional - for public URLs)

**Alternative: AWS S3**
- Use AWS S3 if preferred
- Set `STORAGE_ENDPOINT_URL`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`

### 3.5 Redis (Optional but Recommended)

For caching and improved performance:

**Option A: Upstash Redis (Recommended for Vercel)**
1. Go to [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy the REST URL → `REDIS_URL`

**Option B: Vercel KV (Redis-compatible)**
1. In Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "KV"
3. Copy the connection string → `REDIS_URL`

**Option C: External Redis**
- Use services like Redis Cloud, AWS ElastiCache, etc.

---

## 📦 Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Select your repository and click **"Import"**

### 4.2 Configure Project Settings

**Root Directory:**
- **Option 1 (Recommended)**: Set to `apps/web`
  - Build Command: `npm run build`
  - Install Command: `cd ../.. && npm ci && cd apps/web && npm ci`
  
- **Option 2**: Set to repository root
  - Build Command: `npm --workspace apps/web run build`
  - Install Command: `npm ci`

**Framework Preset:** Next.js (auto-detected)

**Output Directory:** Leave empty (Next.js handles this)

### 4.3 Set Environment Variables

Go to **Settings → Environment Variables** and add:

#### Database
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...  # Get from: npm run stripe:sync
STRIPE_PRICE_PRO=price_...              # Get from: npm run stripe:sync
```

**Note:** Price IDs are automatically generated when you run `npm run stripe:sync`. See [STRIPE_PRICING_SYNC.md](./docs/STRIPE_PRICING_SYNC.md) for details.

#### Storage (Cloudflare R2)
```
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
STORAGE_ENDPOINT_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
STORAGE_BUCKET=your_bucket_name
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
STORAGE_PUBLIC_BASE_URL=https://your-bucket.r2.dev (optional)
```

#### Vercel-Specific Settings (IMPORTANT)
```
SCRAPE_QUEUE_MODE=sync
PLAY_SCRAPE_MODE=html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false
```

#### Redis (Optional)
```
REDIS_URL=redis://... or https://... (for Upstash)
```

**Important:**
- Set variables for **Production**, **Preview**, and **Development** environments
- Use **Production** values for production deployments
- Use **Preview** values for preview deployments

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

---

## 🗄️ Step 5: Run Database Migrations

**IMPORTANT:** Run Prisma migrations before using the app.

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations (using production DATABASE_URL)
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### Option B: Using CI/CD

Add a GitHub Action or similar to run migrations on deploy:

```yaml
# .github/workflows/migrate.yml
name: Run Migrations
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Option C: Manual Migration Script

Create a one-time migration script and run it:

```bash
# Set DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Run migration
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Health Endpoint

Visit: `https://your-project.vercel.app/api/health`

Should return: `{ "status": "ok" }`

### 6.2 Test Authentication

1. Visit: `https://your-project.vercel.app/sign-in`
2. Try signing up/signing in with Clerk
3. Verify redirects work correctly

### 6.3 Test Stripe Webhook

1. In Stripe Dashboard → Webhooks
2. Send a test event
3. Check Vercel function logs for webhook processing

### 6.4 Test Scraping

1. Sign in to your app
2. Try scraping an app URL
3. Verify ZIP generation and upload to storage

---

## 🔧 Step 7: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

---

## ⚙️ Step 8: Optimize for Production

### 8.1 Function Timeout Settings

Vercel has function timeout limits:
- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 900 seconds

If scraping takes longer, consider:
- Using `SCRAPE_QUEUE_MODE=sync` (already set)
- Moving heavy operations to external workers
- Optimizing scraping logic

### 8.2 Environment-Specific Settings

Set different values for Production vs Preview:

**Production:**
- Use live Stripe keys (`sk_live_...`, `pk_live_...`)
- Use live Clerk keys (`sk_live_...`, `pk_live_...`)
- Use production database

**Preview:**
- Use test Stripe keys
- Use test Clerk keys
- Use staging database (optional)

### 8.3 Monitoring

1. Set up Vercel Analytics (optional)
2. Monitor function logs in Vercel Dashboard
3. Set up error tracking (Sentry, etc.)

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build command fails
- **Solution:** Check that root directory is set correctly
- **Solution:** Ensure `package.json` exists at root and in `apps/web/`

### Database Connection Errors

**Issue:** `Can't reach database server`
- **Solution:** Verify `DATABASE_URL` is correct
- **Solution:** Check database allows connections from Vercel IPs
- **Solution:** For Vercel Postgres, ensure database is in the same region

### Prisma Client Errors

**Issue:** `PrismaClient is not generated`
- **Solution:** Add to `package.json` build script:
  ```json
  "build": "prisma generate && next build"
  ```
- Or use Vercel build command: `npm run prisma:generate && npm run build`

### Function Timeout

**Issue:** Scraping times out
- **Solution:** Ensure `SCRAPE_QUEUE_MODE=sync` is set
- **Solution:** Consider moving to async processing with external workers
- **Solution:** Upgrade Vercel plan for longer timeouts

### Environment Variables Not Loading

**Issue:** Variables not available at runtime
- **Solution:** Redeploy after adding variables
- **Solution:** Check variable names match exactly (case-sensitive)
- **Solution:** Verify variables are set for correct environment (Production/Preview)

### Clerk Redirect Issues

**Issue:** Redirects not working
- **Solution:** Verify redirect URLs in Clerk Dashboard match your domain
- **Solution:** Check `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` are set

### Stripe Webhook Not Working

**Issue:** Webhooks not received
- **Solution:** Verify webhook URL is correct: `https://yourdomain.com/api/stripe/webhook`
- **Solution:** Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- **Solution:** Check Vercel function logs for errors

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Clerk with Vercel](https://clerk.com/docs/quickstarts/nextjs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Database migrations have been run
- [ ] Clerk application is configured with production URLs
- [ ] Stripe webhook is set up and tested
- [ ] Storage bucket (R2/S3) is created and accessible
- [ ] Custom domain is configured (if using)
- [ ] SSL certificate is active
- [ ] Health endpoint returns `{ "status": "ok" }`
- [ ] Authentication flow works
- [ ] Payment flow works
- [ ] Scraping functionality works
- [ ] Error tracking is set up
- [ ] Monitoring is configured

---

## 🎉 You're Live!

Your AppShot.ai application is now deployed on Vercel! 🚀

For support or questions, refer to the main README or project documentation.
