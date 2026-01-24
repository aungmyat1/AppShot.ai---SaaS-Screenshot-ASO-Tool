# 🚨 URGENT: Wrong Clerk Key in Vercel

## ❌ Current Problem

Your build is failing with:
```
Error: @clerk/clerk-react: The publishableKey passed to Clerk is invalid.
(key=Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA)
```

**This key is WRONG!** It should be: `pk_live_*********************`

---

## ✅ Fix: Update Clerk Key in Vercel Dashboard

### Step 1: Go to Vercel Environment Variables
https://vercel.com/aung-myats-projects-142f3377/getappshots/settings/environment-variables

### Step 2: Find and Update NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

1. Find `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for **Production**
2. Click **"Edit"** (or delete and re-add)
3. Change value from:
   ```
   Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA (WRONG)
   ```
4. To:
   ```
   pk_live_Y2xlcmsuZ2V0YXBwc2hvdHMuY29tJA (CORRECT)
   ```
5. Click **"Save"**

### Step 3: Verify Other Clerk Keys

Also check:
- `CLERK_SECRET_KEY` should be: `sk_live_*******************`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` should be: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` should be: `/sign-up`

---

## 🔄 Step 4: Redeploy

After updating:
1. Go to **Deployments** tab
2. Click latest deployment → **"Redeploy"**
3. ✅ Check **"Clear Build Cache"**
4. Click **"Redeploy"**

---

## 📊 Expected Result

After fixing the key:
- ✅ Build completes without Clerk error
- ✅ No MIDDLEWARE_INVOCATION_FAILED
- ✅ App works correctly

---

## 🔍 Why This Happened

The wrong key (`Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA`) might have come from:
1. An old Clerk app/instance
2. A test key that got synced
3. Doppler having the wrong value

Make sure **Doppler also has the correct key**:
```powershell
doppler secrets --project getappshots --config prd | findstr CLERK
```

---

**Fix the key in Vercel Dashboard now!** 🚨
