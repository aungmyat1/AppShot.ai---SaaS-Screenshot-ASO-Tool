# 🔧 Fix Clerk Error -101 (Connection Reset)

**Error**: `Error Code: -101` on `credible-bluegill-50.clerk.accounts.dev`

**Issue**: Your Clerk keys are for `credible-bluegill-50` app, but you configured `Getappshots` app.

---

## 🎯 **Quick Fix (Choose One)**

### **Option 1: Use Getappshots App Keys** (Recommended)

If you want to use the **Getappshots** Clerk app:

#### **Step 1: Get Keys from Getappshots App**

1. Go to: https://dashboard.clerk.com/
2. Select project: **Getappshots**
3. Click **"API Keys"** (left sidebar)
4. Copy both keys:
   - **Publishable Key**: Starts with `pk_test_`
   - **Secret Key**: Starts with `sk_test_`

#### **Step 2: Update in Doppler**

```bash
# Update Clerk keys in Doppler
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_NEW_KEY"
doppler secrets set CLERK_SECRET_KEY="sk_test_YOUR_NEW_KEY"
```

#### **Step 3: Verify Localhost is Allowed**

1. In Clerk Dashboard → **Getappshots**
2. Go to: **Paths** (left sidebar, under Developers)
3. Check **"Fallback development host"**: Should be `http://localhost:3000`
4. If not, add it and save

#### **Step 4: Restart Server**

```bash
# Kill current server (Ctrl+C in terminal)
# Then restart with new keys
doppler run -- npm run web:dev
```

---

### **Option 2: Fix credible-bluegill-50 App**

If you want to keep using the current keys:

#### **Step 1: Add Localhost to Allowed Origins**

1. Go to: https://dashboard.clerk.com/
2. Select project: **credible-bluegill-50**
3. Go to: **Paths** (left sidebar)
4. Set **"Fallback development host"**: `http://localhost:3000`
5. Click **Save**

#### **Step 2: Restart Server**

```bash
# Kill current server (Ctrl+C)
# Restart
doppler run -- npm run web:dev
```

---

## 📊 **Current Configuration**

**Your Current Keys**:
```
Publishable Key: pk_test_Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA
Secret Key: sk_test_Vj4E8vZtCaXfqR9Kwz2UKM3kqQW1TyLdWTj4XkByMe

Clerk Instance: credible-bluegill-50.clerk.accounts.dev
```

**Error**:
```
Error -101: Connection reset
URL: credible-bluegill-50.clerk.accounts.dev/v1/client/handshake
Reason: localhost:3000 not allowed for this Clerk app
```

---

## 🔍 **Why This Happens**

**Mismatch Between**:
- Keys in Doppler → `credible-bluegill-50` app
- Dashboard config → `Getappshots` app

**You configured localhost in Getappshots, but your keys point to credible-bluegill-50!**

---

## ✅ **Recommended Solution**

**Use Option 1** (Get Getappshots keys):

```bash
# 1. Get keys from Getappshots Clerk app
# Dashboard: https://dashboard.clerk.com/ → Getappshots → API Keys

# 2. Update Doppler
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_NEW_KEY_FROM_GETAPPSHOTS"
doppler secrets set CLERK_SECRET_KEY="sk_test_NEW_KEY_FROM_GETAPPSHOTS"

# 3. Restart server
doppler run -- npm run web:dev

# 4. Test: http://localhost:3000
```

---

## 🚀 **Quick Commands**

### **Check Current Keys**:
```bash
# Check which Clerk instance your keys point to
doppler secrets get NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --plain

# Should decode to show the Clerk domain
```

### **Update Keys** (after getting from Getappshots):
```bash
# Set new keys
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="YOUR_NEW_KEY"
doppler secrets set CLERK_SECRET_KEY="YOUR_NEW_KEY"

# Verify
doppler secrets get NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --plain
```

### **Restart**:
```bash
# Stop current server (Ctrl+C in terminal where it's running)
# Start with new keys
doppler run -- npm run web:dev
```

---

## 📝 **Verification Steps**

**After fixing**:

1. **Server starts** ✅
2. **Open**: http://localhost:3000
3. **Clerk loads** without error ✅
4. **Can sign in/up** ✅

---

## 🎯 **Quick Checklist**

**To fix Error -101**:

- [ ] Choose: Use Getappshots OR credible-bluegill-50
- [ ] Get correct API keys from chosen app
- [ ] Update keys in Doppler
- [ ] Verify localhost:3000 is allowed in Clerk
- [ ] Restart dev server
- [ ] Test at http://localhost:3000

---

## 🔗 **Quick Links**

- **Clerk Dashboard**: https://dashboard.clerk.com/
- **Getappshots Keys**: Dashboard → Getappshots → API Keys
- **credible-bluegill-50 Config**: Dashboard → credible-bluegill-50 → Paths

---

## 💡 **Pro Tip**

**Always match your keys to the app you configured!**

```
Clerk App: Getappshots
   ↓
Keys: From Getappshots
   ↓
Config: In Getappshots
   ↓
Works! ✅
```

---

**Fix now**: Get Getappshots keys and update Doppler! 🚀
