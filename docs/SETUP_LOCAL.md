# Local Development Setup

This guide will help you set up GetAppShots for local development.

## Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** 16+ (or Docker)
- **Git**

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd AppShot.ai---SaaS-Screenshot-ASO-Tool

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment example
cp .env.example .env.local
# Or for web app specifically
cp apps/web/.env.example apps/web/.env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your local configuration. See [Environment Variables Guide](./SETUP_ENVIRONMENT_VARIABLES.md) for complete details.

**Minimum required for local development:**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/getappshots?schema=public

# Clerk (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Storage (Cloudflare R2 or AWS S3)
STORAGE_ENDPOINT_URL=https://...
STORAGE_BUCKET=your-bucket-name
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
```

### 4. Database Setup

#### Option A: Docker (Recommended)

```bash
docker run --name getappshots-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=getappshots \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Option B: Local PostgreSQL

Install PostgreSQL 16+ and create a database:

```bash
createdb getappshots
```

### 5. Run Migrations

```bash
npx prisma migrate dev --schema apps/web/prisma/schema.prisma
```

### 6. Start Development Server

```bash
# Start web app
npm run web:dev

# Or start all apps (if you have API running)
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Setting Up Services

### Clerk (Authentication)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your API keys:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
4. Add redirect URLs:
   - `http://localhost:3000`
   - `http://localhost:3000/sign-in`
   - `http://localhost:3000/sign-up`

### Stripe (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your test API keys:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Create products and prices:
   ```bash
   npm run stripe:sync
   ```
4. Copy the price IDs from output to your `.env.local`
5. Set up webhook (see [Stripe Setup Guide](./STRIPE_PRICING_SYNC.md))

### Storage (Cloudflare R2 or AWS S3)

See [Environment Variables Guide](./SETUP_ENVIRONMENT_VARIABLES.md) for detailed storage setup.

---

## Development Commands

```bash
# Start web app
npm run web:dev

# Start API (if using)
npm run api:dev

# Run linting
npm run lint

# Run type checking
npm run web:typecheck

# Run tests
npm run test

# Run E2E tests
npm run e2e

# Sync Stripe pricing
npm run stripe:sync

# Check Stripe setup
npm run stripe:check
```

---

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format is correct
- Ensure database exists: `psql -l | grep getappshots`

### Missing Environment Variables

- Check `.env.local` exists and has all required variables
- Verify variable names match exactly (case-sensitive)
- Restart dev server after adding new variables

### Stripe Issues

- Run `npm run stripe:check` to verify setup
- Ensure you're using test keys for development
- Check webhook endpoint is accessible

### Build Errors

- Clear `.next` folder: `rm -rf apps/web/.next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 20+)

---

## Next Steps

- [Configure Environment Variables](./SETUP_ENVIRONMENT_VARIABLES.md)
- [Set up Stripe Integration](./STRIPE_PRICING_SYNC.md)
- [Deploy to Vercel](./DEPLOY_VERCEL_INTEGRATIONS.md)

---

For more details, see:
- [Environment Variables Guide](./SETUP_ENVIRONMENT_VARIABLES.md)
- [Stripe Setup Guide](./STRIPE_PRICING_SYNC.md)
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)
