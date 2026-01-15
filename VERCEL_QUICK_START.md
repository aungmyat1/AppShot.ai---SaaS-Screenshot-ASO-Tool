# Vercel Deployment - Quick Start

> **For detailed instructions, see [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

## 🚀 5-Minute Quick Start

### 1. Prerequisites Setup (30-60 min)

Set up these services first:

- **PostgreSQL**: [Vercel Postgres](https://vercel.com/storage/postgres) or [Neon](https://neon.tech)
- **Clerk**: [dashboard.clerk.com](https://dashboard.clerk.com) - Get API keys
- **Stripe**: [dashboard.stripe.com](https://dashboard.stripe.com) - Get API keys + webhook
- **Cloudflare R2**: [dash.cloudflare.com](https://dash.cloudflare.com) - Create bucket + API token

### 2. Deploy to Vercel (5 min)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel auto-detects settings from `vercel.json`
5. Click **"Deploy"** (you'll add env vars next)

### 3. Add Environment Variables (10 min)

In Vercel Dashboard → Your Project → **Settings → Environment Variables**, add:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...  # Get from: npm run stripe:sync
STRIPE_PRICE_PRO=price_...              # Get from: npm run stripe:sync

# Storage (R2)
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
STORAGE_ENDPOINT_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
STORAGE_BUCKET=...
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...

# Vercel-Specific (IMPORTANT!)
SCRAPE_QUEUE_MODE=sync
PLAY_SCRAPE_MODE=html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false
```

### 4. Run Database Migrations (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### 5. Redeploy (1 min)

After adding environment variables:
- Go to Vercel Dashboard → Your Project → **Deployments**
- Click **"Redeploy"** on the latest deployment

### 6. Verify (2 min)

- Visit: `https://your-project.vercel.app/api/health` → Should return `{"status":"ok"}`
- Visit: `https://your-project.vercel.app/sign-in` → Test authentication
- Test scraping functionality

---

## ✅ Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] Database migrations run
- [ ] Clerk redirect URLs configured
- [ ] Stripe webhook endpoint set up
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Authentication works
- [ ] Scraping works

---

## 🆘 Troubleshooting

**Build fails?**
- Check `vercel.json` exists and is correct
- Verify root directory is `apps/web`

**Database errors?**
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy --schema apps/web/prisma/schema.prisma`

**Function timeout?**
- Ensure `SCRAPE_QUEUE_MODE=sync` is set
- Consider upgrading Vercel plan for longer timeouts

**Need help?**
- See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions

---

## 📚 Next Steps

1. Configure custom domain (optional)
2. Set up monitoring/analytics
3. Configure production Stripe/Clerk keys
4. Set up error tracking (Sentry, etc.)
