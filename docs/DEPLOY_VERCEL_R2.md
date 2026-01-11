## Deploy to Vercel + Cloudflare R2

### 1) Vercel project setup

- Import this repo into Vercel.
- **Root directory**:
  - Recommended: set it to `apps/web` (Next.js app).
- **Build command**: `npm run build`
- **Install command**:
  - If your project root is `apps/web`: use `cd .. && cd .. && npm ci && npm --workspace apps/web run build` (or set root to repo root instead).
  - Easiest: set the Vercel project root to the **repo root** and set:
    - Install: `npm ci`
    - Build: `npm --workspace apps/web run build`

### 2) Required environment variables (Vercel → Project → Settings → Environment Variables)

#### Database (Postgres)
- `DATABASE_URL`

#### Clerk
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (recommended: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (recommended: `/sign-up`)
- `ADMIN_EMAILS` (comma-separated, for admin area access)

#### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` (and/or `NEXT_PUBLIC_STRIPE_PRICE_STARTER`)
- `STRIPE_PRICE_PRO`

#### Cloudflare R2 (S3-compatible)
Set these (no `$VAR` interpolation on Vercel):
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

And set the storage aliases used by the app:
- `STORAGE_ENDPOINT` (or `STORAGE_ENDPOINT_URL`)
  - `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
- `STORAGE_BUCKET`
- `STORAGE_REGION=auto`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- Optional: `STORAGE_PUBLIC_URL` (or `STORAGE_PUBLIC_BASE_URL`)
  - Use an `r2.dev` public bucket URL or a custom domain if configured.

#### Recommended flags for Vercel
- `SCRAPE_QUEUE_MODE=sync` (Vercel won’t run the BullMQ worker process)
- `PLAY_SCRAPE_MODE=html` and `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false` (Playwright is not recommended on Vercel functions)

### 3) Stripe webhook

Create a Stripe webhook endpoint pointing to:
- `/api/stripe/webhook`

Add events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.*` (paid/failed/finalized)

### 4) Migrations

Run Prisma migrations against your production DB **outside** Vercel (CI/CD is best):

```bash
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### 5) Notes about limits

- Screenshot scraping + ZIP creation can be heavy. If you hit Vercel timeouts, move scraping to:
  - `apps/api` + Celery workers, or
  - a dedicated worker host (Railway/Fly/AWS), while keeping the UI on Vercel.

