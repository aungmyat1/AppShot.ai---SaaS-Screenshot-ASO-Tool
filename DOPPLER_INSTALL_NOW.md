# 🚀 Install Doppler - Quick Guide

**Current Status**: Admin email updated ✅ | Clerk configured ✅ | Ready for Doppler!

---

## ⚡ **Quick Install (Choose One Method)**

### **Method 1: Windows Package Manager (Recommended)**

**Open PowerShell as Administrator** and run:

```powershell
winget install doppler.doppler
```

**When prompted**:
- Accept the source agreements: Type `Y` and press Enter
- Wait for installation to complete

---

### **Method 2: Chocolatey**

If you have Chocolatey installed:

```powershell
choco install doppler
```

---

### **Method 3: Manual Download**

1. **Download**: Go to https://docs.doppler.com/docs/install-cli#windows
2. **Install**: Run the installer (`.msi` file)
3. **Verify**: Open new terminal and run `doppler --version`

---

## ✅ **Verify Installation**

After installation, **restart your terminal** and run:

```bash
doppler --version
```

**Expected output**: `doppler version X.X.X`

---

## 🔄 **After Installation: Complete Setup**

Once Doppler is installed, run these commands in order:

### **1. Login to Doppler**

```bash
doppler login
```

**What happens**:
- Opens browser
- Login or create free account
- Authorizes CLI access

---

### **2. Setup Project**

```bash
doppler setup
```

**Prompts**:
1. **Create new project?** → Yes
   - **Name**: `getappshots`
   
2. **Select config?** → `dev` (for development)

---

### **3. Upload Your Secrets**

```bash
doppler secrets upload .env.local
```

**This uploads**:
- ✅ Admin email: admin@getappshots.com (updated!)
- ✅ Clerk keys (fixed!)
- ✅ Database URL (cleaned!)
- ✅ R2 storage credentials
- ✅ Stripe keys
- ✅ All configuration

---

### **4. Verify Upload**

```bash
# List all secrets
doppler secrets

# Check specific ones
doppler secrets get ADMIN_EMAILS
doppler secrets get CLERK_SECRET_KEY
```

---

### **5. Get Vercel Credentials**

#### **Get Vercel Token**:
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `Doppler Sync`
4. Copy the token

#### **Get Project ID**:
```bash
vercel link
# Then check: .vercel/project.json
```

Or from Vercel Dashboard: Settings → General → Project ID

---

### **6. Add Vercel Credentials to Doppler**

```bash
doppler secrets set VERCEL_TOKEN="your_vercel_token_here"
doppler secrets set VERCEL_PROJECT_ID="prj_xxxxx"
```

---

### **7. Setup Vercel Integration**

```bash
# Link Doppler to Vercel
doppler integration set vercel
```

**Follow prompts**:
- Select Vercel project
- Map environments (dev → Development)

---

### **8. Sync to Vercel**

```bash
npm run env:sync
```

**Done!** All secrets now auto-sync between Doppler and Vercel! ✅

---

## 🎯 **Complete Command Sequence**

**Copy and run these one by one** (after Doppler is installed):

```bash
# 1. Login
doppler login

# 2. Setup project
doppler setup
# → Project name: getappshots
# → Config: dev

# 3. Upload secrets (includes updated admin email!)
doppler secrets upload .env.local

# 4. Verify
doppler secrets

# 5. Get Vercel token from: https://vercel.com/account/tokens
# 6. Add credentials
doppler secrets set VERCEL_TOKEN="your_token"
doppler secrets set VERCEL_PROJECT_ID="prj_xxxxx"

# 7. Setup integration
doppler integration set vercel

# 8. Sync
npm run env:sync
```

---

## 🔄 **Daily Use (After Setup)**

### **Run Development with Doppler**:

```bash
# Method 1: Via Doppler
doppler run -- npm run web:dev

# Method 2: Via project script
npm run dev:doppler
```

### **Update Secrets**:

```bash
# Update any secret
doppler secrets set KEY="new_value"

# Auto-syncs to Vercel! ✅
```

---

## ✅ **Current Status**

**Completed**:
- ✅ Clerk configured with localhost:3000
- ✅ Clerk Home URL set to getappshots.com
- ✅ Admin email updated to admin@getappshots.com
- ✅ .env.local cleaned and fixed
- ⏳ Doppler installation in progress

**Next**:
1. Complete Doppler installation
2. Run setup commands above
3. Test with `doppler run -- npm run web:dev`

---

## 🔧 **Troubleshooting**

### **If `doppler` command not found after install**:

```bash
# 1. Restart terminal
# 2. Check PATH
echo $env:PATH | Select-String "Doppler"

# 3. Add to PATH manually
$env:PATH += ";C:\Program Files\Doppler"

# 4. Verify
doppler --version
```

---

## 📊 **What You'll Get**

### **Before Doppler**:
```
Update secret → Edit .env.local → Copy to Vercel → Redeploy
```

### **After Doppler**:
```
Update in Doppler → Auto-syncs everywhere ✅
```

**Benefits**:
- ✅ Single source of truth
- ✅ Auto-sync to Vercel
- ✅ Team collaboration
- ✅ Audit logs
- ✅ Secret rotation
- ✅ No more manual copy/paste

---

## 🎯 **Quick Links**

- **Doppler Download**: https://docs.doppler.com/docs/install-cli#windows
- **Doppler Dashboard**: https://dashboard.doppler.com/
- **Vercel Tokens**: https://vercel.com/account/tokens
- **Documentation**: See `DOPPLER_SETUP_COMPLETE.md`

---

**Install Doppler now and complete the setup in minutes!** 🚀
