# 🔄 Clerk ↔ Vercel Sync Explained

**Important**: Keys flow FROM Clerk TO Vercel, not the other way around!

---

## 📊 How It Works

```
Clerk Dashboard (Source)
    ↓ (You copy keys)
Local .env.local
    ↓ (Deploy or sync)
Vercel Environment Variables
```

**Direction**: Clerk → Local → Vercel ✅  
**NOT**: Vercel → Clerk ❌

---

## 🔑 Key Flow

### 1. Clerk is the Source

**Clerk generates the keys**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

These keys identify YOUR "Getappshots" app in Clerk.

### 2. You Add Keys Locally

**Add to `.env.local` files**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Keys Go to Vercel

**Two ways to sync to Vercel**:

**Option A**: Vercel auto-reads on deploy
```bash
vercel deploy
# Vercel reads .env.local and uses those keys
```

**Option B**: Manual sync to Vercel
```bash
# In Vercel Dashboard:
Settings → Environment Variables → Add
```

**Option C**: Use Doppler (optional)
```bash
# Doppler syncs keys to Vercel automatically
npm run env:sync
```

---

## ❌ Common Misconception

### WRONG: "Sync from Vercel to Clerk"

You **CANNOT** sync keys from Vercel to Clerk.

**Why**: 
- Clerk GENERATES the keys
- Vercel just STORES the keys
- Keys identify your Clerk app
- Vercel can't change what Clerk generated

### RIGHT: "Get keys from Clerk, add to Vercel"

```
1. Clerk Dashboard → Generate/Copy keys
2. Add to local .env.local
3. Deploy to Vercel (keys go with deploy)
   OR manually add to Vercel dashboard
```

---

## ✅ Current Status Check

Let me verify your setup:

### Step 1: Check Local Keys

```bash
# Root .env.local
Get-Content .env.local | Select-String "CLERK"

# Apps/web .env.local
Get-Content apps\web\.env.local | Select-String "CLERK"
```

**Do the keys match what's in Clerk dashboard?**

### Step 2: Did You Restart Server?

```bash
# After changing keys, you MUST restart
npm run web:dev
```

### Step 3: Add Localhost to Clerk

In Clerk Dashboard → "Getappshots" → Settings → Paths:
- Add: `http://localhost:3000`
- Click Save

### Step 4: Test

```bash
# Open browser
start http://localhost:3000
```

**Expected**: No more "Invalid host" error ✅

---

## 🔄 Sync Options Explained

### Option 1: No Sync (Manual) - Simplest

**For Local Development**:
1. Copy keys from Clerk
2. Paste into `.env.local`
3. Restart server
4. Done! ✅

**For Production**:
1. Copy keys from Clerk
2. Add to Vercel Dashboard → Environment Variables
3. Redeploy
4. Done! ✅

### Option 2: Git (Not Recommended)

❌ **DO NOT** commit `.env.local` to Git
- Contains secrets
- Security risk

### Option 3: Doppler (Advanced - Optional)

**If using Doppler**:
```bash
# Store keys in Doppler
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
doppler secrets set CLERK_SECRET_KEY="sk_test_..."

# Sync Doppler → Vercel
npm run env:sync
```

**Benefit**: Centralized secret management

**Downside**: Extra tool to manage

---

## 🎯 What You Need to Do Now

### If You Changed Keys:

1. **Verify keys in .env.local match Clerk**:
   ```bash
   Get-Content .env.local | Select-String "CLERK"
   ```

2. **Verify keys in apps/web/.env.local**:
   ```bash
   Get-Content apps\web\.env.local | Select-String "CLERK"
   ```

3. **Restart dev server**:
   ```bash
   npm run web:dev
   ```

4. **Add localhost to Clerk** (if not done):
   - Clerk Dashboard → Getappshots → Settings → Paths
   - Add: `http://localhost:3000`
   - Save

5. **Test**:
   ```bash
   start http://localhost:3000
   ```

---

## 🔐 Vercel Environment Variables Setup

### For Production Deployment:

**After local dev works**, add keys to Vercel:

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project**: "Getappshots"

3. **Go to Settings → Environment Variables**

4. **Add These Variables**:

   **Variable 1**:
   - Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Value: `pk_test_...` (from Clerk)
   - Environments: Production, Preview, Development

   **Variable 2**:
   - Key: `CLERK_SECRET_KEY`
   - Value: `sk_test_...` (from Clerk)
   - Environments: Production, Preview, Development
   - **Sensitive**: ✅ Check this box

   **Variable 3**:
   - Key: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - Value: `/sign-in`

   **Variable 4**:
   - Key: `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - Value: `/sign-up`

5. **Save**

6. **Redeploy**: Vercel → Deployments → Redeploy

---

## 🌐 Allowed Origins for Production

When deploying to Vercel:

**In Clerk Dashboard → Getappshots → Settings → Paths**:

Add your production domains:
```
http://localhost:3000          ← Development
https://getappshots.com        ← Production
https://*.vercel.app           ← Vercel previews
https://your-domain.com        ← Your custom domain
```

---

## ✅ Verification Checklist

- [ ] Got fresh keys from Clerk "Getappshots" app
- [ ] Updated root `.env.local` with new keys
- [ ] Updated `apps/web/.env.local` with new keys  
- [ ] Added `http://localhost:3000` to Clerk allowed origins
- [ ] Clicked Save in Clerk
- [ ] Restarted dev server: `npm run web:dev`
- [ ] Tested at http://localhost:3000
- [ ] No "Invalid host" error ✅

---

## 🚀 Quick Commands

```bash
# Check if keys updated
Get-Content .env.local | Select-String "CLERK"

# Restart dev server
npm run web:dev

# Test
start http://localhost:3000

# For production: Sync to Vercel (optional with Doppler)
npm run env:sync
```

---

## 📝 Summary

**Key Points**:

1. ✅ **Keys come FROM Clerk** (Clerk is the source)
2. ✅ **You add keys TO Vercel** (for production)
3. ✅ **Local first** - Test locally before Vercel
4. ✅ **Add localhost to Clerk** - Required for dev
5. ✅ **Restart after changes** - Must restart server

**Flow**:
```
Clerk Dashboard
   ↓ (copy)
.env.local files
   ↓ (test locally)
✅ Working?
   ↓ (deploy)
Vercel Environment Variables
   ↓ (deploy)
✅ Production!
```

---

**Quick Test**: Did you restart the dev server after changing keys? That's the most common missing step! 🔄
