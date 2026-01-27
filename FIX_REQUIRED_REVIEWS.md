# Fix: Merging Blocked - 2 Reviews Required

## Current Issue

Your PR to `main` is blocked because the branch protection rules require:
- ✅ **2 approving reviews** from reviewers with write access
- ✅ **Code owner reviews** (if CODEOWNERS file exists)
- ✅ **All 5 status checks** must pass

## Solution Options

### Option 1: Get 2 Reviewers to Approve (Standard Workflow)

If you have collaborators on the repository:

1. **Request reviews** on your PR:
   - Go to your PR on GitHub
   - Click "Reviewers" in the right sidebar
   - Add 2 reviewers who have write access
   - They'll receive notifications to review

2. **Wait for approvals:**
   - Reviewers need to click "Approve" (not just comment)
   - You need 2 separate approvals
   - Once you have 2 approvals + all checks pass, you can merge

### Option 2: Temporarily Adjust Branch Protection (If You're Solo)

If you're the only contributor and need to merge urgently:

**⚠️ WARNING:** Only do this if you understand the security implications!

1. **Go to Branch Protection Settings:**
   - https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
   - Click on `main` branch protection rule

2. **Temporarily reduce required reviews:**
   - Scroll to "Pull request reviews"
   - Change "Required number of approvals" from `2` to `1` (or `0` for emergency)
   - Save changes

3. **Merge your PR**

4. **Restore protection after merging:**
   - Change it back to `2` required reviews
   - This ensures future PRs maintain the security standard

### Option 3: Use Staging Branch (Recommended for Solo Work)

Instead of merging directly to `main`, use the `staging` branch which only requires 1 review:

```powershell
# Create PR to staging instead
git checkout -b fix/token-docs
# ... make your changes ...
git push -u origin fix/token-docs
```

Then:
1. Open PR: `fix/token-docs` → `staging`
2. Staging only requires **1 review** (or you can self-approve if you're admin)
3. After staging is tested, create another PR: `staging` → `main`

### Option 4: Self-Review Workaround (If You're Admin)

If you have admin access and need to merge immediately:

1. **Add yourself as a reviewer** (if allowed)
2. **Approve your own PR** (if branch protection allows)
3. **Add a second reviewer** - you might need to:
   - Create a second GitHub account with write access, OR
   - Temporarily reduce required reviews (Option 2)

### Option 5: Use GitHub CLI to Approve (Advanced)

If you have multiple GitHub accounts or can create a second reviewer:

```powershell
# Install GitHub CLI if needed
winget install --id GitHub.cli

# Authenticate
gh auth login

# Approve the PR (requires PR number)
gh pr review <PR_NUMBER> --approve

# You'll need to do this twice with different accounts
```

## Current Branch Protection Rules

From `branch-protection-rules.json`:

**Main Branch:**
- Required approvals: **2**
- Code owner reviews: **Required**
- Status checks: **5 required** (all must pass)
- Force pushes: **Disabled**
- Deletions: **Disabled**

**Staging Branch:**
- Required approvals: **1** ✅ (Easier!)
- Code owner reviews: **Not required**
- Status checks: **3 required**

**Develop Branch:**
- Required approvals: **1** ✅ (Easier!)
- Code owner reviews: **Not required**
- Status checks: **2 required**

## Recommended Workflow for Solo Developer

1. **Work on feature branch:**
   ```powershell
   git checkout -b fix/token-docs
   # Make changes
   git push -u origin fix/token-docs
   ```

2. **PR to `develop` or `staging` first:**
   - Only needs 1 review (or self-approve)
   - Test in staging environment

3. **PR from `staging` → `main`:**
   - This is where you need 2 reviews
   - Use Option 2 to temporarily reduce if needed

## Quick Fix Commands

**If you need to merge NOW and you're the only contributor:**

```powershell
# 1. Temporarily reduce required reviews via GitHub web UI
# Go to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
# Change main branch: Required approvals: 2 → 1

# 2. Then merge your PR

# 3. Restore protection: Change back to 2
```

## Long-term Solution

For a solo project, consider adjusting branch protection:

1. **Main branch:** Keep 2 reviews (for production safety)
2. **Staging branch:** 1 review (for testing)
3. **Develop branch:** 0-1 reviews (for active development)

Or use a different strategy:
- Require reviews only for `main` branch
- Allow direct pushes to `develop` and `staging`
- Use `main` as a protected release branch

---

**Last Updated**: 2026-01-27
**Status**: Branch protection requires 2 reviews for main branch
