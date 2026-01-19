# 🔄 Doppler Setup Guide - Complete Steps

**Goal**: Setup Doppler for automatic secret management and Vercel sync

---

## ✅ Admin Email Updated

**Updated**: `ADMIN_EMAILS=admin@getappshots.com` ✅

---

## 🚀 Doppler Setup Process

### Step 1: Install Doppler (If Not Already)

```bash
# Windows (winget)
winget install doppler.doppler

# Verify installation
doppler --version
```

---

### Step 2: Login to Doppler

```bash
doppler login
```

**What happens**:
- Opens browser
- Login with your account (or create one)
- Authorizes CLI access

---

### Step 3: Setup Project

```bash
# In your project directory
doppler setup
```

**Prompts**:
1. **Create new project or select existing?**
   - Choose: **Create new**
   - Name: `getappshots`

2. **Select config (environment)**:
   - Choose: `dev` (for development)
   - Or create custom: `local`, `development`, etc.

---

### Step 4: Upload Your Current Secrets

```bash
# Upload .env.local to Doppler
doppler secrets upload .env.local
```

**This uploads all your keys**:
- ✅ Clerk (Authentication)
- ✅ Database (PostgreSQL)
- ✅ Storage (Cloudflare R2)
- ✅ Stripe (Payments)
- ✅ Admin Email
- ✅ JWT Secret
- ✅ All configuration

---

### Step 5: Verify Secrets Uploaded

```bash
# List all secrets in Doppler
doppler secrets

# Or check specific keys
doppler secrets get CLERK_SECRET_KEY
doppler secrets get ADMIN_EMAILS
```

---

### Step 6: Setup Vercel Integration

#### Get Vercel Token

1. **Go to**: https://vercel.com/account/tokens
2. **Create new token**:
   - Name: `Doppler Sync`
   - Scope: `Full Account` or select specific projects
3. **Copy the token**

#### Get Vercel Project ID

```bash
# Method 1: From Vercel CLI
vercel link
vercel ls

# Method 2: From Vercel Dashboard
# Go to: Settings → General → Project ID
```

#### Add to Doppler

```bash
# Add Vercel credentials to Doppler
doppler secrets set VERCEL_TOKEN="your_vercel_token_here"
doppler secrets set VERCEL_PROJECT_ID="your_project_id"
```

---

### Step 7: Setup Doppler → Vercel Integration

#### Option A: Using Doppler CLI

```bash
# Link Doppler to Vercel
doppler integration set vercel

# Follow prompts:
# - Select Vercel project
# - Map environments (dev → Development, prod → Production)
```

#### Option B: Using Doppler Dashboard

1. **Go to**: https://dashboard.doppler.com/
2. **Select**: `getappshots` project
3. **Click**: Integrations
4. **Add**: Vercel integration
5. **Configure**:
   - Select Vercel project
   - Map Doppler config to Vercel environment
   - Enable auto-sync

---

### Step 8: Sync to Vercel

```bash
# Using project script
npm run env:sync

# Or manually
node scripts/sync-doppler-to-vercel.js

# Sync specific environment
npm run env:sync:dev      # Development
npm run env:sync:preview  # Preview
npm run env:sync:prod     # Production
```

---

## 🎯 Complete Setup Workflow

### Initial Setup (One Time)

```bash
# 1. Install Doppler
winget install doppler.doppler

# 2. Login
doppler login

# 3. Setup project
doppler setup
# → Create project: getappshots
# → Select config: dev

# 4. Upload secrets
doppler secrets upload .env.local

# 5. Get Vercel token from: https://vercel.com/account/tokens
# 6. Add to Doppler
doppler secrets set VERCEL_TOKEN="your_token"
doppler secrets set VERCEL_PROJECT_ID="prj_xxxxx"

# 7. Setup integration
doppler integration set vercel

# 8. Sync to Vercel
npm run env:sync
```

---

## 🔄 Daily Workflow (After Setup)

### Update a Secret

```bash
# Method 1: Via Doppler CLI
doppler secrets set CLERK_SECRET_KEY="new_value"

# Method 2: Via Doppler Dashboard
# https://dashboard.doppler.com/ → Edit secret

# Auto-syncs to Vercel! ✅
```

### Run Development

```bash
# With Doppler (pulls latest secrets)
doppler run -- npm run web:dev

# Or use project script
npm run dev:doppler
```

### Sync to Vercel (if needed)

```bash
npm run env:sync
```

---

