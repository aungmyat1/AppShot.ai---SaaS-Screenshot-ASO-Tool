# 🚀 QUICK START: Deployment in 5 Steps

## Step 1: Verify Code Status (5 minutes)
```bash
# Check for merge conflicts
git status
# Should show all files clean (✅ FIXED already)

# Install dependencies
npm install

# Verify code quality
npm run lint
npm run build
```

## Step 2: Set Up External Services (1-2 hours)

### 🔵 PostgreSQL Database
**Choose one option:**

**A) Local Docker** (fastest for development)
```bash
docker run --name getappshots-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine

# Get connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/getappshots"
```

**B) Cloud Provider** (recommended for production)
- AWS RDS
- Google Cloud SQL
- Neon (serverless)
- Vercel Postgres (one-click in dashboard)

### 🔵 Clerk Authentication
1. Go to https://dashboard.clerk.com
2. Create new application
3. Copy keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. Add redirect URLs (under Settings > Redirect URLs)

### 🔵 Stripe Payments
1. Go to https://dashboard.stripe.com
2. Copy API keys (Developers > API Keys)
3. Create products/prices and copy IDs
4. Set up webhook at `/api/stripe/webhook`
5. Copy webhook secret

### 🔵 Cloudflare R2 Storage
1. Go to https://dash.cloudflare.com
2. Navigate to R2
3. Create bucket
4. Create API token
5. Copy:
   ```
   R2_ACCOUNT_ID=xxxxx
   R2_BUCKET_NAME=xxxxx
   R2_ACCESS_KEY_ID=xxxxx
   R2_SECRET_ACCESS_KEY=xxxxx
   ```

**OR** Use AWS S3 if preferred

## Step 3: Configure Environment Variables (15 minutes)

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials (use your editor)
# nano .env.local
# or code .env.local

# Verify all required variables are set
npm run env:check
```

**Required variables to set:**
- `DATABASE_URL` - from PostgreSQL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - from Clerk
- `CLERK_SECRET_KEY` - from Clerk
- `STRIPE_SECRET_KEY` - from Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - from Stripe
- `STRIPE_WEBHOOK_SECRET` - from Stripe
- `STRIPE_PRICE_PRO` - from Stripe
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` - from Stripe
- `R2_ACCOUNT_ID` - from Cloudflare
- `R2_BUCKET_NAME` - from Cloudflare
- `R2_ACCESS_KEY_ID` - from Cloudflare
- `R2_SECRET_ACCESS_KEY` - from Cloudflare

## Step 4: Run Database Migrations (5 minutes)

```bash
# Apply migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# Create sample data (optional)
npx prisma db seed --schema apps/web/prisma/schema.prisma
```

## Step 5: Start Development (Test Locally)

```bash
# Terminal 1: Web app
npm run web:dev
# Opens at http://localhost:3000

# Terminal 2: API (optional, in apps/api)
cd apps/api && uvicorn app.main:app --reload

# Test the app
# 1. Sign in with Clerk
# 2. Go to dashboard
# 3. Try screenshot scraping
# 4. Test file upload to R2
```

---

## 🚀 Deploy to Vercel (30 minutes)

### Option A: Recommended (Hybrid Approach - Auto 90% secrets)

1. **Connect GitHub**
   - Push your code to GitHub
   - Go to https://vercel.com/new
   - Select your repository

2. **Add Vercel Integrations** (5 min each)
   - **Clerk**: Project Settings → Integrations → Add Clerk
   - **Stripe**: Project Settings → Integrations → Add Stripe
   - **Postgres**: Storage → Create Database → Postgres
   - **KV** (optional): Storage → Create Database → KV

3. **Set up Doppler for Storage** (10 min)
   - Create account at https://doppler.com
   - Create project (or sync existing)
   - Add R2/S3 credentials to Doppler
   - Add Doppler integration to Vercel

4. **Manual Environment Variables** (5 min)
   ```
   In Vercel Dashboard → Settings → Environment Variables:
   - NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   - NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   - ADMIN_EMAILS=your@email.com
   - STRIPE_WEBHOOK_SECRET=whsec_...
   - STRIPE_PRICE_PRO=price_...
   - NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
   ```

5. **Deploy**
   - Vercel auto-deploys on push to main
   - Or click "Deploy" in dashboard

### Option B: Manual Setup
1. Add all environment variables in Vercel Dashboard
2. Deploy

---

## ✅ Verification Checklist

### Local Development
- [ ] `npm install` completes without errors
- [ ] `npm run env:check` passes
- [ ] `npm run web:dev` starts on localhost:3000
- [ ] Can sign in with Clerk
- [ ] Can access dashboard
- [ ] Can test scraping feature
- [ ] Can upload files to R2

### Vercel Deployment
- [ ] GitHub integration connected
- [ ] Build succeeds (check logs)
- [ ] Environment variables loaded correctly
- [ ] App loads at vercel.app domain
- [ ] Sign in works
- [ ] Payments work (test mode)
- [ ] File uploads work

---

## 🆘 Troubleshooting

### "Database connection failed"
```bash
# Check connection string format
echo $DATABASE_URL
# Should look like: postgresql://user:pass@host:5432/dbname?sslmode=require

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### "Missing environment variable"
```bash
# Verify all required vars
npm run env:check

# Check what's loaded
env | grep -E "(DATABASE|CLERK|STRIPE|R2|STORAGE)"
```

### "Clerk/Stripe keys not working"
- Verify you copied the full key (no truncation)
- Check you're using test keys for development
- Verify redirect URLs are set in Clerk
- Verify webhook is configured in Stripe

### "R2 upload fails"
- Check bucket exists and is accessible
- Verify access keys have S3 permissions
- Test with AWS CLI: `aws s3 ls s3://bucket-name --profile=your-profile`

---

## 📚 Full Documentation

For detailed setup instructions, see:
- [ACTION_PLAN.md](ACTION_PLAN.md) - Step-by-step plan
- [DEPLOYMENT_READINESS_REPORT.md](DEPLOYMENT_READINESS_REPORT.md) - Detailed analysis
- [docs/SETUP_ENVIRONMENT_VARIABLES.md](docs/SETUP_ENVIRONMENT_VARIABLES.md) - All env vars explained
- [docs/QUICK_SETUP_SECRETS.md](docs/QUICK_SETUP_SECRETS.md) - Secrets management

---

## ⏱️ Timeline Summary

| Step | Time | Total |
|------|------|-------|
| Code verification | 5 min | 5 min |
| External services | 1-2 hrs | 1h 5-2h 5min |
| Env configuration | 15 min | 1h 20-2h 20min |
| DB migrations | 5 min | 1h 25-2h 25min |
| Local testing | 15 min | 1h 40-2h 40min |
| Vercel deploy | 30 min | 2h 10-3h 10min |

**Total**: ~2.5 hours from start to production

---

**Status**: ✅ Ready to Begin  
**Last Updated**: 2026-01-18
