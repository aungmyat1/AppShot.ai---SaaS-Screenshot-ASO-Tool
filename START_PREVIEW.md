# 🚀 Start Preview - Quick Guide

**Last Updated**: January 18, 2026  
**Status**: ✅ Ready to run

---

## ✅ Pre-Check Complete

Your environment is configured and ready:
- ✅ Dependencies installed
- ✅ Prisma Client generated
- ✅ Database migrations applied
- ✅ Environment variables configured
  - Database: Neon PostgreSQL ✓
  - Auth: Clerk ✓
  - Storage: Cloudflare R2 ✓

---

## 🎯 Quick Start

### Option 1: Development Mode (Recommended for Preview)

```bash
# Start the web application
npm run web:dev
```

**Access**: http://localhost:3000

**Features available:**
- ✅ Sign up / Sign in (Clerk auth)
- ✅ Dashboard
- ✅ Screenshot scraping (App Store & Google Play)
- ✅ File storage (Cloudflare R2)
- ⚠️ Payments (requires Stripe configuration)

---

### Option 2: Full Build Preview

```bash
# Build the application
npm run web:build

# Start production server
npm run web:start
```

**Access**: http://localhost:3000

---

## 📋 What You Can Test

### 1. Authentication Flow
- Go to http://localhost:3000
- Click "Sign Up" or "Sign In"
- Create a test account
- Verify email redirect works

### 2. Dashboard
- After sign in, access dashboard at `/dashboard`
- View overview page
- Check navigation

### 3. Screenshot Scraping
- Go to dashboard screenshot page
- Enter an app URL:
  - iOS: `id284882215` (Facebook)
  - Android: `com.facebook.katana`
- Click "Generate Screenshots"
- Download ZIP file

### 4. File Storage
- Screenshots are uploaded to Cloudflare R2
- Check if download works
- Verify images load correctly

---

## 🔧 Development Commands

```bash
# Start development server
npm run web:dev

# Run linter
npm run web:lint

# Type check
npm run web:typecheck

# Run tests
npm run web:test

# Open Prisma Studio (database viewer)
npx prisma studio --schema apps/web/prisma/schema.prisma
```

---

## 🌐 Available URLs

| Service | URL | Status |
|---------|-----|--------|
| **Web App** | http://localhost:3000 | ✅ Ready |
| **API Docs** | http://localhost:3000/api | ✅ Ready |
| **Prisma Studio** | http://localhost:5555 | Run `npx prisma studio` |

---

## 🔍 Monitoring & Debugging

### Check Logs
```bash
# Watch development logs in terminal where npm run web:dev is running
```

### Common Issues

**Port 3000 already in use:**
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run web:dev
```

**Environment variables not loading:**
```bash
# Verify .env.local exists
cat .env.local

# Restart the development server
```

**Database connection error:**
```bash
# Test database connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate --schema apps/web/prisma/schema.prisma
```

---

## ⚠️ Known Limitations for Preview

### Missing Stripe Configuration
**Impact**: Payment features won't work
- Subscription creation will fail
- Billing pages may show errors

**To fix**: Add Stripe keys to `.env.local`
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

**Workaround**: Skip payment-related features during preview

---

## 🎨 Testing Scenarios

### Scenario 1: Basic User Flow
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create account with email
4. Verify email (check Clerk dashboard)
5. Access dashboard
6. Explore features

### Scenario 2: Screenshot Generation
1. Sign in to dashboard
2. Navigate to Screenshots page
3. Enter app ID:
   - iOS: `id284882215`
   - Android: `com.instagram.android`
4. Click "Generate"
5. Wait for processing
6. Download ZIP file
7. Verify screenshots

### Scenario 3: Admin Access
1. Sign in with admin email (configured in ADMIN_EMAILS)
2. Access `/admin` route
3. View admin dashboard
4. Check user management

---

## 📊 Preview Checklist

Before showing to others:

- [ ] Development server running (`npm run web:dev`)
- [ ] App loads at http://localhost:3000
- [ ] Sign up/sign in works
- [ ] Dashboard accessible
- [ ] Screenshot generation works
- [ ] File downloads work
- [ ] No console errors (check browser DevTools)
- [ ] Responsive design works (test mobile view)

---

## 🚀 For Production Demo

If you want to demo the production-ready version:

1. **Build the app:**
   ```bash
   npm run web:build
   ```

2. **Start production server:**
   ```bash
   npm run web:start
   ```

3. **Access**: http://localhost:3000

4. **Difference**: Production mode is optimized and faster

---

## 🔄 Stopping the Preview

**Development Mode:**
- Press `Ctrl+C` in the terminal where `npm run web:dev` is running

**Production Mode:**
- Press `Ctrl+C` in the terminal where `npm run web:start` is running

**Clean up:**
```bash
# Kill any processes on port 3000
npx kill-port 3000

# Clear Next.js cache (if needed)
rm -rf apps/web/.next
```

---

## 📝 Notes for Demo

### Highlights to Show:
1. **Modern UI** - Clean, responsive design
2. **Authentication** - Seamless Clerk integration
3. **Screenshot Scraping** - Both iOS and Android support
4. **Bulk Download** - ZIP file generation
5. **Performance** - Fast loading with Next.js 15
6. **Type Safety** - Full TypeScript implementation

### Features Ready:
- ✅ User authentication & management
- ✅ App screenshot scraping (App Store & Google Play)
- ✅ Bulk screenshot download (ZIP)
- ✅ Cloud storage integration (R2)
- ✅ Responsive design
- ✅ Admin dashboard
- ⚠️ Payments (needs Stripe keys)

---

## 🆘 Quick Help

**App won't start:**
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma Client
npx prisma generate --schema apps/web/prisma/schema.prisma

# Try again
npm run web:dev
```

**Need to reset database:**
```bash
# Run migrations again
npx prisma migrate reset --schema apps/web/prisma/schema.prisma
```

**Want to see database:**
```bash
# Open Prisma Studio
npx prisma studio --schema apps/web/prisma/schema.prisma
```

---

## 📞 Support

- **Documentation**: See [README.md](./README.md)
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Reference**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Ready to start!** Run: `npm run web:dev` 🚀