## 📝 Doppler Commands Reference

### Secrets Management

```bash
# List all secrets
doppler secrets

# Get specific secret
doppler secrets get KEY_NAME

# Set secret
doppler secrets set KEY="value"

# Delete secret
doppler secrets delete KEY_NAME

# Download secrets to file
doppler secrets download > .env.local

# Upload secrets from file
doppler secrets upload .env.local
```

### Configuration

```bash
# View current config
doppler configure

# Switch config/environment
doppler setup

# List configs
doppler configs
```

### Running Applications

```bash
# Run with Doppler secrets
doppler run -- npm run web:dev

# Run any command
doppler run -- node script.js
```

---

## 🔐 Security Best Practices

### ✅ DO:

1. **Use Doppler for all secrets**
   - Never store secrets in .env.local in git
   - Use Doppler as single source of truth

2. **Set up different configs**
   - `dev` for local development
   - `staging` for staging environment
   - `prod` for production

3. **Use access controls**
   - Invite team members to Doppler
   - Set appropriate permissions
   - Enable audit logs

4. **Rotate secrets regularly**
   - Update in Doppler
   - Auto-syncs everywhere

### ❌ DON'T:

1. **Commit .env.local to git**
   - Always in .gitignore
   - Use Doppler instead

2. **Share secrets manually**
   - Use Doppler team access
   - Don't copy/paste secrets

3. **Use same keys everywhere**
   - Different keys for dev/prod
   - Rotate regularly

---

## 🎯 Environment Mapping

### Doppler → Vercel Mapping

```
Doppler Config     →  Vercel Environment
────────────────────────────────────────
dev                →  Development
preview            →  Preview
prod               →  Production
```

### Your Setup

```bash
# Create additional configs if needed
doppler configs create preview
doppler configs create prod

# Copy secrets from dev
doppler secrets download --config dev | doppler secrets upload --config prod
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Doppler CLI installed and working
- [ ] Logged into Doppler
- [ ] Project created: `getappshots`
- [ ] Secrets uploaded from .env.local
- [ ] All secrets visible in Doppler dashboard
- [ ] Vercel token added to Doppler
- [ ] Vercel project ID added
- [ ] Vercel integration configured
- [ ] Secrets synced to Vercel
- [ ] Can run: `doppler run -- npm run web:dev`
- [ ] Admin email updated to: admin@getappshots.com

---

## 🔧 Troubleshooting

### Issue: "doppler: command not found"

**Solution**: 
```bash
# Reinstall Doppler
winget install doppler.doppler

# Or add to PATH
# C:\Program Files\Doppler\doppler.exe
```

### Issue: "No project found"

**Solution**:
```bash
# Run setup again
doppler setup

# Or specify project
doppler setup --project getappshots --config dev
```

### Issue: Secrets not syncing to Vercel

**Solution**:
```bash
# Check integration
doppler integration

# Re-sync manually
npm run env:sync

# Check Vercel token is valid
doppler secrets get VERCEL_TOKEN
```

### Issue: "Unauthorized" error

**Solution**:
```bash
# Re-login
doppler login

# Verify authentication
doppler me
```

---

## 🚀 Next Steps After Setup

### 1. Test Local Development

```bash
# Run with Doppler
doppler run -- npm run web:dev

# Should work with all secrets loaded! ✅
```

### 2. Deploy to Vercel

```bash
# Secrets already synced via Doppler
vercel --prod

# Or push to git (triggers auto-deploy)
git push origin main
```

### 3. Invite Team Members

1. Go to https://dashboard.doppler.com/
2. Select `getappshots` project
3. Settings → Team
4. Invite team members
5. Set permissions

---

## 📊 Success Indicators

**You'll know setup is working when**:

1. ✅ `doppler secrets` shows all your keys
2. ✅ `doppler run -- npm run web:dev` works
3. ✅ Vercel environment variables match Doppler
4. ✅ Can update secrets in Doppler dashboard
5. ✅ Changes auto-sync to Vercel
6. ✅ Team members can access secrets

---

## 🎯 Quick Commands

```bash
# View all secrets
doppler secrets

# Update admin email
doppler secrets set ADMIN_EMAILS="admin@getappshots.com"

# Run dev server
doppler run -- npm run web:dev

# Sync to Vercel
npm run env:sync

# Check Vercel vars
vercel env ls
```

---

**Setup complete!** All secrets now managed centrally in Doppler and auto-sync to Vercel! 🚀
