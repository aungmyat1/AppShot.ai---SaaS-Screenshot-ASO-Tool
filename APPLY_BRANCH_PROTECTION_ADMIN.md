# Apply Branch Protection Rules with Admin Rights

## Current Status

✅ Branch protection rules are already updated in `branch-protection-rules.json` for solo developer mode:
- **Main:** 0 reviews required
- **Staging:** 0 reviews required  
- **Develop:** 0 reviews required

Now you need to apply these rules to GitHub.

## Option 1: GitHub Web Interface (Easiest - No CLI Needed)

This is the most reliable method if CLI authentication is failing:

### Step 1: Go to Branch Protection Settings

1. **Open:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches

### Step 2: Update Main Branch

1. Click **"Add rule"** or edit existing `main` branch rule
2. **Branch name pattern:** `main`
3. **Settings to configure:**
   - ✅ **Require pull request reviews before merging:** ❌ **UNCHECK** (or set to 0)
   - ✅ **Require code owner reviews:** ❌ **UNCHECK**
   - ✅ **Dismiss stale pull request approvals:** ❌ **UNCHECK**
   - ✅ **Require status checks to pass:** ✅ **CHECK**
     - ✅ **Require branches to be up to date before merging:** ✅ **CHECK**
     - Add these status checks:
       - `Web • lint / typecheck / unit tests`
       - `API • black / pylint / mypy / pytest`
       - `API • integration smoke (uvicorn + /health)`
       - `Web • E2E (Playwright)`
       - `Security • dependency and secret scanning`
   - ✅ **Require conversation resolution before merging:** ❌ **UNCHECK**
   - ✅ **Require signed commits:** ❌ **UNCHECK**
   - ✅ **Require linear history:** ❌ **UNCHECK**
   - ✅ **Include administrators:** ❌ **UNCHECK**
   - ✅ **Restrict pushes that create files:** ❌ **UNCHECK**
   - ✅ **Allow force pushes:** ❌ **UNCHECK**
   - ✅ **Allow deletions:** ❌ **UNCHECK**
4. Click **"Create"** or **"Save changes"**

### Step 3: Update Staging Branch

1. Click **"Add rule"** or edit existing `staging` branch rule
2. **Branch name pattern:** `staging`
3. **Settings:**
   - ✅ **Require pull request reviews:** ❌ **UNCHECK**
   - ✅ **Require status checks:** ✅ **CHECK** (but not strict)
     - Add: `Web • lint / typecheck / unit tests`, `API • black / pylint / mypy / pytest`, `Web • E2E (Playwright)`
   - ✅ **Require conversation resolution:** ❌ **UNCHECK**
   - ✅ **Include administrators:** ❌ **UNCHECK**
4. Click **"Create"** or **"Save changes"**

### Step 4: Update Develop Branch

1. Click **"Add rule"** or edit existing `develop` branch rule
2. **Branch name pattern:** `develop`
3. **Settings:**
   - ✅ **Require pull request reviews:** ❌ **UNCHECK**
   - ✅ **Require status checks:** ✅ **CHECK** (but not strict)
     - Add: `Web • lint / typecheck / unit tests`, `API • black / pylint / mypy / pytest`
   - ✅ **Require conversation resolution:** ❌ **UNCHECK**
   - ✅ **Include administrators:** ❌ **UNCHECK**
4. Click **"Create"** or **"Save changes"**

## Option 2: Use GitHub CLI (If Authentication Works)

### Step 1: Authenticate with GitHub CLI

```powershell
# Clear any existing token
$env:GITHUB_TOKEN = $null

# Login with GitHub CLI
gh auth login

# Follow prompts:
# 1. GitHub.com
# 2. HTTPS
# 3. Login with a web browser
# 4. Complete in browser
```

### Step 2: Apply Rules Using Script

```powershell
# Test first (dry run)
node scripts/apply-branch-protection-from-json.js --dry-run

# Apply to all branches
node scripts/apply-branch-protection-from-json.js
```

### Step 3: Or Apply Manually with CLI

```powershell
# Apply main branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection --method PUT --input branch-protection-rules.json

# Apply staging branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/staging/protection --method PUT --input branch-protection-rules.json

# Apply develop branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/develop/protection --method PUT --input branch-protection-rules.json
```

## Option 3: Use Valid Token (If You Have One)

If you have a valid token with `repo` scope:

```powershell
# Set token (use quotes!)
$env:GITHUB_TOKEN='your_valid_token_here'

# Verify
gh auth status

# Apply rules
node scripts/apply-branch-protection-from-json.js
```

## Quick Summary: What to Change

For each branch (`main`, `staging`, `develop`):

### Main Branch:
- ❌ Uncheck "Require pull request reviews"
- ✅ Keep status checks (5 checks)
- ❌ Uncheck "Require conversation resolution"
- ❌ Uncheck "Require signed commits"
- ❌ Uncheck "Include administrators"

### Staging Branch:
- ❌ Uncheck "Require pull request reviews"
- ✅ Keep status checks (3 checks, not strict)
- ❌ Uncheck "Require conversation resolution"

### Develop Branch:
- ❌ Uncheck "Require pull request reviews"
- ✅ Keep status checks (2 checks, not strict)
- ❌ Uncheck "Require conversation resolution"

## Verify Changes Applied

After applying:

1. **Go to:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
2. **Check each branch:**
   - Click on branch name
   - Verify settings match what you configured
   - Should show "0" required reviews

## Test the Changes

Create a test PR to verify:

```powershell
# Create test branch
git checkout -b test/branch-protection
git commit --allow-empty -m "test: verify branch protection"
git push -u origin test/branch-protection
```

Then:
1. Create PR: `test/branch-protection` → `main`
2. Should be able to merge without reviews
3. Status checks should still run

## Recommended: Use Web Interface

**For fastest results, use Option 1 (Web Interface):**
- No authentication issues
- Visual confirmation
- Immediate effect
- Takes ~5 minutes for all 3 branches

---

**Last Updated**: 2026-01-27
**Status**: Ready to apply - use web interface for easiest method
