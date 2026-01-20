# ⚡ Fix Clerk Error NOW - Quick Guide

**Error**: Connection reset (-101) on `credible-bluegill-50.clerk.accounts.dev`

**Problem**: Your keys are for the **wrong Clerk app**!

---

## 🎯 **Quick Fix (2 Minutes)**

### **Step 1: Get Correct Keys**

1. **Open**: https://dashboard.clerk.com/
2. **Select**: **Getappshots** project (not credible-bluegill-50)
3. **Click**: **"API Keys"** (left sidebar)
4. **Copy both**:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

---

### **Step 2: Update in Doppler**

```bash
# Replace YOUR_KEY with the actual keys you copied
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
doppler secrets set CLERK_SECRET_KEY="sk_test_YOUR_KEY_HERE"
```

---

### **Step 3: Restart Server**

```bash
# In the terminal running the server, press Ctrl+C to stop
# Then restart:
doppler run -- npm run web:dev
```

---

### **Step 4: Test**

Open: http://localhost:3000

**Should work now!** ✅

---

## 📊 **What Was Wrong**

**Current keys** → `credible-bluegill-50` app
**You configured** → `Getappshots` app with localhost

**Mismatch!** Keys must match the app you configured.

---

## ✅ **After Fix**

**Keys** → Getappshots app
**Config** → Getappshots app with localhost ✅
**Works!** ✅

---

**Do it now**: Get Getappshots keys → Update Doppler → Restart server! 🚀
