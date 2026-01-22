# Verify Clerk Environment Variables in Vercel

This guide helps you verify that Clerk environment variables are correctly configured in Vercel.

## ✅ Required Variables

You **MUST** have these exact variable names in Vercel:

1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. `CLERK_SECRET_KEY`

## 🔍 Verification Steps

### Step 1: Check Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables exist:

#### Required Variables:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 
  - Should start with `pk_test_` or `pk_live_`
  - **Must be set for**: Production + Preview
  
- ✅ `CLERK_SECRET_KEY`
  - Should start with `sk_test_` or `sk_live_`
  - **Must be set for**: Production + Preview

#### Optional Variables (recommended):
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`

### Step 2: Verify Format

**❌ Common Mistakes to Avoid:**

1. **Extra Spaces**
   ```
   ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
   ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Quotes Around Values**
   ```
   ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Wrong Environment**
   - Make sure variables are set for **Production** AND **Preview**
   - Development is optional (for local dev)

4. **Truncated Keys**
   - Copy the FULL key from Clerk dashboard
   - Keys are long (50+ characters)

### Step 3: Run Local Verification

```bash
# Run the verification script
node scripts/verify-clerk-env.js

# Or with environment variables loaded
doppler run -- node scripts/verify-clerk-env.js
```

### Step 4: Clear Turbo Cache & Rebuild

Turbo sometimes caches old environment variable state. Clear the cache:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force .turbo
npm run build

# Mac/Linux
rm -rf .turbo
npm run build
```

### Step 5: Redeploy on Vercel

After fixing environment variables, you need to redeploy:

#### Option A: Via Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Click **Deployments** tab
3. Click **"..."** (three dots) on the latest deployment
4. Select **"Redeploy"**
5. Or go to **Settings** → **General** → **Clear Build Cache** → **Redeploy**

#### Option B: Via Vercel CLI
```bash
# Redeploy production
vercel --prod

# Or trigger redeploy via API
vercel redeploy --yes
```

#### Option C: Push to Git
```bash
# Make a small change and push
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

## 🔧 Troubleshooting

### Issue: Variables not found during build

**Solution:**
1. Verify variables are set for the correct environment (Production/Preview)
2. Clear Vercel build cache
3. Redeploy

### Issue: "Resource not found" Clerk error

This is already handled in the code (`apps/web/lib/auth.ts`), but if you see it frequently:

1. Verify `CLERK_SECRET_KEY` is correct
2. Check Clerk dashboard → API Keys
3. Ensure you're using the right keys (test vs live)

### Issue: Turbo warning about missing env vars

If you see:
```
Warning - the following environment variables are set on your Vercel project, but missing from "turbo.json"
```

**Solution:**
- Variables are already in `turbo.json` ✅
- Clear Turbo cache: `rm -rf .turbo`
- Redeploy on Vercel

## 📋 Quick Checklist

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` exists in Vercel
- [ ] `CLERK_SECRET_KEY` exists in Vercel
- [ ] Both variables set for **Production + Preview**
- [ ] No extra spaces in variable names or values
- [ ] No quotes around values
- [ ] Keys start with correct prefix (`pk_` / `sk_`)
- [ ] Cleared `.turbo` cache locally
- [ ] Ran `npm run build` successfully
- [ ] Triggered redeploy on Vercel

## 🚀 After Verification

Once verified:

1. ✅ Build should complete without warnings
2. ✅ Application should load correctly
3. ✅ Sign in/Sign up should work
4. ✅ No Clerk "resource_not_found" errors (or they're handled gracefully)

---

**Need Help?**
- Check [CLERK_RESOURCE_NOT_FOUND_FIX.md](./CLERK_RESOURCE_NOT_FOUND_FIX.md)
- Review [FIX_CLERK_DNS_CONFIGURATION.md](./FIX_CLERK_DNS_CONFIGURATION.md)
