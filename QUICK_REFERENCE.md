# ⚡ Quick Reference Card

## 🚀 Essential Commands

```bash
# Check deployment readiness
npm run check:deployment

# Interactive setup wizard (RECOMMENDED)
npm run setup:services

# Database setup only
npm run setup:database

# Deploy to Vercel (full wizard)
npm run deploy:vercel

# Verify environment variables
npm run env:check

# Start development server
npm run web:dev

# Build for production
npm run web:build

# Run database migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# View database (Prisma Studio)
npx prisma studio --schema apps/web/prisma/schema.prisma
```

---

## 🔑 Required Environment Variables

### Clerk (Authentication)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ADMIN_EMAILS=your@email.com
```

### Stripe (Payments)
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

### Database
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
```

### Storage (R2)
```bash
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
STORAGE_ENDPOINT_URL=https://account.r2.cloudflarestorage.com
STORAGE_BUCKET=...
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
```

### Redis (Optional)
```bash
REDIS_URL=redis://localhost:6379
```

---

## 🎯 Quick Setup Paths

### Path 1: Automated (Recommended)
```bash
npm run setup:services    # Interactive wizard
npm run deploy:vercel     # Deploy with wizard
```
**Time**: 1-2 hours (first time)

### Path 2: Hybrid (Fastest)
1. Install Vercel integrations (Clerk, Stripe, Postgres)
2. Use Doppler for storage credentials
3. Add 5 manual variables
4. Deploy: `vercel --prod`

**Time**: 40 minutes

### Path 3: Manual
1. Create accounts manually
2. Copy all credentials to `.env.local`
3. Run migrations
4. Deploy: `vercel --prod`

**Time**: 2-3 hours

---

## 🔗 Important Links

| Service | Dashboard | Purpose |
|---------|-----------|---------|
| Clerk | https://dashboard.clerk.com | Authentication |
| Stripe | https://dashboard.stripe.com | Payments |
| Vercel | https://vercel.com/dashboard | Deployment |
| Cloudflare | https://dash.cloudflare.com | Storage (R2) |

---

## 🧪 Test Cards (Stripe)

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Declined |

**Expiry**: Any future date  
**CVC**: Any 3 digits

---

## 🐳 Docker Quick Commands

### PostgreSQL
```bash
# Start
docker run --name getappshots-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Stop
docker stop getappshots-db

# Start existing
docker start getappshots-db

# Remove
docker rm getappshots-db
```

### Redis
```bash
# Start
docker run --name getappshots-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Stop
docker stop getappshots-redis
```

---

## 🔍 Debugging Commands

```bash
# Check git status
git status

# View environment variables (if using Doppler)
npm run env:list

# Test database connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# View Prisma migrations
npx prisma migrate status --schema apps/web/prisma/schema.prisma

# Check Vercel deployment logs
vercel logs

# Lint code
npm run web:lint

# Type check
npm run web:typecheck

# Run tests
npm run web:test
```

---

## 🆘 Common Issues

### "Build failed: Missing env variable"
→ Add variable in Vercel dashboard or `.env.local`

### "Can't connect to database"
→ Check `DATABASE_URL` format and connection

### "Prisma Client not generated"
→ Run: `npx prisma generate --schema apps/web/prisma/schema.prisma`

### "Clerk redirect not allowed"
→ Add deployment URL to Clerk allowed origins

### "Stripe webhook failed"
→ Verify webhook URL and secret are correct

### "Storage access denied"
→ Check R2/S3 credentials and bucket permissions

---

## 📂 Project Structure

```
AppShot.ai/
├── apps/
│   ├── web/           ← Main Next.js app (deploy to Vercel)
│   ├── api/           ← FastAPI (optional, deploy separately)
│   └── admin/         ← Admin dashboard
├── scripts/
│   ├── setup-external-services.js  ← Interactive setup
│   ├── setup-database.js           ← Database setup
│   ├── deploy-to-vercel.js         ← Deployment wizard
│   └── check-deployment-readiness.js
├── docs/              ← All documentation
├── infrastructure/    ← Docker, K8s, Terraform
├── .env.local         ← Your local env file (git-ignored)
└── .env.example       ← Template file
```

---

## 🎯 Deployment Status

Run this anytime to check readiness:
```bash
npm run check:deployment
```

**Target Score**: 100%  
**Current Status**: ✅ Ready

---

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_GUIDE.md` | Complete step-by-step guide |
| `DEPLOYMENT_PREPARATION_SUMMARY.md` | Overview & checklist |
| `QUICK_START.md` | Fast 5-step guide |
| `QUICK_REFERENCE.md` | This file - quick commands |
| `docs/DEPLOY_VERCEL_INTEGRATIONS.md` | Vercel integration details |
| `docs/SETUP_ENVIRONMENT_VARIABLES.md` | All env vars explained |

---

## 💡 Pro Tips

1. **Use integrations**: Let Vercel, Clerk, Stripe auto-sync secrets
2. **Test locally first**: Always run `npm run web:dev` before deploying
3. **Use preview deployments**: Test on Vercel preview before production
4. **Run migrations in CI**: Automate with GitHub Actions
5. **Monitor logs**: Check Vercel logs after deployment
6. **Use Doppler**: For storage secrets and team collaboration

---

**Need help?** Run: `npm run setup:services` for interactive guidance
