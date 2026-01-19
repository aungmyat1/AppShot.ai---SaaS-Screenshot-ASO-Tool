# 🔄 Auto-Sync All Keys Guide

**Goal**: Automatically sync all environment variables/keys across Local → Vercel

---

## 📊 Current Keys in Your Project

### ✅ Keys You Have:

1. **Clerk (Authentication)**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

2. **Database (PostgreSQL)**
   - `DATABASE_URL`
   - `DATABASE_URL_ASYNC` (optional)

3. **Storage (Cloudflare R2)**
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_ENDPOINT`
   - `NEXT_PUBLIC_R2_PUBLIC_URL`

4. **Stripe (Payments)** (if configured)
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO`

5. **Admin**
   - `ADMIN_EMAILS`

---

## 🚀 Auto-Sync Options

### **Option 1: Doppler (Recommended) ⭐**

**Best for**: Centralized secret management, automatic sync to Vercel

#### Setup Doppler:

**Step 1: Install Doppler CLI**
```bash
# Windows (using winget)
winget install doppler.doppler

# Or using Scoop
scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git
scoop install doppler
```

**Step 2: Login**
```bash
doppler login
```

**Step 3: Link to Your Project**
```bash
# In your project directory
doppler setup

# Select or create project: getappshots
# Select config: dev (for development)
```

**Step 4: Import Your Current Keys**
```bash
# Upload your .env.local to Doppler
doppler secrets upload .env.local
```

**Step 5: Setup Vercel Integration**
```bash
# Link Doppler to Vercel
doppler integration set vercel

# You'll need:
# - Vercel API Token (get from https://vercel.com/account/tokens)
# - Vercel Project ID (your project ID)
```

**Step 6: Auto-Sync to Vercel**
```bash
# Sync all secrets to Vercel
npm run env:sync

# Or manually:
node scripts/sync-doppler-to-vercel.js
```

**Benefits**:
- ✅ One source of truth for all secrets
- ✅ Automatic sync to Vercel
- ✅ Team collaboration
- ✅ Secret rotation
- ✅ Audit logs

---

### **Option 2: Vercel Integration (Easiest)**

**Best for**: Simple setup, no extra tools

#### Use Vercel Integrations:

**For Clerk**:
1. Go to: https://vercel.com/integrations/clerk
2. Click "Add Integration"
3. Select your project
4. Clerk keys auto-sync! ✅

**For Postgres**:
1. Vercel Dashboard → Your Project → Storage
2. Create Vercel Postgres
3. Database URL auto-syncs! ✅

**For Stripe**:
1. Go to: https://vercel.com/integrations/stripe
2. Click "Add Integration"
3. Stripe keys auto-sync! ✅

**Benefits**:
- ✅ No CLI tools needed
- ✅ Automatic integration
- ✅ Simple setup

**Limitations**:
- ⚠️ Only works for supported services
- ⚠️ No centralized management

---

### **Option 3: Vercel CLI (Manual Sync)**

**Best for**: Quick one-time syncs

#### Sync Manually:

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Link Project**
```bash
vercel link
```

**Step 4: Manually Add Secrets**
```bash
# Add each secret
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# (paste value when prompted)

# Or pull from Vercel
vercel env pull .env.vercel.local
```

**Benefits**:
- ✅ Direct control
- ✅ Simple commands

**Limitations**:
- ⚠️ Manual process
- ⚠️ Must update each key individually

---

## 📝 Complete Setup: Doppler + Vercel (Recommended)

### Step-by-Step Complete Setup:

#### **Phase 1: Setup Doppler**

```bash
# 1. Install Doppler
winget install doppler.doppler

# 2. Login
doppler login

# 3. Initialize in project
doppler setup

# 4. Upload current secrets
doppler secrets upload .env.local
```

#### **Phase 2: Configure Vercel Token**

```bash
# 1. Get Vercel token
# Go to: https://vercel.com/account/tokens
# Create new token: "Doppler Sync"
# Copy the token

# 2. Set in .env.local
echo "VERCEL_TOKEN=your_vercel_token_here" >> .env.local
echo "VERCEL_PROJECT_ID=your_project_id" >> .env.local
```

#### **Phase 3: Setup Auto-Sync**

**Your project already has sync scripts!** Just configure them:

```bash
# 1. Update Doppler secrets with Vercel credentials
doppler secrets set VERCEL_TOKEN="your_token"
doppler secrets set VERCEL_PROJECT_ID="your_project_id"

# 2. Sync to Vercel
npm run env:sync          # Sync to all environments
npm run env:sync:dev      # Sync to development
npm run env:sync:preview  # Sync to preview
npm run env:sync:prod     # Sync to production
```

#### **Phase 4: Workflow**

**From now on**:

```bash
# 1. Update a secret in Doppler
doppler secrets set CLERK_SECRET_KEY="new_key"

# 2. Sync to local
doppler run -- npm run web:dev

# 3. Sync to Vercel
npm run env:sync

# Done! Keys updated everywhere ✅
```

---

## 🔄 Auto-Sync Workflows

### **Workflow 1: Using Doppler (Best)**

```
Developer
    ↓
Doppler Dashboard (Update keys)
    ↓ (automatic)
Local .env.local (doppler run)
    ↓ (npm run env:sync)
Vercel Environment Variables
    ↓ (automatic redeploy)
Production ✅
```

