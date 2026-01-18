# 🎬 Preview Setup Guide

**Status**: Database connection issue detected  
**Solution**: Choose setup option below

---

## ⚠️ Current Issue

The database connection failed. This could be because:
- Neon database is paused (free tier auto-pauses after inactivity)
- Connection string needs updating
- Database needs to be created

---

## 🚀 Quick Setup Options

### Option 1: Use Vercel Postgres (Recommended - Easiest)

**Time**: 5 minutes

1. **Create Vercel Postgres Database**:
   ```bash
   # Install Vercel CLI if not installed
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link project
   vercel link
   ```

2. **In Vercel Dashboard**:
   - Go to your project → Storage tab
   - Click "Create Database" → "Postgres"
   - Choose a region
   - Copy the `DATABASE_URL` from .env.local tab

3. **Update `.env.local`**:
   Replace the DATABASE_URL line with the new one from Vercel

4. **Run migrations**:
   ```bash
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

---

### Option 2: Activate Neon Database

**Time**: 2 minutes

1. Go to https://neon.tech
2. Sign in to your account
3. Find your project
4. Click on the database to activate it
5. Wait 30 seconds for it to wake up
6. Try running migrations again:
   ```bash
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

---

### Option 3: Create New Neon Database

**Time**: 5 minutes

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

---

### Option 4: Run Setup Wizard (Automated)

**Time**: 10 minutes

```bash
# Run the database setup wizard
npm run setup:database
```

Follow the prompts to:
- Choose database provider
- Configure connection
- Run migrations automatically

---

## 🎯 Once Database is Connected

### 1. Run Migrations

```bash
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### 2. Start Development Server

```bash
npm run web:dev
```

### 3. Access the App

Open http://localhost:3000

---

## 🧪 Testing Without Database (Limited Mode)

If you want to test the UI without database:

1. **Comment out database checks** in the code (temporary)
2. **Start development**:
   ```bash
   npm run web:dev
   ```
3. **Test only**:
   - Landing page
   - Static pages
   - UI components

**Note**: Features requiring database won't work:
- Sign up/Sign in
- Dashboard
- Screenshot generation
- User data

---

## ✅ Full Preview Setup Steps

### Step 1: Verify Environment

```bash
# Check deployment readiness
npm run check:deployment
```

### Step 2: Fix Database Connection

Choose one of the options above to set up the database.

### Step 3: Generate Prisma Client

```bash
npx prisma generate --schema apps/web/prisma/schema.prisma
```

### Step 4: Run Migrations

```bash
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

### Step 5: Start Preview

```bash
npm run web:dev
```

### Step 6: Test

Go to http://localhost:3000 and test:
- Sign up/Sign in
- Dashboard
- Screenshot scraping
- File downloads

---

## 📊 Preview Checklist

- [ ] Database connection working
- [ ] Prisma Client generated
- [ ] Migrations applied
- [ ] Development server starts
- [ ] App loads at localhost:3000
- [ ] Authentication works
- [ ] Dashboard accessible
- [ ] Screenshot generation works

---

## 🔧 Common Issues & Solutions

### "Can't reach database server"

**Solution**: Database is paused or connection string is wrong
```bash
# Option A: Wake up Neon database (visit dashboard)
# Option B: Use new database (run setup wizard)
npm run setup:database
```

### "Prisma Client not generated"

**Solution**: Generate it manually
```bash
npx prisma generate --schema apps/web/prisma/schema.prisma
```

### "Port 3000 already in use"

**Solution**: Kill the process
```bash
npx kill-port 3000
# Or use different port
PORT=3001 npm run web:dev
```

### "Module not found"

**Solution**: Reinstall dependencies
```bash
npm install
```

---

## 🚀 Recommended: Quick Database Setup

**Fastest way to get running:**

```bash
# 1. Run automated database setup
npm run setup:database

# 2. Choose option 1 (Vercel Postgres) or 2 (Neon)

# 3. Follow the prompts

# 4. Start preview
npm run web:dev
```

**Total time**: ~5-10 minutes

---

## 📝 What Works in Preview

### ✅ Available Features (with database)
- User authentication (Clerk)
- Dashboard interface
- App screenshot scraping
  - iOS App Store
  - Google Play Store
- Bulk screenshot download (ZIP)
- File storage (Cloudflare R2)
- Responsive design
- Admin dashboard

### ⚠️ Limited Features (needs Stripe)
- Subscription plans
- Payment processing
- Billing dashboard

**Note**: You can still demo the UI for payment features, they just won't process actual payments.

---

## 🎬 Ready to Start?

### Quick Start Commands

```bash
# If database is ready:
npm run web:dev

# If database needs setup:
npm run setup:database
# Then: npm run web:dev

# To check status:
npm run check:deployment
```

---

## 📞 Need Help?

### Interactive Setup
```bash
npm run setup:database    # Database setup wizard
npm run setup:services    # Full services setup
```

### Documentation
- [START_PREVIEW.md](./START_PREVIEW.md) - Detailed preview guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command reference
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide

---

**Next Step**: Choose a database setup option above and get started! 🚀
