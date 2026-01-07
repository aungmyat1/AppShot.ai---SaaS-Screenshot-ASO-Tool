## GetAppShots

GetAppShots is a **Next.js 14 (App Router)** SaaS that:

- Validates iOS App Store + Google Play URLs
- Scrapes screenshot image URLs (iOS via iTunes Lookup API; Play via HTML parsing)
- Downloads images server-side, builds a ZIP, uploads it to S3/R2, and returns a downloadable URL
- Tracks credits/usage per user
- Uses **Clerk** for auth and **Stripe** for subscriptions
- Stores users + scrape history in **Postgres** via **Prisma**

### Local setup

- **Install**

```bash
npm install
```

- **Configure env**

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (and optionally `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`)
- **Postgres**: `DATABASE_URL` (**must be the URL only**, not a `psql ...` command)
- **Storage** (S3 or R2): either `STORAGE_*` or `R2_*` vars (see `.env.example`)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, plus `NEXT_PUBLIC_STRIPE_PRICE_*`

- **Create DB tables**

```bash
npx prisma migrate dev
```

- **Run dev**

```bash
npm run dev
```

### Stripe webhooks

Configure a Stripe webhook endpoint pointing to:
- `/api/stripe/webhook`

Listen for:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Notes / limitations

- **Google Play scraping is best-effort**: it’s HTML parsing and can break or be blocked. In production you may want a dedicated scraping worker + proxying.
- **ZIP generation happens in a Route Handler** (`/api/scrape`) and uploads the ZIP to S3/R2. Make sure your deployment limits allow the ZIP sizes you expect.

