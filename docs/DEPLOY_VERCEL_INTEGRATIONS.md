# Deploy to Vercel with Built-in Integrations

This guide shows you how to deploy AppShot.ai to Vercel using Vercel's built-in integrations for Clerk, Stripe, and database connections, with environment-specific configurations.

## Overview

Vercel provides built-in integrations that:
- ✅ Automatically sync secrets from external services
- ✅ Support environment-specific values (Development, Preview, Production)
- ✅ Provide secure secret management
- ✅ Enable easy secret rotation
- ✅ Offer audit trails

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Clerk Integration](#2-clerk-integration)
3. [Stripe Integration](#3-stripe-integration)
4. [Database Integration](#4-database-integration)
5. [Storage Configuration](#5-storage-configuration)
6. [Environment-Specific Variables](#6-environment-specific-variables)
7. [Multiple Environments](#7-multiple-environments)
8. [Deployment Steps](#8-deployment-steps)

> **Quick Links:**
> - For automated secrets setup: [Quick Setup Secrets](./QUICK_SETUP_SECRETS.md)
> - For detailed secrets strategy: [Secrets Strategy](./RECOMMENDED_SECRETS_STRATEGY.md)
> - For Stripe setup details: [Stripe Integration](./STRIPE_PRICING_SYNC.md)

---

## 1. Project Setup

### Initial Vercel Project Configuration

1. **Import Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub/GitLab/Bitbucket repository

2. **Configure Build Settings**
   - **Root Directory**: Set to repository root (recommended) or `apps/web`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: 
     - If root is repo root: `npm --workspace apps/web run build`
     - If root is `apps/web`: `npm run build`
   - **Install Command**: `npm ci`
   - **Output Directory**: `.next` (auto-detected)

3. **Environment Variables**
   - We'll configure these using Vercel integrations (see below)

---

## 2. Clerk Integration

Vercel has a built-in Clerk integration that automatically syncs your Clerk credentials.

### Setup Steps

1. **Install Clerk Integration**
   - In Vercel Dashboard → Your Project → Settings → Integrations
   - Search for "Clerk"
   - Click "Add Integration"
   - Authorize Vercel to access your Clerk account

2. **Select Clerk Application**
   - Choose your Clerk application from the dropdown
   - Or create a new one if needed

3. **Environment-Specific Configuration**

   Vercel will automatically create these environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (synced from Clerk)
   - `CLERK_SECRET_KEY` (synced from Clerk)

4. **Additional Clerk Settings** (Manual)

   Set these manually in Vercel → Settings → Environment Variables:
   
   For **Development**:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
   - `ADMIN_EMAILS`: `dev-admin@example.com` (comma-separated)

   For **Preview**:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
   - `ADMIN_EMAILS`: `staging-admin@example.com`

   For **Production**:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
   - `ADMIN_EMAILS`: `admin@yourdomain.com`

5. **Configure Clerk Dashboard**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Add redirect URLs for each environment:
     - Development: `http://localhost:3000`
     - Preview: `https://your-preview-url.vercel.app`
     - Production: `https://yourdomain.com`

### Benefits

- ✅ Automatic secret sync
- ✅ Secret rotation handled automatically
- ✅ No manual key management
- ✅ Environment-specific values supported

---

## 3. Stripe Integration

Vercel's Stripe integration automatically syncs your Stripe API keys.

### Setup Steps

1. **Install Stripe Integration**
   - In Vercel Dashboard → Your Project → Settings → Integrations
   - Search for "Stripe"
   - Click "Add Integration"
   - Authorize Vercel to access your Stripe account

2. **Select Stripe Account**
   - Choose your Stripe account (Test or Live mode)
   - For multiple environments, you can use:
     - Test mode keys for Development/Preview
     - Live mode keys for Production

3. **Environment-Specific Configuration**

   Vercel will automatically create:
   - `STRIPE_SECRET_KEY` (synced from Stripe)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (synced from Stripe)

4. **Additional Stripe Settings** (Manual)

   Set these manually for each environment:

   For **Development** (Test Mode):
   - `STRIPE_WEBHOOK_SECRET`: `whsec_test_...` (from Stripe Dashboard)
   - `STRIPE_PRICE_PRO`: `price_test_...` (your test price ID)
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO`: `price_test_...` (same as above)

   For **Preview** (Test Mode):
   - `STRIPE_WEBHOOK_SECRET`: `whsec_test_...`
   - `STRIPE_PRICE_PRO`: `price_test_...`
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO`: `price_test_...`

   For **Production** (Live Mode):
   - `STRIPE_WEBHOOK_SECRET`: `whsec_live_...` (from Stripe Dashboard)
   - `STRIPE_PRICE_PRO`: `price_live_...` (your live price ID)
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO`: `price_live_...` (same as above)

5. **Configure Stripe Webhooks**

   For each environment, create a webhook endpoint in Stripe Dashboard:
   
   - **Development**: `http://localhost:3000/api/stripe/webhook` (use Stripe CLI for local)
   - **Preview**: `https://your-preview-url.vercel.app/api/stripe/webhook`
   - **Production**: `https://yourdomain.com/api/stripe/webhook`

   Webhook events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`

### Benefits

- ✅ Automatic API key sync
- ✅ Easy switching between test/live modes
- ✅ Secure key management
- ✅ Environment-specific webhook secrets

---

## 4. Database Integration

Vercel supports integrations with various database providers.

### Option A: Vercel Postgres (Recommended)

Vercel Postgres is a managed PostgreSQL service with built-in integration.

1. **Add Vercel Postgres**
   - In Vercel Dashboard → Your Project → Storage
   - Click "Create Database" → "Postgres"
   - Choose a region close to your users
   - Create the database

2. **Automatic Configuration**
   - Vercel automatically creates `POSTGRES_URL` environment variable
   - For Prisma, you'll need to map it to `DATABASE_URL`:
   
   In Vercel → Settings → Environment Variables:
   - Add `DATABASE_URL` and set it to the same value as `POSTGRES_URL`
   - Or use Vercel's environment variable reference: `$POSTGRES_URL`

3. **Environment-Specific Databases**

   Create separate databases for each environment:
   - **Development**: `getappshots-dev`
   - **Preview**: `getappshots-preview`
   - **Production**: `getappshots-prod`

   Each will have its own `POSTGRES_URL` automatically set.

4. **Run Migrations**

   After creating the database, run Prisma migrations:

   ```bash
   # For production
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

   You can do this via:
   - Vercel CLI: `vercel env pull` then run migrations locally
   - CI/CD pipeline
   - Vercel's Build Command (add migration step)

### Option B: External Database (Supabase, Neon, etc.)

If using an external PostgreSQL provider:

1. **Get Connection String**
   - From your database provider's dashboard
   - Format: `postgresql://user:password@host:port/database?schema=public`

2. **Set Environment Variable**
   - In Vercel → Settings → Environment Variables
   - Add `DATABASE_URL` for each environment:
     - Development: Your dev database URL
     - Preview: Your staging database URL
     - Production: Your production database URL

3. **Database Integrations**
   Some providers (like Supabase) have Vercel integrations:
   - Check Vercel Integrations marketplace
   - Install the integration if available
   - It will automatically sync connection strings

---

## 5. Storage Configuration

For Cloudflare R2 or AWS S3, configure manually (no built-in integration yet).

> **Note**: For automated storage secrets management, see [Quick Setup Secrets](./QUICK_SETUP_SECRETS.md) which covers using Doppler/1Password for storage credentials.

### Cloudflare R2 Setup

1. **Create R2 Bucket**
   - In Cloudflare Dashboard → R2
   - Create buckets for each environment:
     - `getappshots-dev`
     - `getappshots-preview`
     - `getappshots-prod`

2. **Generate API Tokens**
   - Create API tokens for each environment
   - Store them securely

3. **Set Environment Variables in Vercel**

   For **Development**:
   ```
   R2_ACCOUNT_ID=your-dev-account-id
   R2_BUCKET_NAME=getappshots-dev
   R2_ACCESS_KEY_ID=dev-access-key
   R2_SECRET_ACCESS_KEY=dev-secret-key
   STORAGE_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
   STORAGE_BUCKET=getappshots-dev
   STORAGE_REGION=auto
   STORAGE_ACCESS_KEY_ID=dev-access-key
   STORAGE_SECRET_ACCESS_KEY=dev-secret-key
   STORAGE_PUBLIC_BASE_URL=https://dev-storage.yourdomain.com (optional)
   ```

   For **Preview**:
   ```
   R2_ACCOUNT_ID=your-preview-account-id
   R2_BUCKET_NAME=getappshots-preview
   ... (same structure, different values)
   ```

   For **Production**:
   ```
   R2_ACCOUNT_ID=your-prod-account-id
   R2_BUCKET_NAME=getappshots-prod
   ... (same structure, different values)
   ```

### AWS S3 Setup

Similar to R2, but use S3 endpoints and credentials.

---

## 6. Environment-Specific Variables

Vercel supports three environment contexts:
- **Development**: Local development (`vercel dev`)
- **Preview**: Pull requests and preview deployments
- **Production**: Production deployments

### Setting Environment-Specific Values

1. **In Vercel Dashboard**
   - Go to Project → Settings → Environment Variables
   - When adding a variable, select which environments it applies to:
     - ☑️ Development
     - ☑️ Preview
     - ☑️ Production

2. **Example: Database URLs**

   | Variable | Development | Preview | Production |
   |----------|-------------|---------|------------|
   | `DATABASE_URL` | `postgresql://...dev...` | `postgresql://...preview...` | `postgresql://...prod...` |
   | `STORAGE_BUCKET` | `getappshots-dev` | `getappshots-preview` | `getappshots-prod` |

3. **Using Vercel CLI**

   ```bash
   # Set for all environments
   vercel env add DATABASE_URL production

   # Set for specific environment
   vercel env add DATABASE_URL preview
   ```

### Recommended Environment-Specific Variables

**Development:**
- Use test/staging credentials
- Use development database
- Use test Stripe keys
- Use development storage bucket

**Preview:**
- Use staging credentials
- Use preview/staging database
- Use test Stripe keys
- Use preview storage bucket

**Production:**
- Use production credentials
- Use production database
- Use live Stripe keys
- Use production storage bucket

---

## 7. Multiple Environments

### Option A: Single Project, Multiple Environments

Use Vercel's built-in environment contexts (Development, Preview, Production).

**Pros:**
- ✅ Simple setup
- ✅ Automatic environment detection
- ✅ Built-in preview deployments

**Cons:**
- ⚠️ All environments share the same project
- ⚠️ Less isolation

### Option B: Multiple Projects (Recommended for Production)

Create separate Vercel projects for each environment.

1. **Create Projects**
   - `getappshots-dev` (Development)
   - `getappshots-staging` (Staging/Preview)
   - `getappshots-prod` (Production)

2. **Configure Each Project**
   - Each project has its own:
     - Integrations (Clerk, Stripe)
     - Environment variables
     - Database connections
     - Domain configuration

3. **Deployment Strategy**
   - **Dev**: Deploy from `develop` branch
   - **Staging**: Deploy from `staging` branch or PR previews
   - **Production**: Deploy from `main` branch

### Recommended Setup

```
Project: getappshots-dev
├── Branch: develop
├── Domain: dev.getappshots.com
├── Database: Vercel Postgres (dev)
├── Clerk: Test application
└── Stripe: Test mode

Project: getappshots-staging
├── Branch: staging
├── Domain: staging.getappshots.com
├── Database: Vercel Postgres (staging)
├── Clerk: Test application
└── Stripe: Test mode

Project: getappshots-prod
├── Branch: main
├── Domain: getappshots.com
├── Database: Vercel Postgres (prod)
├── Clerk: Live application
└── Stripe: Live mode
```

---

## 8. Deployment Steps

### Initial Deployment

1. **Set up Vercel Project**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Link project
   vercel link
   ```

2. **Install Integrations**
   - Clerk integration
   - Stripe integration
   - Database integration (if using Vercel Postgres)

3. **Configure Environment Variables**
   - Set all required variables for each environment
   - Use integrations where possible
   - Set manual variables for storage, etc.

4. **Deploy**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

5. **Run Migrations**
   ```bash
   # Pull environment variables
   vercel env pull .env.local

   # Run migrations
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

### Continuous Deployment

Once set up, Vercel automatically:
- ✅ Deploys on push to connected branches
- ✅ Creates preview deployments for PRs
- ✅ Uses environment-specific variables automatically
- ✅ Syncs secrets from integrations

### Additional Configuration

1. **Vercel-Specific Settings**
   - Set in Vercel Dashboard or `vercel.json`:
   
   ```json
   {
     "buildCommand": "npm --workspace apps/web run build",
     "installCommand": "npm ci",
     "framework": "nextjs",
     "regions": ["iad1"],
     "env": {
       "SCRAPE_QUEUE_MODE": "sync",
       "PLAY_SCRAPE_MODE": "html",
       "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT": "false"
     }
   }
   ```

2. **Custom Domains**
   - Add domains in Vercel → Settings → Domains
   - Configure DNS records as instructed
   - SSL certificates are automatic

---

## Summary

### ✅ What Vercel Integrations Provide

- **Clerk**: Automatic auth key sync
- **Stripe**: Automatic payment key sync
- **Vercel Postgres**: Automatic database connection
- **Environment Variables**: Environment-specific values
- **Secret Management**: Secure, encrypted storage

### 📋 Checklist

- [ ] Create Vercel project(s)
- [ ] Install Clerk integration
- [ ] Install Stripe integration
- [ ] Set up database (Vercel Postgres or external)
- [ ] Configure storage (R2/S3) manually
- [ ] Set environment-specific variables
- [ ] Configure webhooks (Stripe, Clerk)
- [ ] Run database migrations
- [ ] Deploy and test

### 🎯 Benefits

- ✅ No manual secret management
- ✅ Automatic secret rotation
- ✅ Environment isolation
- ✅ Easy setup and maintenance
- ✅ Built-in security best practices

---

## Troubleshooting

### Integration Not Syncing

1. Check integration status in Vercel Dashboard
2. Re-authorize the integration if needed
3. Verify service account permissions

### Environment Variables Not Loading

1. Verify variable is set for correct environment
2. Check variable name matches code exactly
3. Redeploy after adding new variables

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check database is accessible from Vercel's IP ranges
3. Ensure SSL is enabled if required

---

For more details, see:
- [Vercel Integrations Documentation](https://vercel.com/docs/integrations)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
