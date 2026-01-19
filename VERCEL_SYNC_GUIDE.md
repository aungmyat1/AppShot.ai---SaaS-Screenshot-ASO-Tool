# 🔄 Sync Doppler Secrets to Vercel - Complete Guide

**Issue**: The `doppler integration` command is not available in CLI v3.75.1

**Solution**: Use one of these alternative methods to sync your secrets to Vercel

---

## 🚀 **Method 1: Doppler Dashboard Integration (Recommended)**

This is the easiest and most reliable method.

### **Steps**:

1. **Go to Doppler Dashboard**:
   - Open: https://dashboard.doppler.com/
   - Select workspace: `getappshots`
   - Select project: `getappshots`
   - Select config: `dev`

2. **Navigate to Integrations**:
   - Click on the **"Integrations"** tab (left sidebar)
   - Click **"Add Integration"**

3. **Select Vercel**:
   - Find and click **"Vercel"**
   - Click **"Connect to Vercel"**

4. **Authorize**:
   - Log in to Vercel (if not already)
   - Authorize Doppler to access your Vercel projects

5. **Configure Sync**:
   - **Select Vercel Project**: Choose your project
   - **Select Doppler Config**: `dev` (for development)
   - **Select Vercel Environment**: Development
   - Enable **"Auto-sync"**

6. **Save and Sync**:
   - Click **"Save Integration"**
   - Secrets will automatically sync! ✅

7. **Repeat for Other Environments** (Optional):
   - Add another integration for `preview` → Preview
   - Add another integration for `prd` → Production

---

## 🔄 **Method 2: Manual Vercel CLI Sync**

If you prefer to sync manually via CLI:

### **Setup Vercel CLI**:

```bash
# 1. Login to Vercel
vercel login

# 2. Link project
vercel link
```

### **Sync Secrets Manually**:

```bash
# Download secrets from Doppler to a file
doppler secrets download --no-file --format env > .env.vercel

# Add each secret to Vercel (one by one)
# For development environment:
vercel env add ADMIN_EMAILS development < .env.vercel

# Or use this script to add all:
Get-Content .env.vercel | ForEach-Object {
    if ($_ -match '^([^=]+)=(.+)$') {
        $key = $matches[1]
        $value = $matches[2]
        Write-Host "Adding $key..."
        echo $value | vercel env add $key development --force
    }
}

# Clean up
Remove-Item .env.vercel
```

---

## 🎯 **Method 3: Use Vercel Integrations (Easiest for Some Services)**

For specific services, use Vercel's native integrations:

### **Clerk Integration**:
1. Go to: https://vercel.com/integrations/clerk
2. Click **"Add Integration"**
3. Select your Vercel project
4. Clerk keys will auto-sync! ✅

### **Stripe Integration**:
1. Go to: https://vercel.com/integrations/stripe
2. Click **"Add Integration"**
3. Select your Vercel project
4. Stripe keys will auto-sync! ✅

### **Vercel Postgres** (if using):
1. Vercel Dashboard → Your Project → Storage
2. Create Vercel Postgres
3. Database URL auto-syncs! ✅

---

## 📝 **Method 4: Custom Sync Script**

Create a Node.js script to sync all secrets:

### **Create sync script**:

```javascript
// scripts/sync-to-vercel.js
const { execSync } = require('child_process');

console.log('Syncing secrets from Doppler to Vercel...');

// Get all secrets from Doppler
const secrets = execSync('doppler secrets download --no-file --format json', {
  encoding: 'utf-8'
});

const secretsObj = JSON.parse(secrets);

// Add each secret to Vercel
for (const [key, value] of Object.entries(secretsObj)) {
  console.log(`Syncing ${key}...`);
  try {
    execSync(`vercel env add ${key} development`, {
      input: value,
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(`Failed to sync ${key}:`, error.message);
  }
}

console.log('Sync complete! ✅');
```

### **Run the script**:

```bash
node scripts/sync-to-vercel.js
```

