# Quick Start: Branch Protection Setup

**Current Status:** ✅ Scripts ready, JSON file created

---

## 🚀 Two Ways to Apply Branch Protection

### Method 1: Using GitHub CLI (Recommended if you have it)

```powershell
# Install GitHub CLI (if not installed)
winget install --id GitHub.cli

# Authenticate
gh auth login

# Preview changes (dry-run)
npm run branch:protection:apply:dry

# Apply all rules
npm run branch:protection:apply
```

### Method 2: Using GitHub Token (No CLI Required) ⭐

```powershell
# Setup token (one-time)
.\scripts\setup-github-token.ps1

# Or manually set token
$env:GITHUB_TOKEN="your_token_here"

# Preview changes (dry-run)
npm run branch:protection:apply:dry

# Apply all rules
npm run branch:protection:apply
```

**Get Token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: **repo** (Full control of private repositories)
4. Copy the token

---

## ✅ What Was Created

1. **`branch-protection-rules.json`** - Complete JSON configuration
   - Rules for `main`, `staging`, and `develop` branches
   - Ready to upload/apply

2. **`scripts/apply-branch-protection-from-json.js`** - Application script
   - Works with GitHub CLI or token
   - Supports dry-run mode
   - Applies all branches or specific branch

3. **`scripts/setup-github-token.ps1`** - Token setup helper
   - Interactive token setup
   - Optional: Add to PowerShell profile

---

## 📋 Current Configuration Preview

The script shows what will be applied:

- **Main Branch:** 2 approvals, 5 status checks, strict protection
- **Staging Branch:** 1 approval, 3 status checks
- **Develop Branch:** 1 approval, 2 status checks

---

## 🎯 Next Steps

1. **Preview (No authentication needed):**
   ```powershell
   npm run branch:protection:apply:dry
   ```

2. **Choose authentication method:**
   - Option A: Install GitHub CLI and authenticate
   - Option B: Set GITHUB_TOKEN environment variable

3. **Apply rules:**
   ```powershell
   npm run branch:protection:apply
   ```

4. **Verify:**
   - Visit: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Check that protection rules are active

---

## 📚 Full Documentation

- **BRANCH_PROTECTION_JSON_GUIDE.md** - Complete JSON usage guide
- **BRANCH_PROTECTION_SETUP.md** - Detailed setup instructions
- **BRANCH_ENV_PROTECTION_CONFIG.md** - Configuration reference

---

**Ready? Start with: `npm run branch:protection:apply:dry`**
