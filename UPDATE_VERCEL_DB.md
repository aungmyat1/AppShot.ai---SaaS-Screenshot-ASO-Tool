# 🔄 Update to Vercel Postgres Database

**Quick guide to connect your Vercel Postgres database**

---

## 🚀 Option 1: Automated Update (Recommended)

### Step 1: Get Vercel Postgres URL

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. If you don't have a database:
   - Click **Create Database** → **Postgres**
   - Choose a region (closest to your users)
   - Click **Create**
5. Click on your database name
6. Go to **.env.local** tab
7. Copy the `POSTGRES_URL` value (starts with `postgres://...`)

### Step 2: Run Update Script

```bash
node scripts/update-vercel-database.js
```

Follow the prompts and paste your Vercel Postgres URL.

### Step 3: Test & Deploy

```bash
# Test connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# Start preview
npm run web:dev
```

---

## 🔧 Option 2: Manual Update

### Step 1: Get Your Database URL from Vercel

Same as Option 1, Step 1 above.

### Step 2: Update .env.local Files

Edit both files:
- `.env.local` (root)
- `apps/web/.env.local`

Replace the `DATABASE_URL` line:

```bash
# Replace this line:
DATABASE_URL=postgresql://neondb_owner:...@ep-autumn-water-ahqzzyew-pooler...

# With your Vercel Postgres URL:
DATABASE_URL=postgres://default:abc123...@ep-polished-mountain-xyz.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

**Important**: Remove the `DATABASE_URL_ASYNC` line if it exists (not needed for Vercel Postgres).

### Step 3: Test & Deploy

```bash
# Copy to web app if you only updated root
Copy-Item -Path ".env.local" -Destination "apps\web\.env.local" -Force

# Test connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# Start preview
npm run web:dev
```

---

## 🌐 Option 3: Use Vercel CLI

### Step 1: Login to Vercel

```bash
vercel login
```

Follow the authentication prompts.

### Step 2: Link Project

```bash
vercel link
```

Select your project when prompted.

### Step 3: Pull Environment Variables

```bash
vercel env pull .env.vercel.local
```

This downloads all environment variables from Vercel.

### Step 4: Copy Vercel Database URL

```bash
# Open the file and find POSTGRES_URL or DATABASE_URL
notepad .env.vercel.local

# Copy the DATABASE_URL value and update your .env.local files
```

### Step 5: Test & Deploy

```bash
# Test connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# Start preview
npm run web:dev
```

---

## ✅ Verify Connection

After updating, verify the connection works:

```bash
# This should succeed without errors
npx prisma db pull --schema apps/web/prisma/schema.prisma
```

**Expected output:**
```
✔ Introspected 8 models and wrote them into prisma/schema.prisma
```

If you see this, your database is connected! 🎉

---

## 🗄️ Run Migrations

Once connected, run migrations to set up your database:

```bash
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

**Expected output:**
```
✔ Applied 1 migration(s)
```

---

## 🚀 Start Preview

Everything is ready! Start the preview:

```bash
npm run web:dev
```

Open http://localhost:3000

**Now you can test:**
- ✅ Sign up / Sign in
- ✅ Dashboard
- ✅ Screenshot generation
- ✅ User management
- ✅ All database features

---

## 🔍 Troubleshooting

### "Can't reach database server"

**Solution**: Check your DATABASE_URL format
- Should start with `postgres://` or `postgresql://`
- Should include `:5432` port
- Should include `/verceldb` or database name at the end

### "Invalid connection string"

**Solution**: Make sure you copied the entire URL
- No line breaks in the middle
- No extra spaces
- Include the full URL including password

### "Authentication failed"

**Solution**: Get a fresh URL from Vercel dashboard
- Go to Storage → Your Database → .env.local tab
- Copy the latest `POSTGRES_URL` value
- Update your .env.local files

### Still having issues?

Run the automated script:
```bash
node scripts/update-vercel-database.js
```

---

## 📊 What's Different with Vercel Postgres?

### Advantages over Neon:
- ✅ **Always-on**: Doesn't pause (no connection issues)
- ✅ **Integrated**: Built into Vercel dashboard
- ✅ **Automatic**: Environment variables sync automatically
- ✅ **Fast**: Low latency with edge network
- ✅ **Reliable**: Enterprise-grade reliability

### URL Format Differences:

**Neon format:**
```
postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

**Vercel Postgres format:**
```
postgres://default:pass@ep-xxx.postgres.vercel-storage.com:5432/verceldb
```

Both work with Prisma! Just make sure to update your .env.local files.

---

## 🎯 Quick Command Reference

```bash
# Update database connection
node scripts/update-vercel-database.js

# Test connection
npx prisma db pull --schema apps/web/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema apps/web/prisma/schema.prisma

# Start preview
npm run web:dev

# View database
npx prisma studio --schema apps/web/prisma/schema.prisma
```

---

## 📞 Need Help?

**Automated setup:**
```bash
node scripts/update-vercel-database.js
```

**Documentation:**
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Ready to update!** Choose an option above and follow the steps. 🚀