---

## ✅ **Recommended Approach**

**For Your Situation**, I recommend:

### **Step 1: Use Doppler Dashboard Integration** (Primary)

This is the best for automated sync:

1. **Go to**: https://dashboard.doppler.com/
2. **Navigate**: workspace `getappshots` → project `getappshots` → Integrations
3. **Add Vercel Integration**:
   - Connect to Vercel
   - Map `dev` → Development
   - Enable auto-sync
4. **Done!** Secrets auto-sync whenever you update them in Doppler ✅

### **Step 2: Use Vercel Native Integrations** (Secondary)

For Clerk and Stripe:

1. **Clerk**: https://vercel.com/integrations/clerk
2. **Stripe**: https://vercel.com/integrations/stripe

---

## 🔍 **Verify Sync**

After setting up integration, verify secrets are in Vercel:

```bash
# List all Vercel environment variables
vercel env ls

# Or check in Vercel Dashboard
# Project → Settings → Environment Variables
```

---

## 📊 **Environment Mapping**

Map Doppler configs to Vercel environments:

```
Doppler Config     →  Vercel Environment
────────────────────────────────────────
dev                →  Development
preview            →  Preview
prd                →  Production
```

### **Setup Multiple Environments**:

In Doppler Dashboard, create 3 integrations:

1. **Integration 1**:
   - Doppler: `dev`
   - Vercel: Development
   
2. **Integration 2**:
   - Doppler: `preview`
   - Vercel: Preview
   
3. **Integration 3**:
   - Doppler: `prd`
   - Vercel: Production

---

## 🎯 **Quick Setup (Step-by-Step)**

### **1. Open Doppler Dashboard**:
```
https://dashboard.doppler.com/
```

### **2. Navigate to Your Project**:
- Workplace: `getappshots`
- Project: `getappshots`
- Config: `dev`

### **3. Add Vercel Integration**:
- Click "Integrations" (left sidebar)
- Click "Add Integration"
- Select "Vercel"
- Click "Connect to Vercel"

### **4. Configure**:
- Authorize Doppler on Vercel
- Select your Vercel project
- Map config: `dev` → Development
- Enable "Auto-sync"

### **5. Save**:
- Click "Save Integration"
- Secrets sync automatically! ✅

---

## ✅ **Verification Checklist**

After setup:

- [ ] Doppler Dashboard integration added
- [ ] Vercel project connected
- [ ] Environment mapping configured
- [ ] Auto-sync enabled
- [ ] Run `vercel env ls` to verify secrets
- [ ] Check Vercel Dashboard → Environment Variables
- [ ] Test deployment with synced secrets

---

## 🔧 **Troubleshooting**

### **Issue: Can't find integration in Doppler Dashboard**

**Solution**: 
- Make sure you're in the correct workplace
- Look for "Integrations" in the left sidebar
- If not visible, check your permissions

### **Issue: Vercel authorization fails**

**Solution**:
```bash
# Re-login to Vercel
vercel logout
vercel login

# Then retry integration in Doppler Dashboard
```

### **Issue: Secrets not appearing in Vercel**

**Solution**:
- Check Vercel Dashboard → Project → Settings → Environment Variables
- Verify integration is active in Doppler
- Try triggering a manual sync in Doppler Dashboard

---

## 🎯 **Current Status**

**Doppler**:
- ✅ 48 secrets stored
- ✅ Project: getappshots
- ✅ Config: dev
- ✅ Ready to sync

**Next Action**:
1. Go to https://dashboard.doppler.com/
2. Add Vercel integration
3. Enable auto-sync
4. Verify with `vercel env ls`

---

## 📝 **Quick Links**

- **Doppler Dashboard**: https://dashboard.doppler.com/
- **Doppler Docs - Vercel Integration**: https://docs.doppler.com/docs/vercel
- **Vercel Integrations**: https://vercel.com/integrations
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Recommended**: Use the Doppler Dashboard integration for automated sync! 🚀
