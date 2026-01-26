# Branch Protection JSON Configuration Guide

This guide explains how to use the `branch-protection-rules.json` file to configure branch protection rules on GitHub.

---

## 📁 File Overview

**File:** `branch-protection-rules.json`

This JSON file contains all branch protection rules for:
- `main` (Production)
- `staging` (Staging)
- `develop` (Development)

---

## 🚀 Quick Start

### Option 1: Apply from JSON (Automated) ⭐ Recommended

**Prerequisites:**
- GitHub CLI installed and authenticated, OR
- GITHUB_TOKEN environment variable set

**Setup GitHub Token (if not using CLI):**
```powershell
# Windows PowerShell - Quick setup
$env:GITHUB_TOKEN="your_token_here"

# Or use the setup script
.\scripts\setup-github-token.ps1

# To make it persistent (adds to PowerShell profile)
# Run the setup script and choose 'y' when asked
```

```bash
# Linux/Mac
export GITHUB_TOKEN="your_token_here"

# To make it persistent, add to ~/.bashrc or ~/.zshrc:
# echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
```

**⚠️ Security Note:**
- Never commit the token to git
- The token is already set in your current session
- For persistence, use the setup script or add to your shell profile

**⚠️ Token Permissions Required:**
- **Classic Token:** `repo` scope (Full control of private repositories)
- **Fine-grained Token:** `Administration` permission (read and write)
- **Repository Access:** You must have **admin access** to the repository
- If you get a 403 error, verify your token scopes and repository permissions

**Apply Rules:**
```bash
# Dry run (preview changes)
npm run branch:protection:apply:dry

# Apply all rules
npm run branch:protection:apply

# Apply for specific branch
node scripts/apply-branch-protection-from-json.js --branch=main
```

### Option 2: GitHub CLI (Manual)

```bash
# For main branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection \
  --method PUT \
  --input branch-protection-rules.json

# For staging branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/staging/protection \
  --method PUT \
  --input branch-protection-rules.json

# For develop branch
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/develop/protection \
  --method PUT \
  --input branch-protection-rules.json
```

### Option 3: GitHub REST API (Programmatic)

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Apply main branch protection
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection \
  -d @branch-protection-rules.json
```

---

## 📋 JSON Structure

The JSON file contains:

```json
{
  "repository": {
    "owner": "aungmyat1",
    "name": "AppShot.ai---SaaS-Screenshot-ASO-Tool"
  },
  "branch_protection_rules": {
    "main": { ... },
    "staging": { ... },
    "develop": { ... }
  },
  "status_checks_reference": { ... },
  "usage_instructions": { ... }
}
```

### Branch Protection Rule Structure

Each branch rule includes:

- **required_status_checks**: CI/CD checks that must pass
- **enforce_admins**: Apply rules to administrators
- **required_pull_request_reviews**: PR review requirements
- **required_linear_history**: Require linear git history
- **allow_force_pushes**: Allow force pushes (usually false)
- **allow_deletions**: Allow branch deletion (usually false)
- **required_conversation_resolution**: Require PR conversations resolved
- **require_signed_commits**: Require signed commits (main branch only)

---

## 🔧 Usage Examples

### Apply All Rules

```bash
npm run branch:protection:apply
```

### Apply Single Branch

```bash
node scripts/apply-branch-protection-from-json.js --branch=main
```

### Preview Changes (Dry Run)

```bash
npm run branch:protection:apply:dry
```

### Using GitHub CLI Directly

```bash
# Read and apply main branch rule
cat branch-protection-rules.json | jq '.branch_protection_rules.main' | \
  gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection \
  --method PUT --input -
```

---

## ✅ Verification

After applying rules:

1. **Check via Web Interface:**
   - Visit: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Verify rules are active

2. **Check via GitHub CLI:**
   ```bash
   gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection
   ```

3. **Test with PR:**
   - Create a test branch
   - Open PR to `main`
   - Verify protection rules are enforced

---

## 🔄 Updating Rules

### Edit JSON File

1. Open `branch-protection-rules.json`
2. Modify the desired branch rule
3. Save the file
4. Apply changes:
   ```bash
   npm run branch:protection:apply
   ```

### Example: Change Required Approvals

```json
{
  "branch_protection_rules": {
    "main": {
      "required_pull_request_reviews": {
        "required_approving_review_count": 3  // Changed from 2 to 3
      }
    }
  }
}
```

Then apply:
```bash
npm run branch:protection:apply --branch=main
```

---

## 📊 Status Checks Reference

The JSON includes a reference of all status checks:

| Status Check | Workflow | Job | Used In |
|-------------|----------|-----|---------|
| `Web • lint / typecheck / unit tests` | CI | web_lint_type_test | main, staging, develop |
| `API • black / pylint / mypy / pytest` | CI | api_lint_type_test | main, staging, develop |
| `API • integration smoke (uvicorn + /health)` | CI | api_integration_smoke | main, staging |
| `Web • E2E (Playwright)` | CI | web_e2e | main, staging |
| `Security • dependency and secret scanning` | CI | security_scan | main |

---

## 🛠️ Troubleshooting

### GitHub CLI Not Found

```bash
# Install GitHub CLI
# Windows:
winget install --id GitHub.cli

# Mac:
brew install gh

# Linux:
# See https://cli.github.com/
```

### Authentication Issues

```bash
# Check auth status
gh auth status

# Re-authenticate
gh auth login
```

### Permission Errors

- Ensure you have admin access to the repository
- Verify you're authenticated with the correct GitHub account
- Check repository ownership: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`

### JSON Validation Errors

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('branch-protection-rules.json', 'utf-8'))"
```

### Status Checks Not Found

If status checks don't appear:
1. Ensure CI workflows have run at least once
2. Push a commit or create a PR to trigger workflows
3. Wait for workflows to complete
4. Refresh branch protection settings

---

## 📚 Related Documentation

- **BRANCH_PROTECTION_SETUP.md** - Step-by-step setup guide
- **BRANCH_ENV_PROTECTION_CONFIG.md** - Complete configuration details
- **CONFIGURATION_SUMMARY.md** - Quick reference guide
- **GITHUB_BRANCH_PROTECTION_GUIDE.md** - General concepts

---

## 🔗 GitHub API Reference

- **Branch Protection API:** https://docs.github.com/en/rest/branches/branch-protection
- **GitHub CLI:** https://cli.github.com/manual/
- **Repository:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool

---

## 💡 Best Practices

1. **Always use dry-run first:**
   ```bash
   npm run branch:protection:apply:dry
   ```

2. **Version control the JSON file:**
   - Commit `branch-protection-rules.json` to git
   - Track changes over time
   - Use as documentation

3. **Test with a sample PR:**
   - After applying rules, test with a real PR
   - Verify all requirements are enforced

4. **Regular reviews:**
   - Review branch protection rules quarterly
   - Update as team and project evolve
   - Document any exceptions

---

**Ready to apply? Start with a dry run: `npm run branch:protection:apply:dry`**
