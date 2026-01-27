# Merge Directly to Main with Admin Rights

## Quick Steps to Merge with Admin Access

### Step 1: Temporarily Disable Review Requirement

1. **Go to Branch Protection Settings:**
   - https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Click on the `main` branch protection rule

2. **Disable Required Reviews:**
   - Scroll down to "Pull request reviews"
   - **Uncheck** "Require pull request reviews before merging"
   - OR change "Required number of approvals" to `0`
   - Click "Save changes"

### Step 2: Merge Your PR

1. **Go to your Pull Request:**
   - https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/pulls
   - Find your PR (e.g., `fix/token-docs` → `main`)

2. **Merge the PR:**
   - Click "Merge pull request"
   - Choose merge type (usually "Create a merge commit")
   - Confirm merge

### Step 3: Restore Branch Protection

**⚠️ IMPORTANT:** Restore protection immediately after merging!

1. **Go back to Branch Protection:**
   - https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Click on `main` branch

2. **Re-enable Required Reviews:**
   - Check "Require pull request reviews before merging"
   - Set "Required number of approvals" back to `2`
   - Save changes

## Alternative: Use Admin Bypass (If Configured)

If your branch protection has "Allow specified actors to bypass required pull requests" enabled:

1. **Check if bypass is enabled:**
   - Go to branch protection settings
   - Look for "Restrict who can push to matching branches"
   - Check if your account is in the bypass list

2. **If bypass is enabled:**
   - You can merge directly without changing settings
   - Just go to your PR and click "Merge pull request"

## Using GitHub CLI (Alternative Method)

If you prefer command line:

```powershell
# Install GitHub CLI if needed
winget install --id GitHub.cli

# Authenticate
gh auth login

# List your PRs
gh pr list

# Merge a PR (replace <PR_NUMBER> with actual number)
gh pr merge <PR_NUMBER> --admin --merge

# Or if you need to approve first (as admin)
gh pr review <PR_NUMBER> --approve
gh pr merge <PR_NUMBER> --merge
```

## Direct Push (If Force Push is Allowed)

**⚠️ WARNING:** This is usually disabled for `main` branch. Only use if you're absolutely sure!

```powershell
# Check current branch
git branch

# If you're on fix/token-docs and want to merge to main
git checkout main
git merge fix/token-docs
git push origin main
```

**Note:** This will likely fail because:
- Force pushes are disabled (`"allow_force_pushes": false`)
- Direct pushes to main are blocked

## Recommended: Quick Admin Workflow

**Fastest method:**

1. **Temporarily disable reviews** (30 seconds)
   - Settings → Branches → Main → Uncheck "Require reviews"
   - Save

2. **Merge PR** (10 seconds)
   - Go to PR → Click "Merge pull request"

3. **Restore protection** (30 seconds)
   - Settings → Branches → Main → Check "Require reviews" → Set to 2
   - Save

**Total time: ~1 minute**

## Security Note

Even with admin rights, it's good practice to:
- ✅ Restore protection immediately after merging
- ✅ Consider using `staging` branch for less critical changes
- ✅ Keep 2-review requirement for production safety

---

**Last Updated**: 2026-01-27
**Status**: Admin merge instructions
