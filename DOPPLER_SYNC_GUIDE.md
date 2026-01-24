# 🔄 How to Correctly Sync Doppler to Vercel

## 📋 Complete Step-by-Step Guide

---

## ✅ **Phase 1: Prepare Your Clerk Keys in Doppler**

### Step 1.1: Login to Doppler
1. Go to: **https://dashboard.doppler.com/**
2. Login with your credentials

### Step 1.2: Navigate to Your Project
1. Click on **"Getappshots"** project (or create it if it doesn't exist)
2. You should see different **configs** (environments):
   - `dev` (Development)
   - `stg` (Staging) - optional
   - `prd` (Production)

### Step 1.3: Add Secrets to Production Config
1. Click on **"prd"** (production config)
2. Click **"Add Secret"** button (top right)
3. Add each of these keys ONE BY ONE:

```
Name:  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_live_YOUR_CLERK_PUBLISHABLE_KEY
```

```
Name:  CLERK_SECRET_KEY
Value: sk_live_YOUR_CLERK_SECRET_KEY
```

**Get these from Clerk Dashboard:**
- Go to: https://dashboard.clerk.com
- Select your app → API Keys
- Copy "Publishable Key" (starts with `pk_live_`) and "Secret Key" (starts with `sk_live_`)

```
Name:  NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /sign-in
```

```
Name:  NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /sign-up
```

4. Click **"Save"** for each one

### Step 1.4: Verify Keys Are Added
You should now see these 4 keys listed in your `prd` config with their values.

---

## ✅ **Phase 2: Connect Doppler to Vercel**

### Step 2.1: Access Doppler Integrations
1. In Doppler Dashboard, click **"Integrations"** in the LEFT sidebar
2. Find **"Vercel"** in the list of available integrations
3. Click on **"Vercel"**

### Step 2.2: Authorize Vercel
1. Click **"Connect to Vercel"** or **"Add Vercel"**
2. You'll be redirected to **Vercel**
3. Click **"Authorize"** to allow Doppler access to your Vercel account
4. You'll be redirected back to Doppler

### Step 2.3: Configure the Sync
1. After authorization, you'll see a form to **"Add Sync"**
2. Fill in the details:

```
Doppler Project:    Getappshots
Doppler Config:     prd
Vercel Team:        Select "aung-myats-projects-142f3377" (or your personal account)
Vercel Project:     getappshots
Vercel Environment: Production
```

3. **Important Options:**
   - ✅ **Sync on Save** - Auto-sync when you change secrets in Doppler
   - ✅ **Import Existing** - Import current Vercel env vars into Doppler (optional)

4. Click **"Create Sync"** or **"Save"**

### Step 2.4: Verify Sync is Created
You should now see:
```
✅ Sync Active
   prd → getappshots (Production)
   Status: Synced
   Last synced: Just now
```

---

## ✅ **Phase 3: Clean Up Old/Conflicting Keys in Vercel**

**Important:** Doppler can't overwrite existing "System" or "Integration" managed variables. You need to remove old ones first.

### Step 3.1: Go to Vercel Dashboard
1. Go to: **https://vercel.com/aung-myats-projects-142f3377/getappshots**
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left menu

### Step 3.2: Identify Old Clerk Keys
Look for these variables with **"Production"** target:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

**Check their values:**
- If they say **(empty)** or have wrong values
- If they're marked as "Managed by Clerk" or "System"

### Step 3.3: Delete Old Keys
1. Click the **"..."** (three dots) next to each old Clerk key
2. Click **"Remove"**
3. Confirm deletion
4. **Repeat** for all 4 Clerk keys in Production environment

**Note:** Only delete Production keys. Keep Preview/Development if they exist.

---

## ✅ **Phase 4: Trigger Manual Sync from Doppler**

### Step 4.1: Go Back to Doppler
1. Return to Doppler Dashboard
2. Click **"Integrations"** → **"Vercel"**
3. Find your sync: **"prd → getappshots (Production)"**

### Step 4.2: Trigger Sync
1. Click **"Sync Now"** button (or refresh icon)
2. Wait for confirmation: **"Synced successfully"**

### Step 4.3: Verify Sync Status
You should see:
```
✅ Synced
   Last synced: Just now
   4 secrets synced
```

---

## ✅ **Phase 5: Verify Keys Appeared in Vercel**

### Step 5.1: Check Vercel Dashboard
1. Go back to: **Vercel → Settings → Environment Variables**
2. You should NOW see the Clerk keys with:
   - ✅ **Values present** (not empty)
   - ✅ **"Managed by Doppler"** or similar indicator
   - ✅ **Target: Production**

### Step 5.2: Or Use Our Script
```powershell
$env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"
npm run clerk:check
```

Expected output:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  Value:  pk_live_Y2xlcmsuZ2V0YXBwc2hvdHMuY29tJA...
  Target: production
  
CLERK_SECRET_KEY
  Value:  (encrypted)
  Target: production
```

---

## ✅ **Phase 6: Redeploy Vercel**

Now that the keys are set, redeploy:

### Step 6.1: Via Vercel Dashboard (Recommended)
1. Go to: **https://vercel.com/aung-myats-projects-142f3377/getappshots**
2. Click **"Deployments"** tab
3. Click on the **latest deployment**
4. Click **"Redeploy"** button (top right)
5. ✅ **IMPORTANT:** Check **"Clear Build Cache"**
6. Click **"Redeploy"** to confirm

### Step 6.2: Monitor Deployment
```powershell
$env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"
npm run deploy:monitor
```

You should see:
```
✅ Latest Deployment
Status:      BUILDING → READY
```

---

## ✅ **Phase 7: Test Your Live Site**

### Step 7.1: Visit Your Site
Go to: **https://getappshots.com**

### Step 7.2: Verify No Errors
- ✅ Page loads (no 500 error)
- ✅ No "MIDDLEWARE_INVOCATION_FAILED"
- ✅ Clerk sign-in/sign-up buttons appear

### Step 7.3: Test Authentication
1. Click **"Sign In"** or **"Sign Up"**
2. Clerk modal should appear
3. Authentication should work

---

## 🔍 **Verification Checklist**

Run all verification commands:

```powershell
# Set token once
$env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"

# Check Clerk keys in Vercel
npm run clerk:check

# Verify Doppler sync status
npm run doppler:verify

# Check latest deployment
npm run deploy:check
```

---

## ⚠️ **Common Issues & Solutions**

### Issue 1: "Doppler sync shows success but keys still empty in Vercel"

**Solution:**
1. Check if old keys exist in Vercel (delete them first)
2. Make sure sync is configured for correct environment (Production)
3. Try **"Sync Now"** again in Doppler
4. Wait 1-2 minutes for sync to complete

### Issue 2: "Can't connect Doppler to Vercel"

**Solution:**
1. Make sure you're logged into correct Vercel account
2. Check Vercel permissions - you need admin/owner role
3. Try disconnecting and reconnecting the integration

### Issue 3: "Keys appear but deployment still fails"

**Solution:**
1. Clear Vercel build cache
2. Check if keys are correct format (`pk_live_...`, not base64)
3. Verify keys work by testing in Clerk Dashboard

### Issue 4: "Multiple CLERK keys in Vercel"

**Solution:**
1. Delete ALL Clerk keys from Vercel first
2. Then trigger Doppler sync fresh
3. This prevents conflicts

---

## 🎯 **What Happens After Correct Setup**

### Automatic Flow:
```
1. You update a secret in Doppler
   ↓
2. Doppler auto-syncs to Vercel (within seconds)
   ↓
3. Next deployment uses new values
   ↓
4. Your app runs with updated secrets
```

### Benefits:
- ✅ **Single source of truth** - All secrets in Doppler
- ✅ **Team collaboration** - Share access without sharing secrets
- ✅ **Easy rotation** - Update once, syncs everywhere
- ✅ **Audit logs** - See who changed what and when
- ✅ **Environment separation** - dev/stg/prd configs

---

## 📖 **Additional Setup (Recommended)**

### Add All Environment Variables to Doppler

After Clerk is working, add your other secrets:

**Database:**
```
DATABASE_URL
DATABASE_URL_ASYNC
REDIS_URL
```

**Stripe:**
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO
STRIPE_PRICE_STARTER
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Storage (R2):**
```
STORAGE_ACCESS_KEY_ID
STORAGE_SECRET_ACCESS_KEY
STORAGE_BUCKET
STORAGE_ENDPOINT_URL
STORAGE_PUBLIC_BASE_URL
```

**Other:**
```
JWT_SECRET_KEY
ADMIN_EMAILS
CORS_ORIGINS
```

---

## 🚀 **Quick Command Reference**

```powershell
# Set your token
$env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"

# Show setup guide
npm run doppler:guide

# Check Clerk keys
npm run clerk:check

# Verify Doppler sync
npm run doppler:verify

# Monitor deployment
npm run deploy:monitor

# Check deployment once
npm run deploy:check
```

---

## 📞 **Need Help?**

If you run into issues:

1. **Check Doppler Dashboard:**
   - Integrations → Vercel → Status should be "Active"

2. **Check Vercel Dashboard:**
   - Settings → Environment Variables → Keys should show "Managed by Doppler"

3. **Run diagnostic:**
   ```powershell
   $env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"
   npm run clerk:check
   ```

4. **Check Doppler sync logs:**
   - Doppler → Integrations → Vercel → Your Sync → "View Logs"

---

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ Doppler shows: "Synced successfully - 4 secrets synced"
2. ✅ Vercel shows: Keys with values, marked "Managed by Doppler"
3. ✅ Our script shows: "All Clerk keys are present and configured"
4. ✅ Deployment succeeds without middleware errors
5. ✅ Live site loads and authentication works

---

## 🎯 **Next: Start the Setup!**

**Ready to begin?**

```powershell
# Run the interactive guide
npm run doppler:guide
```

**Or follow this guide step-by-step manually.**

**After setup, run:**
```powershell
$env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"
npm run doppler:verify
```

Good luck! 🚀
