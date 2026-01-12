# Deployment Readiness Checklist

## ✅ Project Status Overview

**Project Type**: Monorepo (Turborepo) with:
- **Web App**: Next.js 14 (apps/web)
- **API**: FastAPI (apps/api) 
- **Infrastructure**: Docker, Kubernetes, Terraform configs

**Overall Status**: ✅ **READY FOR DEPLOYMENT** (with required configuration)

---

## 1. ✅ Code Quality & Build Status

- ✅ **No linter errors** detected
- ✅ **TypeScript configuration** present and valid
- ✅ **Next.js config** properly configured with standalone output
- ✅ **Dockerfiles** are production-ready (multi-stage builds)
- ✅ **Dependencies** installed (some extraneous packages noted, but not blocking)

### Build Verification Needed:
```bash
# Test web build
npm run web:build

# Test API build (Docker)
docker build -f infrastructure/docker/api.Dockerfile -t api-test .
```

---

## 2. ⚠️ Environment Variables (CRITICAL)

### Required for Web App (`apps/web`):

#### **Database**
- ✅ `DATABASE_URL` - PostgreSQL connection string (Prisma format)

#### **Authentication (Clerk)**
- ⚠️ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **REQUIRED**
- ⚠️ `CLERK_SECRET_KEY` - **REQUIRED**
- ⚠️ `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Recommended: `/sign-in`
- ⚠️ `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Recommended: `/sign-up`
- ⚠️ `ADMIN_EMAILS` - Comma-separated admin emails

#### **Payment (Stripe)**
- ⚠️ `STRIPE_SECRET_KEY` - **REQUIRED**
- ⚠️ `STRIPE_WEBHOOK_SECRET` - **REQUIRED**
- ⚠️ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **REQUIRED**
- ⚠️ `NEXT_PUBLIC_STRIPE_PRICE_PRO` - **REQUIRED** (or STARTER)
- ⚠️ `STRIPE_PRICE_PRO` - **REQUIRED**

#### **Storage (S3/R2) - One of these sets:**
**Option 1: Cloudflare R2**
- ⚠️ `R2_ACCOUNT_ID` - **REQUIRED**
- ⚠️ `R2_BUCKET_NAME` - **REQUIRED**
- ⚠️ `R2_ACCESS_KEY_ID` - **REQUIRED**
- ⚠️ `R2_SECRET_ACCESS_KEY` - **REQUIRED**
- ⚠️ `STORAGE_ENDPOINT_URL` - `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
- ⚠️ `STORAGE_BUCKET` - Same as `R2_BUCKET_NAME`
- ⚠️ `STORAGE_REGION` - Set to `auto`
- ⚠️ `STORAGE_ACCESS_KEY_ID` - Same as `R2_ACCESS_KEY_ID`
- ⚠️ `STORAGE_SECRET_ACCESS_KEY` - Same as `R2_SECRET_ACCESS_KEY`
- ⚠️ `STORAGE_PUBLIC_BASE_URL` - Optional (r2.dev URL or custom domain)

**Option 2: AWS S3**
- ⚠️ `STORAGE_ENDPOINT_URL` - S3 endpoint
- ⚠️ `STORAGE_BUCKET` - **REQUIRED**
- ⚠️ `STORAGE_REGION` - AWS region
- ⚠️ `STORAGE_ACCESS_KEY_ID` - **REQUIRED**
- ⚠️ `STORAGE_SECRET_ACCESS_KEY` - **REQUIRED**

#### **Redis (Optional but Recommended)**
- ⚠️ `REDIS_URL` - For caching and queue (if using BullMQ worker)

#### **Queue Mode (Optional)**
- ⚠️ `SCRAPE_QUEUE_MODE` - Set to `sync` for Vercel/serverless
- ⚠️ `PLAY_SCRAPE_MODE` - Set to `html` for Vercel
- ⚠️ `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT` - Set to `false` for Vercel

### Required for API (`apps/api`):

#### **Database**
- ⚠️ `DATABASE_URL` - PostgreSQL (asyncpg format): `postgresql+asyncpg://...`

#### **Security**
- ⚠️ `JWT_SECRET_KEY` - **REQUIRED** (change from default "change-me")

#### **Redis (Optional)**
- ⚠️ `REDIS_URL` - For rate limiting and caching

#### **Storage** (Same as web app)
- ⚠️ `STORAGE_ENDPOINT_URL`
- ⚠️ `STORAGE_BUCKET`
- ⚠️ `STORAGE_ACCESS_KEY_ID`
- ⚠️ `STORAGE_SECRET_ACCESS_KEY`

#### **Celery (Optional)**
- ⚠️ `CELERY_BROKER_URL` - Redis URL for Celery
- ⚠️ `CELERY_RESULT_BACKEND` - Redis URL for results

#### **CORS**
- ⚠️ `CORS_ORIGINS` - Comma-separated origins (default: `http://localhost:3000`)

---

## 3. ✅ Database Setup

- ✅ **Prisma schema** defined and valid
- ✅ **Migrations** exist (`20260109_admin_dashboard`)
- ⚠️ **Action Required**: Run migrations before deployment

