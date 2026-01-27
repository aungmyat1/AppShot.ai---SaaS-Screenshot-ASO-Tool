# Secret Exposure Fix Guide

## ⚠️ Critical Security Issue

A GitHub Personal Access Token was exposed in the `GITHUB_TOKEN_SETUP.md` file and committed to git history.

## Immediate Actions Required

### 1. Revoke the Exposed Token

**URGENT:** The exposed token must be revoked immediately. Go to GitHub settings to revoke any tokens that were exposed.

1. Go to: https://github.com/settings/tokens
2. Find the token (look for one created around the time of the commit)
3. Click "Revoke" to invalidate it

### 2. Create a New Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a descriptive name (e.g., "Branch Protection Scripts")
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (if needed for branch protection)
4. Click "Generate token"
5. **Copy the token immediately** (you won't see it again)

### 3. Update Local Environment

```powershell
# Set in current session
$env:GITHUB_TOKEN="your_new_token_here"

# Or add to PowerShell profile (persistent)
Add-Content -Path $PROFILE -Value "`$env:GITHUB_TOKEN = 'your_new_token_here'"
. $PROFILE
```

### 4. Update Doppler (if using)

```bash
doppler secrets set GITHUB_TOKEN="your_new_token_here" --config prd
```

## What Was Fixed

✅ Removed the actual token from `GITHUB_TOKEN_SETUP.md`
✅ Replaced with placeholder `your_token_here`
✅ Created a new commit to fix the exposure

## Important Notes

- ⚠️ **The token is still in git history** - even though it's removed from the current commit, it exists in previous commits
- ⚠️ **If the repository is public**, consider making it private or using GitHub's secret scanning unblock feature
- ✅ **The current commit is safe** - no secrets are exposed in the latest version

## Pushing to GitHub

After revoking the old token and creating a new one:

```powershell
# The fix commit should push successfully now
git push origin main
```

If you still get blocked:
1. Visit the unblock URL provided by GitHub in the error message
2. Or wait a few minutes for GitHub's secret scanning to update

## Prevention

To prevent this in the future:

1. ✅ Never commit actual tokens/secrets to git
2. ✅ Use environment variables or secret management (Doppler, etc.)
3. ✅ Use `.gitignore` for files containing secrets
4. ✅ Use placeholder values in documentation (e.g., `your_token_here`)
5. ✅ Review commits before pushing (especially documentation files)

## Verification

After setting the new token, verify it works:

```powershell
# Test the token
npm run branch:protection:apply:dry
```

If you see "✅ Authentication method: GITHUB_TOKEN", the new token is working correctly.
