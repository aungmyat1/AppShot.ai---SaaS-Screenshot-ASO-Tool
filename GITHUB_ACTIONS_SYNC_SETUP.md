# 🔄 GitHub Actions: Doppler → Vercel Auto-Sync Setup

**What This Does**: Automatically syncs all secrets from Doppler to Vercel whenever you push to `main` branch.

---

## ✅ **What's Been Created**

**Workflow File**: `.github/workflows/sync-doppler-vercel.yml`

**Features**:
- ✅ Syncs on every push to `main`
- ✅ Can trigger manually
- ✅ Weekly automatic sync (Sundays)
- ✅ Syncs to all environments (Development, Preview, Production)
- ✅ Filters out Doppler internal variables
- ✅ Cleans up sensitive files after sync

---

## 🚀 **Setup Steps (3 Required Secrets)**

You need to add 3 secrets to your GitHub repository:

### **1. DOPPLER_SERVICE_TOKEN**

**Get from Doppler**:

```bash
# Method 1: Via Doppler Dashboard
1. Go to: https://dashboard.doppler.com/
2. Navigate: getappshots → getappshots → dev
3. Click "Access" (left sidebar)
4. Click "Generate Service Token"
5. Name: "GitHub Actions Sync"
6. Copy the token (starts with `dp.st.`)
```

**Or via CLI**:
```bash
# Create service token
doppler configs tokens create github-actions --config dev --project getappshots
```

### **2. VERCEL_TOKEN**

**Get from Vercel**:

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `GitHub Actions Doppler Sync`
4. Scope: Select your team/account
5. Expiration: No expiration (or choose duration)
6. Click **"Create"**
7. Copy the token (starts with `vercel_...`)

### **3. VERCEL_PROJECT_ID** (and optionally VERCEL_ORG_ID)

**Get Project ID**:

```bash
# Method 1: From Vercel CLI
vercel login
vercel link
# Then check: .vercel/project.json

# Method 2: From Vercel Dashboard
# Go to: Project → Settings → General → Project ID
```

**Get Org ID** (if using team):
```bash
# From Vercel Dashboard
# Settings → Team Settings → Team ID
```

---

## 📝 **Add Secrets to GitHub**

### **Step-by-Step**:

1. **Go to GitHub Repository**:
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Add Each Secret**:

   **Secret 1**:
   - Name: `DOPPLER_SERVICE_TOKEN`
   - Value: `dp.st.xxxxxxxxxxxx` (from Doppler)
   - Click "Add secret"

   **Secret 2**:
   - Name: `VERCEL_TOKEN`
   - Value: `vercel_xxxxxxxxxxxxxxxx` (from Vercel)
   - Click "Add secret"

   **Secret 3**:
   - Name: `VERCEL_PROJECT_ID`
   - Value: `prj_xxxxxxxxxx` (from Vercel)
   - Click "Add secret"

   **Secret 4** (Optional, if using team):
   - Name: `VERCEL_ORG_ID`
   - Value: `team_xxxxxxxxxx` (from Vercel)
   - Click "Add secret"

---

## 🎯 **How It Works**

### **Automatic Triggers**:

1. **On Push to Main**:
   ```bash
   git add .
   git commit -m "Update secrets"
   git push origin main
   # → Workflow runs automatically ✅
   ```

2. **Manual Trigger**:
   - Go to: Repository → Actions → "Sync Doppler to Vercel"
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow"

3. **Weekly Schedule**:
   - Runs every Sunday at midnight (UTC)
   - Keeps Vercel in sync with Doppler

### **What Happens**:

```
1. Checkout code
2. Install Doppler CLI
3. Fetch all 48 secrets from Doppler
4. Install Vercel CLI
5. Sync secrets to Vercel Development
6. Sync secrets to Vercel Preview
7. Sync secrets to Vercel Production
8. Clean up temporary files
9. Done! ✅
```

---

## ✅ **Verification**

### **Check Workflow Status**:

1. **Go to GitHub Actions**:
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/actions
   ```

2. **Check Latest Run**:
   - Should see "Sync Doppler to Vercel"
   - Status: ✅ Success (green checkmark)
   - Duration: ~2-3 minutes

3. **View Logs**:
   - Click on the workflow run
   - Expand each step to see logs
   - Verify secrets were added

### **Check Vercel**:

```bash
# Login to Vercel
vercel login

# List environment variables
vercel env ls