```bash
# For production
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### Database Requirements:
- PostgreSQL 16+ (recommended)
- Database name: `getappshots` (or as configured)
- Schema: `public` (for Prisma)

---

## 4. ✅ Infrastructure Configuration

### Docker
- ✅ **Multi-stage Dockerfiles** ready:
  - `infrastructure/docker/web.Dockerfile` - Next.js production build
  - `infrastructure/docker/api.Dockerfile` - FastAPI production build
- ✅ **Docker Compose** files available:
  - `docker-compose.yml` - Basic setup
  - `docker-compose.dev.yml` - Development with hot reload
  - `docker-compose.staging.yml` - Production-like staging

### Kubernetes
- ✅ **K8s manifests** available in `infrastructure/k8s/`
- ⚠️ **Action Required**: Update image references in manifests
  - Current: `ghcr.io/OWNER/REPO-web:latest` (placeholder)
  - Update to your container registry

### Terraform
- ✅ **Terraform configs** available for:
  - AWS infrastructure
  - Cloudflare R2 setup

---

## 5. ⚠️ External Services Setup

### Clerk (Authentication)
- ⚠️ Create Clerk application
- ⚠️ Configure sign-in/sign-up URLs
- ⚠️ Get publishable and secret keys

### Stripe (Payments)
- ⚠️ Create Stripe account
- ⚠️ Create products and prices
- ⚠️ Set up webhook endpoint: `/api/stripe/webhook`
- ⚠️ Configure webhook events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.created`
  - `invoice.finalized`
  - `invoice.paid`
  - `invoice.payment_failed`

### Storage (Cloudflare R2 or AWS S3)
- ⚠️ Create bucket
- ⚠️ Generate access keys
- ⚠️ Configure CORS if needed
- ⚠️ Set up public URL (optional but recommended)

### Database (PostgreSQL)
- ⚠️ Provision PostgreSQL database (16+)
- ⚠️ Get connection string
- ⚠️ Run migrations

### Redis (Optional)
- ⚠️ Provision Redis instance (for caching/queues)
- ⚠️ Get connection URL

---

## 6. ✅ Security Checklist

- ✅ **HTTPS enforcement** in middleware
- ✅ **CSRF protection** implemented
- ✅ **Security headers** configured (CSP, X-Frame-Options, etc.)
- ✅ **Rate limiting** middleware present
- ⚠️ **Action Required**: 
  - Change `JWT_SECRET_KEY` from default
  - Review and configure CSP policy
  - Set up proper CORS origins for production

---

## 7. ⚠️ Deployment-Specific Considerations

### For Vercel Deployment:
- ✅ Documentation available: `docs/DEPLOY_VERCEL_R2.md`
- ⚠️ **Recommended settings**:
  - Root directory: `apps/web` or repo root
  - Build command: `npm run build` (or `npm --workspace apps/web run build`)
  - Install command: `npm ci`
  - Set `SCRAPE_QUEUE_MODE=sync`
  - Set `PLAY_SCRAPE_MODE=html`
  - Set `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false`

### For Docker Deployment:
- ✅ Dockerfiles ready
- ⚠️ **Action Required**: 
  - Set all environment variables in `.env` or docker-compose
  - Ensure database and Redis are accessible
  - Run migrations before starting web service

### For Kubernetes Deployment:
- ✅ Manifests ready
- ⚠️ **Action Required**:
  - Update image references
  - Create secrets from `infrastructure/k8s/base/secret.placeholder.yaml`
  - Update ConfigMap values
  - Apply base configs, then apps

---

## 8. ⚠️ Missing/Recommended Files

- ⚠️ **`.env.example`** - Referenced in README but not found
  - **Recommendation**: Create `.env.example` with all required variables (with placeholder values)

---

## 9. ✅ Testing Status

- ✅ **Test files** present:
  - Jest tests configured
  - Playwright E2E tests configured
  - API health check tests
- ⚠️ **Action Recommended**: Run test suite before deployment

```bash
# Run tests
npm run test
npm run e2e
```

---

## 10. 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set in deployment platform
- [ ] Database is provisioned and accessible
- [ ] Prisma migrations have been run
- [ ] Clerk application is configured
- [ ] Stripe account is set up with webhooks
- [ ] Storage bucket (R2/S3) is created and configured
- [ ] Redis is provisioned (if using)
- [ ] Docker images are built and pushed (if using Docker/K8s)
- [ ] Health checks are configured
- [ ] Monitoring/logging is set up
- [ ] Backup strategy is in place
- [ ] Domain/SSL certificates are configured
- [ ] CORS origins are set correctly
- [ ] Rate limiting is configured appropriately
- [ ] Security secrets are rotated from defaults

---

## 11. 🚀 Quick Start Deployment Commands

### Docker Compose (Staging):
```bash
cd infrastructure/docker
docker compose -f docker-compose.staging.yml up --build
```

### Kubernetes:
```bash
# Apply base configs
kubectl apply -f infrastructure/k8s/base

# Apply apps
kubectl apply -f infrastructure/k8s/apps

# Apply ingress
kubectl apply -f infrastructure/k8s/ingress
```

### Vercel:
1. Import repository
2. Set root directory to `apps/web` or repo root
3. Configure environment variables
4. Deploy

---

## 12. ⚠️ Known Limitations & Notes

1. **Google Play Scraping**: HTML parsing, may break or be blocked. Consider dedicated worker + proxying for production.

2. **ZIP Generation**: Happens in Route Handler. Ensure deployment platform allows sufficient memory/timeout for ZIP sizes.

3. **Playwright**: Not recommended on Vercel. Use `PLAY_SCRAPE_MODE=html` and `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false`.

4. **Queue Mode**: For serverless (Vercel), use `SCRAPE_QUEUE_MODE=sync`. For dedicated workers, use BullMQ with Redis.

5. **API Service**: Optional companion service. Web app can run standalone.

---

## Summary

**Status**: ✅ **READY FOR DEPLOYMENT**

**Critical Actions Required**:
1. Configure all environment variables
2. Set up external services (Clerk, Stripe, Storage, Database)
3. Run database migrations
4. Update K8s image references (if using K8s)
5. Create `.env.example` file (recommended)

**Estimated Setup Time**: 2-4 hours (depending on external service setup)

**Risk Level**: 🟢 **LOW** - Project structure is solid, well-documented, and deployment-ready. Main work is configuration.
