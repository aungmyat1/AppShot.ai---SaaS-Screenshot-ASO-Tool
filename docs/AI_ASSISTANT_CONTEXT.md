## Essential context for AI assistance (GetAppShots)

This repository is **GetAppShots**, a production-oriented **Next.js 14 (App Router)** SaaS that scrapes app store screenshots and provides downloadable ZIPs.

### 1) Project architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind + shadcn-style components (`apps/web/components/ui/*`)
- **Auth**: Clerk (`apps/web/middleware.ts`, `apps/web/app/sign-in`, `apps/web/app/sign-up`)
- **DB**: PostgreSQL + Prisma (`apps/web/prisma/schema.prisma`, `apps/web/lib/prisma.ts`)
- **Payments**: Stripe (`apps/web/app/api/stripe/*`)
- **Storage**: S3-compatible (AWS S3 or Cloudflare R2) (`apps/web/lib/storage.ts`)
- **Scraping engine**:
  - iOS App Store: iTunes lookup API (`apps/web/lib/scrape/app-store.ts`)
  - Google Play: HTML scrape + JSON-LD fallback (`apps/web/lib/scrape/play-store.ts`, `apps/web/lib/scrape/play-store-utils.ts`)
  - Optional Playwright mode with safe lifecycle (`apps/web/lib/scrape/play-store-playwright.ts`)
- **Queue (optional)**: BullMQ + Redis (`apps/web/lib/queue.ts`, `apps/web/server/worker.ts`, `/api/jobs/:jobId`)

### 2) Where the “core” logic lives

- **Request validation + store detection**: `apps/web/lib/app-url.ts`
- **Core engine (rate limit + cache + scrape)**: `apps/web/lib/core/engine.ts`
- **Redis cache (safe fallback)**: `apps/web/lib/core/cache.ts`
- **Rate limiting / backoff**: `apps/web/lib/core/rateLimiter.ts`
- **ZIP creation + efficient downloads**: `apps/web/lib/zip.ts`
- **Storage upload + signed/public URLs**: `apps/web/lib/storage.ts`
- **Plan limits enforcement (Free/Starter)**: `apps/web/lib/limits.ts`
- **Job processing (sync + worker)**: `apps/web/lib/core/process-scrape-job.ts`

### 3) Key endpoints & flows

- **Validate URL**: `POST /api/validate-url` → `{ store, identifier }`
- **Scrape + ZIP**: `POST /api/scrape`
  - **Sync mode** (`SCRAPE_QUEUE_MODE=sync`): returns `zipUrl` when done
  - **Queue mode** (`SCRAPE_QUEUE_MODE=queue` + `REDIS_URL`): returns `{ jobId, status: "QUEUED" }`
- **Poll job**: `GET /api/jobs/:jobId` → `{ status, zipUrl? }`
- **Stripe**:
  - `POST /api/stripe/checkout`
  - `POST /api/stripe/portal`
  - `POST /api/stripe/webhook` (public)

### 4) Debugging checklist (rendering / blank UI / API failures)

- **Build + typecheck**:

```bash
npm run build
```

- **Run locally (dev)**:

```bash
npm run dev
```

- **Run locally (production preview)**:

```bash
npm run build
npm run start
```

- **If UI is blank**:
  - Check browser console for runtime errors
  - Verify `.env.local` is present and keys are set (Clerk keys are required for auth flows)
  - Confirm middleware isn’t redirecting unexpectedly

- **If scraping fails**:
  - Try an iOS URL first (more reliable)
  - For Google Play, enable Playwright fallback:
    - `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=true` or `PLAY_SCRAPE_MODE=playwright`

### 5) Queue testing (production-style)

Requires `REDIS_URL` and `SCRAPE_QUEUE_MODE=queue`.

If you don’t have Redis locally, run it quickly:

```bash
docker run --rm -p 6379:6379 redis:7-alpine
```

Run app + worker in two terminals:

```bash
npm run dev
```

```bash
npm run worker
```

### 6) Deployment guidance (Vercel)

- Deploy as a standard Next.js app
- Configure environment variables in Vercel project settings (never commit secrets)
- Ensure Stripe webhook is configured to `POST /api/stripe/webhook`
- If using queue mode, you need a worker runtime (Vercel doesn’t run long-lived workers by default). Consider:
  - a separate worker deployment (Railway/Fly/Render)
  - or keep `SCRAPE_QUEUE_MODE=sync` and enforce smaller workloads

### 7) End-to-end “real data” test plan

1. Sign up / sign in (`/sign-in`, `/sign-up`)
2. Go to `/dashboard`
3. Paste a real store URL (iOS + Play)
4. Confirm ZIP link is returned and downloads successfully
5. Confirm job appears in history
6. Confirm Free/Starter limits are enforced

