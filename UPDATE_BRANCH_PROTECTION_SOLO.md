# Update Branch Protection Rules for Solo Developer

## ✅ Changes Applied

Branch protection rules have been updated to be more flexible for solo developers:

### Main Branch
- ✅ **Required reviews:** `2` → `0` (no reviews needed)
- ✅ **Code owner reviews:** `Required` → `Disabled`
- ✅ **Enforce admins:** `true` → `false` (admins can bypass)
- ✅ **Signed commits:** `Required` → `Optional`
- ✅ **Linear history:** `Required` → `Optional`
- ✅ **Conversation resolution:** `Required` → `Optional`
- ✅ **Status checks:** Still required (5 checks)
- ✅ **Force pushes:** Still disabled (safety)
- ✅ **Deletions:** Still disabled (safety)

### Staging Branch
- ✅ **Required reviews:** `1` → `0` (no reviews needed)
- ✅ **Status checks strict:** `true` → `false` (can merge with some failures)
- ✅ **Conversation resolution:** `Required` → `Optional`
- ✅ **Status checks:** Still required (3 checks, but not strict)

### Develop Branch
- ✅ **Required reviews:** `1` → `0` (no reviews needed)
- ✅ **Status checks strict:** `true` → `false` (can merge with some failures)
- ✅ **Conversation resolution:** `Required` → `Optional`
- ✅ **Status checks:** Still required (2 checks, but not strict)

## 🚀 Apply the Updated Rules

### Option 1: Using the Script (Recommended)

```powershell
# Test first (dry run)
node scripts/apply-branch-protection-from-json.js --dry-run

# Apply to all branches
node scripts/apply-branch-protection-from-json.js

# Or apply to specific branch
node scripts/apply-branch-protection-from-json.js --branch main
```

### Option 2: Using GitHub CLI

```powershell
# Apply main branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection --method PUT --input branch-protection-rules.json

# Apply staging branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/staging/protection --method PUT --input branch-protection-rules.json

# Apply develop branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/develop/protection --method PUT --input branch-protection-rules.json
```

### Option 3: Using GitHub Web Interface

1. Go to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
2. For each branch (`main`, `staging`, `develop`):
   - Click "Edit" on the branch protection rule
   - Update settings according to the changes above
   - Save changes

## 📋 What This Means

### You Can Now:
- ✅ Merge PRs without waiting for reviews
- ✅ Merge PRs without code owner approval
- ✅ Merge PRs even if some status checks fail (on staging/develop)
- ✅ Skip signed commits requirement
- ✅ Merge without resolving all conversations

### Still Protected:
- ✅ Status checks still run (quality assurance)
- ✅ Force pushes still blocked (prevents accidental history rewrite)
- ✅ Branch deletions still blocked (safety)
- ✅ PRs still required (no direct pushes to main)

## 🔄 Reverting to Team Mode

If you later add team members and want stricter rules:

1. Edit `branch-protection-rules.json`
2. Change:
   - `required_approving_review_count`: `0` → `1` or `2`
   - `require_code_owner_reviews`: `false` → `true`
   - `enforce_admins`: `false` → `true`
   - `require_signed_commits`: `false` → `true`
3. Run the apply script again

## ✅ Next Steps

1. **Apply the rules:**
   ```powershell
   node scripts/apply-branch-protection-from-json.js
   ```

2. **Test by merging your PR:**
   - Your PR should now merge without waiting for reviews
   - Status checks will still run but won't block if set to non-strict

3. **Verify in GitHub:**
   - Go to branch protection settings
   - Confirm the changes are applied

---

**Last Updated**: 2026-01-27
**Status**: Rules updated for solo developer, ready to apply