# Should show all 48 secrets in all environments
```

**Or via Vercel Dashboard**:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Verify all secrets are present

---

## 🔄 **Daily Workflow**

### **Update a Secret**:

1. **Update in Doppler** (Dashboard or CLI):
   ```bash
   # Via CLI
   doppler secrets set ADMIN_EMAILS="newemail@getappshots.com"
   
   # Via Dashboard
   # https://dashboard.doppler.com/ → Edit secret
   ```

2. **Trigger Sync**:
   
   **Option A: Push to main**:
   ```bash
   git add .
   git commit -m "Trigger secrets sync"
   git push origin main
   # → Workflow runs automatically
   ```
   
   **Option B: Manual trigger**:
   - Go to GitHub Actions
   - Click "Run workflow"
   - Done! ✅

3. **Verify**:
   ```bash
   vercel env ls
   # → Should show updated value
   ```

---

## 📊 **Workflow Features**

### **Security**:
- ✅ Secrets stored in GitHub Secrets (encrypted)
- ✅ Doppler token scoped to specific config
- ✅ Vercel token can be scoped to project
- ✅ Temporary files cleaned up after sync
- ✅ No secrets exposed in logs

### **Reliability**:
- ✅ Runs on latest Ubuntu
- ✅ Uses official GitHub Actions
- ✅ Error handling for failed syncs
- ✅ Continues on individual failures

### **Flexibility**:
- ✅ Manual triggering available
- ✅ Scheduled weekly sync
- ✅ Syncs to all environments
- ✅ Easy to customize

---

## 🔧 **Customization**

### **Change Sync Schedule**:

Edit `.github/workflows/sync-doppler-vercel.yml`:

```yaml
schedule:
  - cron: '0 0 * * 0'  # Every Sunday at midnight
  # Examples:
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * *'    # Daily at midnight
  # - cron: '0 0 * * 1'    # Every Monday
```

### **Sync Only Specific Environment**:

Remove or comment out unwanted steps:

```yaml
# Comment out Preview sync:
# - name: Sync secrets to Vercel Preview
#   ...
```

### **Exclude Specific Secrets**:

Modify the jq filter:

```yaml
cat doppler_secrets.json | jq -r 'to_entries[] | 
  select(.key | startswith("DOPPLER_") | not) | 
  select(.key | startswith("INTERNAL_") | not) |  # Exclude INTERNAL_*
  "\(.key)=\(.value)"'
```

---

## 📋 **Complete Setup Checklist**

**Doppler Setup**:
- [x] Doppler configured with 48 secrets ✅
- [x] Project: getappshots ✅
- [x] Config: dev ✅
- [ ] Service token created

**Vercel Setup**:
- [ ] Vercel account active
- [ ] Project deployed
- [ ] API token created
- [ ] Project ID obtained

**GitHub Setup**:
- [ ] Repository exists
- [ ] Workflow file committed
- [ ] DOPPLER_SERVICE_TOKEN secret added
- [ ] VERCEL_TOKEN secret added
- [ ] VERCEL_PROJECT_ID secret added
- [ ] VERCEL_ORG_ID secret added (if using team)

**Testing**:
- [ ] Manual workflow run successful
- [ ] Secrets visible in Vercel
- [ ] All 48 secrets synced
- [ ] Automatic trigger tested

---

## 🎯 **Quick Start Commands**

### **1. Create Doppler Service Token**:

```bash
# Via Doppler Dashboard (easier):
# https://dashboard.doppler.com/ → getappshots → dev → Access → Generate Service Token
```

### **2. Get Vercel Credentials**:

```bash
# Get token: https://vercel.com/account/tokens

# Get Project ID:
vercel login
vercel link
cat .vercel/project.json
```

### **3. Add to GitHub**:

```bash
# Go to:
# https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

# Add:
# - DOPPLER_SERVICE_TOKEN
# - VERCEL_TOKEN
# - VERCEL_PROJECT_ID
# - VERCEL_ORG_ID (optional)
```

### **4. Commit Workflow**:

```bash
git add .github/workflows/sync-doppler-vercel.yml
git commit -m "Add Doppler → Vercel sync workflow"
git push origin main
```

### **5. Test**:

```bash
# Go to GitHub Actions and check the run
# Or trigger manually: Actions → Sync Doppler to Vercel → Run workflow
```

---

## 🆚 **Comparison: GitHub Actions vs Doppler Dashboard**

| Feature | GitHub Actions | Doppler Dashboard |
|---------|----------------|-------------------|
| **Setup Complexity** | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Easy |
| **Requires** | 3 tokens, workflow file | Just browser |
| **Automation** | ✅ On push/schedule | ✅ Real-time |
| **Control** | ✅ Full control | Limited |
| **Visibility** | ✅ GitHub Actions logs | Doppler logs |
| **Maintenance** | Tokens may expire | None |
| **Best For** | Developers who want control | Quick setup |

### **Recommendation**:

- **Use GitHub Actions** if:
  - You want full control over sync process
  - You already use GitHub Actions
  - You want to customize sync logic
  - You prefer infrastructure as code

- **Use Doppler Dashboard** if:
  - You want fastest setup (5 minutes)
  - You prefer no-code solution
  - You want real-time sync
  - You want zero maintenance

---

## 🎉 **Next Steps**

**To Complete Setup**:

1. **Create Doppler Service Token**:
   - Go to: https://dashboard.doppler.com/
   - Navigate: getappshots → dev → Access
   - Generate token

2. **Create Vercel Token**:
   - Go to: https://vercel.com/account/tokens
   - Create new token

3. **Add to GitHub Secrets**:
   - Go to your repo settings
   - Add the 3 required secrets

4. **Test the Workflow**:
   - Push to main or trigger manually
   - Check GitHub Actions for results

5. **Verify in Vercel**:
   - Check environment variables
   - Confirm all 48 secrets are present

---

**Your workflow is ready to use!** Just add the secrets and push to `main`! 🚀
