# Branch Protection Setup Guide

**Current Branch:** `main` (Production)  
**Repository:** `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`

---

## ✅ Quick Setup Options

### Option 1: GitHub Web Interface (Recommended - No Installation Required)

1. **Go to Branch Settings:**
   - Navigate to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches

2. **Configure Each Branch:**
   - Click **"Add rule"** for each branch (`main`, `staging`, `develop`)
   - Follow the detailed settings in `BRANCH_ENV_PROTECTION_CONFIG.md`

3. **Quick Settings Summary:**

   **Main Branch:**
   - ✅ Require pull request reviews: **2 approvals**
   - ✅ Require status checks: All 5 checks
   - ✅ Require linear history
   - ✅ Include administrators
   - ❌ No force pushes
   - ❌ No deletions

   **Staging Branch:**
   - ✅ Require pull request reviews: **1 approval**
   - ✅ Require status checks: 3 checks
   - ❌ No force pushes

   **Develop Branch:**
   - ✅ Require pull request reviews: **1 approval**
   - ✅ Require status checks: 2 checks
   - ❌ No force pushes

---

### Option 2: GitHub CLI (Automated)

#### Step 1: Install GitHub CLI

**Windows (PowerShell):**
```powershell
winget install --id GitHub.cli
```

**Or download from:** https://cli.github.com/

#### Step 2: Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

#### Step 3: Run Configuration Script

**PowerShell (Windows):**
```powershell
.\scripts\configure-branch-protection.ps1
```

**Bash (Linux/Mac/Git Bash):**
```bash
chmod +x scripts/configure-branch-protection.sh
./scripts/configure-branch-protection.sh
```

**Or configure individual branches:**
```powershell
# Configure only main branch
.\scripts\configure-branch-protection.ps1 -Branch main

# Configure only staging branch
.\scripts\configure-branch-protection.ps1 -Branch staging

# Configure only develop branch
.\scripts\configure-branch-protection.ps1 -Branch develop
```

#### Step 4: Verify Configuration

Visit: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches

You should see protection rules for `main`, `staging`, and `develop` branches.

---

### Option 3: Manual GitHub CLI Commands

If you prefer to run commands manually, use the generated commands:

```bash
# Generate commands
npm run branch:protection:gh

# Then copy and execute each command
```

**Example for main branch:**
```bash
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Web • lint / typecheck / unit tests","API • black / pylint / mypy / pytest","API • integration smoke (uvicorn + /health)","Web • E2E (Playwright)","Security • dependency and secret scanning"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

---

## 📋 Required Status Checks

### Main Branch (5 checks):
1. `Web • lint / typecheck / unit tests`
2. `API • black / pylint / mypy / pytest`
3. `API • integration smoke (uvicorn + /health)`
4. `Web • E2E (Playwright)`
5. `Security • dependency and secret scanning`

### Staging Branch (3 checks):
1. `Web • lint / typecheck / unit tests`
2. `API • black / pylint / mypy / pytest`
3. `Web • E2E (Playwright)`

### Develop Branch (2 checks):
1. `Web • lint / typecheck / unit tests`
2. `API • black / pylint / mypy / pytest`

---

## ✅ Verification Steps

After configuration:

1. **Check Branch Protection:**
   - Visit: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Verify rules exist for `main`, `staging`, and `develop`

2. **Test with a PR:**
   - Create a test branch
   - Open a PR to `main`
   - Verify that:
     - PR requires 2 approvals
     - Status checks must pass
     - Force push is blocked

3. **Verify Environment Variables:**
   ```bash
   # Check current branch
   git branch --show-current
   
   # Verify environment (should be production for main)
   npm run env:check
   ```

---

## 🔧 Troubleshooting

### GitHub CLI Not Found

**Windows:**
```powershell
# Install via winget
winget install --id GitHub.cli

# Or download installer from https://cli.github.com/
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Mac:**
```bash
brew install gh
```

### Authentication Issues

```bash
# Check auth status
gh auth status

# Re-authenticate
gh auth login

# Use token instead
gh auth login --with-token < token.txt
```

### Permission Errors

If you get permission errors:
- Ensure you have admin access to the repository
- Check that you're authenticated with the correct GitHub account
- Verify repository ownership: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`

### Status Checks Not Appearing

If status checks don't appear in the dropdown:
1. Make sure CI workflows have run at least once
2. Push a commit or create a PR to trigger workflows
3. Wait for workflows to complete
4. Refresh the branch protection settings page

---

## 📚 Related Documentation

- **BRANCH_ENV_PROTECTION_CONFIG.md** - Complete configuration details
- **CONFIGURATION_SUMMARY.md** - Quick reference guide
- **GITHUB_BRANCH_PROTECTION_GUIDE.md** - General branch protection concepts

---

## 🎯 Next Steps

1. ✅ **Configure Branch Protection** (choose one method above)
2. ✅ **Verify Environment Variables** for production:
   ```bash
   npm run env:check
   npm run env:sync:prod  # If using Doppler
   ```
3. ✅ **Test Protection Rules** with a sample PR
4. ✅ **Document Any Exceptions** or custom requirements

---

**Ready to configure? Start with Option 1 (Web Interface) for the easiest setup!**