### **Workflow 2: Using Vercel Integrations**

```
External Service (Clerk, Stripe)
    ↓ (Vercel integration)
Vercel Environment Variables
    ↓ (vercel env pull)
Local .env.local
```

### **Workflow 3: Manual (Current)**

```
External Service
    ↓ (copy keys manually)
Local .env.local
    ↓ (git push / manual)
Vercel Dashboard (add manually)
```

---

## 📋 Complete Key Checklist

**Services to Configure**:

- [ ] **Clerk** (Authentication)
  - Get keys from: https://dashboard.clerk.com/
  - Keys needed: Publishable + Secret
  - Auto-sync via: Vercel Integration OR Doppler

- [ ] **Database** (PostgreSQL)
  - Get URL from: Vercel Postgres OR Neon
  - Key needed: DATABASE_URL
  - Auto-sync via: Vercel Postgres (automatic) OR Doppler

- [ ] **Storage** (Cloudflare R2)
  - Get keys from: Cloudflare dashboard
  - Keys needed: Account ID + Access Key + Secret + Bucket
  - Auto-sync via: Doppler only

- [ ] **Stripe** (Payments)
  - Get keys from: https://dashboard.stripe.com/
  - Keys needed: Publishable + Secret + Webhook Secret
  - Auto-sync via: Vercel Integration OR Doppler

- [ ] **Admin**
  - Set: Your admin email addresses
  - Auto-sync via: Doppler

---

## 🎯 Quick Start: Best Setup

**For your "Getappshots" project, I recommend**:

### **Hybrid Approach** (Best of both worlds):

1. **Use Vercel Integrations** for:
   - Clerk (auto-sync)
   - Stripe (auto-sync)
   - Vercel Postgres (automatic)

2. **Use Doppler** for:
   - Cloudflare R2 credentials
   - Admin emails
   - Other custom secrets
   - Syncing everything to Vercel

### **Setup Steps**:

```bash
# 1. Install and setup Doppler
winget install doppler.doppler
doppler login
doppler setup

# 2. Upload current secrets
doppler secrets upload .env.local

# 3. Add Vercel integrations
# Go to: https://vercel.com/integrations
# Add: Clerk, Stripe

# 4. Link Doppler to Vercel
# Set VERCEL_TOKEN and PROJECT_ID in Doppler

# 5. Run sync
npm run env:sync
```

---

## 📝 Available npm Scripts

Your project has these sync scripts:

```bash
# Check environment
npm run env:check          # Verify all variables

# Sync to Vercel (requires Doppler + Vercel token)
npm run env:sync          # Sync to all environments
npm run env:sync:dev      # Sync to development
npm run env:sync:preview  # Sync to preview  
npm run env:sync:prod     # Sync to production

# Dry run (test without actual sync)
npm run env:dry-run

# List secrets (from Doppler)
npm run env:list
```

---

## 🔐 Security Best Practices

### **DO**:
- ✅ Use Doppler or similar for secret management
- ✅ Never commit .env.local to git
- ✅ Use different keys for dev/production
- ✅ Rotate keys regularly
- ✅ Use Vercel integrations when available

### **DON'T**:
- ❌ Commit secrets to git
- ❌ Share .env.local files
- ❌ Use production keys in development
- ❌ Store secrets in plain text
- ❌ Use same keys across projects

---

## 🚀 Complete Command Reference

```bash
# === DOPPLER COMMANDS ===

# Setup
doppler login
doppler setup
doppler secrets upload .env.local

# View secrets
doppler secrets
doppler secrets get CLERK_SECRET_KEY

# Set secrets
doppler secrets set KEY="value"

# Run with Doppler
doppler run -- npm run web:dev

# === VERCEL COMMANDS ===

# Setup
vercel login
vercel link

# Environment variables
vercel env ls
vercel env add KEY
vercel env pull .env.vercel.local

# === PROJECT COMMANDS ===

# Sync (requires Doppler + Vercel token)
npm run env:sync

# Check
npm run env:check

# Dev with Doppler
npm run dev:doppler
```

---

## 🎯 Recommendation for You

**Based on your setup, do this**:

### **Step 1: Fix Clerk Now** (Priority)
```bash
# 1. Update keys in Clerk dashboard
# 2. Add localhost to allowed origins
# 3. Update .env.local with correct keys
# 4. Restart: npm run web:dev
```

### **Step 2: Setup Auto-Sync** (After Clerk works)
```bash
# Option A: Use Vercel Integrations (Easiest)
# - Add Clerk integration to Vercel
# - Add Stripe integration to Vercel
# - Use Vercel Postgres

# Option B: Use Doppler (Most powerful)
winget install doppler.doppler
doppler login
doppler setup
doppler secrets upload .env.local
npm run env:sync
```

### **Step 3: Test**
```bash
# Local
npm run web:dev

# Check Vercel
vercel env ls
```

---

## ✅ Success Checklist

- [ ] All keys identified and documented
- [ ] Doppler OR Vercel integrations setup
- [ ] Keys synced to Vercel
- [ ] Local dev works with keys
- [ ] Production deployment has keys
- [ ] .env.local NOT in git
- [ ] Team has access to Doppler/Vercel

---

**Quick Start**: Fix Clerk first, then setup Doppler for auto-sync! 🚀
