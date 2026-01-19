# 🔧 Fix Clerk "Invalid Host" Error

**Error**: `Invalid host - We were unable to attribute this request to an instance running on Clerk`

**Solution**: Add localhost to your Clerk dashboard allowed domains

---

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Clerk Dashboard

1. Open https://dashboard.clerk.com/
2. Sign in to your account
3. Select your application: **"composed-gar-1"** (or your app name)

### Step 2: Add Localhost to Allowed Domains

1. In the left sidebar, click **⚙️ Settings** (or **Configure**)
2. Click **Domain & URLs** (or **Paths**)
3. Under **Allowed origins** or **Development origins**, add:
   ```
   http://localhost:3000
   ```
4. Click **Save** or **Add Domain**

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run web:dev
```

### Step 4: Test

Open http://localhost:3000 and try to sign in/sign up.

✅ The Clerk error should be gone!

---

## 🔍 Alternative: Check Your Clerk Configuration

### Verify Environment Variables

Your current Clerk configuration:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcG9zZWQtZ2FyLTEuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_OTuIfgpcgzVE8JjndxYPYv83aA3ly1JFEmCMQx9p0q
```

**Clerk Instance**: `composed-gar-1.clerk.accounts.dev`

### If Keys Are Wrong

If these keys are incorrect or expired:

1. Go to https://dashboard.clerk.com/
2. Select your app
3. Go to **API Keys**
4. Copy the new keys:
   - `Publishable Key` (starts with `pk_test_`)
   - `Secret Key` (starts with `sk_test_`)

5. Update `.env.local` and `apps/web/.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_new_key_here
   CLERK_SECRET_KEY=sk_test_your_new_key_here
   ```

6. Restart dev server

---

## 🌐 Detailed Clerk Dashboard Steps

### Option 1: Add Localhost (Recommended for Development)

**Path**: Dashboard → Your App → Settings → Paths

1. **Sign-in URL**: `/sign-in` ✅ (already configured)
2. **Sign-up URL**: `/sign-up` ✅ (already configured)
3. **Allowed redirect URLs**: Add `http://localhost:3000`
4. **Allowed origins**: Add `http://localhost:3000`

### Option 2: Enable Development Mode

Some Clerk instances have a "Development Mode" toggle:

1. Go to **Settings** → **General**
2. Look for **Development Mode** or **Test Mode**
3. Enable it
4. This automatically allows localhost

---

## 🔐 Complete Clerk Environment Variables

Make sure you have all these in your `.env.local` files:

```bash
### Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcG9zZWQtZ2FyLTEuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_OTuIfgpcgzVE8JjndxYPYv83aA3ly1JFEmCMQx9p0q
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Optional (but recommended):

```bash
# Add these if you want to customize redirects
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 🧪 Test the Fix

After fixing, test these scenarios:

### 1. Basic Access
```bash
# Start dev server
npm run web:dev

# Open in browser
http://localhost:3000
```

✅ Landing page should load without errors

### 2. Sign Up
1. Click **Sign Up** button
2. Enter email and password
3. Should not show "Invalid host" error
4. Should create account and redirect to dashboard

### 3. Sign In
1. Click **Sign In** button
2. Enter credentials
3. Should authenticate successfully
4. Should redirect to dashboard

---

## 🔧 If Still Not Working

### Check 1: Verify Clerk Instance

Your Clerk instance from the error is:
```
composed-gar-1.clerk.accounts.dev
```

Make sure this matches your Clerk dashboard URL.

### Check 2: Clear Browser Cache

```bash
# In Chrome/Edge:
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
```

Or use Incognito/Private mode

### Check 3: Verify Publishable Key Format

Your key: `pk_test_Y29tcG9zZWQtZ2FyLTEuY2xlcmsuYWNjb3VudHMuZGV2JA`

Decode the base64 part to verify:
```bash
# The decoded part should be: composed-gar-1.clerk.accounts.dev
```

This confirms your key is for the `composed-gar-1` instance.

### Check 4: Update Keys from Clerk Dashboard

If keys are old or wrong:

1. Go to https://dashboard.clerk.com/
2. Select **"composed-gar-1"** app
3. Go to **API Keys** in left sidebar
4. Copy **fresh keys**:
   - Publishable Key (click to copy)
   - Secret Key (click "Show" then copy)
5. Update both `.env.local` files
6. Restart server

---

## 📋 Complete Fix Checklist

- [ ] Go to Clerk Dashboard (https://dashboard.clerk.com/)
- [ ] Select your app (composed-gar-1)
- [ ] Go to Settings → Paths or Domain & URLs
- [ ] Add `http://localhost:3000` to allowed origins
- [ ] Save changes
- [ ] Restart dev server (Ctrl+C then `npm run web:dev`)
- [ ] Clear browser cache or use Incognito mode
- [ ] Test sign up/sign in at http://localhost:3000

---

## 🚀 Quick Commands

```bash
# Restart dev server
npm run web:dev

# Check environment variables
Get-Content apps\web\.env.local | Select-String "CLERK"

# Test in different port (if 3000 is problematic)
PORT=3001 npm run web:dev

# View all environment variables
Get-Content .env.local
```

---

## 🎯 Most Common Solution

**90% of "Invalid host" errors are fixed by:**

1. Adding `http://localhost:3000` to Clerk allowed origins
2. Restarting the dev server

**Go to**: https://dashboard.clerk.com/ → Your App → Settings → Paths → Add `http://localhost:3000`

---

## 📞 Still Having Issues?

### Option 1: Create a New Clerk App

If the current app is misconfigured:

1. Go to https://dashboard.clerk.com/
2. Click **Create Application**
3. Name it "AppShot Development"
4. Copy the new API keys
5. Update your `.env.local` files
6. Restart dev server

### Option 2: Check Clerk Status

Visit: https://status.clerk.com/

Sometimes Clerk has service issues.

### Option 3: Verify Network

Make sure you can access:
```
https://composed-gar-1.clerk.accounts.dev
```

If not, there might be a firewall/network issue.

---

## ✅ Expected Result

After fixing, you should see:

1. **Landing page loads** without errors ✅
2. **Click Sign Up** → Opens Clerk sign-up form ✅
3. **Enter email/password** → Creates account ✅
4. **Redirects to dashboard** → `/dashboard` ✅
5. **No console errors** → Check F12 DevTools ✅

---

**Quick fix**: Go to Clerk Dashboard → Add `http://localhost:3000` → Restart server! 🚀
