# Branch Protection Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: 403 Forbidden - "Resource not accessible by personal access token"

**Symptoms:**
```
❌ Error configuring protection for main
   Status: 403
   Message: Resource not accessible by personal access token
```

**Causes:**
1. Token doesn't have required scopes/permissions
2. You don't have admin access to the repository
3. Token is expired or invalid
4. Using fine-grained token without proper repository permissions

**Solutions:**

#### 1. Check Token Scopes

**For Classic Personal Access Tokens:**
- Go to: https://github.com/settings/tokens
- Find your token or create a new one
- Ensure it has: **`repo`** scope (Full control of private repositories)
- Click "Generate new token (classic)" if needed
- Select scopes: ✅ **repo** (all sub-scopes)

**For Fine-Grained Personal Access Tokens:**
- Go to: https://github.com/settings/tokens?type=beta
- Create or edit your token
- Under "Repository access", select the repository: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`
- Under "Repository permissions", set:
  - **Administration**: Read and write
- Save the token

#### 2. Verify Repository Access

You must have **admin access** to the repository to configure branch protection.

**Check your access:**
1. Go to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/access
2. Verify you have "Admin" role
3. If not, ask the repository owner to grant you admin access

#### 3. Regenerate Token

If the token is expired or invalid:
1. Go to: https://github.com/settings/tokens
2. Delete the old token
3. Create a new token with proper scopes
4. Update your environment variable:
   ```powershell
   $env:GITHUB_TOKEN="new_token_here"
   ```

#### 4. Use GitHub CLI Instead ⭐ Recommended

GitHub CLI often handles authentication better and is more reliable than tokens:

**Quick Setup:**
```powershell
# Option 1: Use the setup script (easiest)
.\scripts\setup-github-cli.ps1

# Option 2: Manual installation
winget install --id GitHub.cli

# After installation, restart terminal, then:
gh auth login

# Then run the script - it will use CLI authentication automatically
npm run branch:protection:apply
```

**Why GitHub CLI is better:**
- ✅ Handles authentication automatically
- ✅ Better error messages
- ✅ No need to manage tokens manually
- ✅ More secure (no token in environment variables)
- ✅ Works with GitHub's native authentication

---

### ❌ Error: 401 Unauthorized

**Symptoms:**
```
❌ Error configuring protection for main
   Status: 401
   Message: Bad credentials
```

**Solutions:**
1. Token is invalid or expired - regenerate it
2. Token was revoked - create a new one
3. Check token is set correctly: `echo $env:GITHUB_TOKEN`

---

### ❌ Error: No authentication method available

**Symptoms:**
```
❌ No authentication method available.
```

**Solutions:**

#### Option 1: Set GITHUB_TOKEN
```powershell
# Windows PowerShell
$env:GITHUB_TOKEN="your_token_here"

# Then run
npm run branch:protection:apply
```

#### Option 2: Install and Authenticate GitHub CLI
```powershell
# Install
winget install --id GitHub.cli

# After installation, if 'gh' is not recognized, use one of these:

# Option A: Use the wrapper script (easiest)
.\scripts\gh-wrapper.ps1 auth login

# Option B: Use full path directly
& "C:\Program Files\GitHub CLI\gh.exe" auth login

# Option C: Restart terminal, then:
gh auth login

# Verify
gh auth status
# Or: .\scripts\gh-wrapper.ps1 auth status

# Then run
npm run branch:protection:apply
```

---

### ❌ Error: Status checks not found

**Symptoms:**
- Branch protection applies but status checks don't appear
- Error about missing status check contexts

**Solutions:**
1. **Trigger CI workflows first:**
   - Push a commit or create a PR
   - Wait for workflows to complete
   - Status checks will appear after first run

2. **Verify workflow files exist:**
   - Check `.github/workflows/ci.yml` exists
   - Ensure workflow jobs match the status check names in JSON

3. **Wait and retry:**
   - Status checks may take a few minutes to appear
   - Refresh the branch protection settings page

---

## Verification Steps

After applying branch protection, verify it worked:

### 1. Check via Web Interface
- Visit: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
- Look for your branch (main, staging, develop)
- Verify protection rules are active

### 2. Check via GitHub CLI
```bash
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection
```

### 3. Test with a PR
- Create a test branch
- Open PR to `main`
- Verify protection rules are enforced:
  - PR requires approvals
  - Status checks must pass
  - Cannot force push
  - Cannot delete branch

---

## Quick Fix Checklist

If branch protection isn't working:

- [ ] Token has `repo` scope (classic) or `Administration` permission (fine-grained)
- [ ] You have admin access to the repository
- [ ] Token is set: `echo $env:GITHUB_TOKEN`
- [ ] Token is not expired
- [ ] Repository name is correct: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`
- [ ] Branch name exists (main, staging, or develop)
- [ ] CI workflows have run at least once (for status checks)

---

## Still Having Issues?

1. **Try dry-run first:**
   ```bash
   npm run branch:protection:apply:dry
   ```

2. **Check script logs:**
   - Look for specific error messages
   - Note the status code (401, 403, 404, etc.)

3. **Test token manually:**
   ```powershell
   # Test token works
   $headers = @{Authorization = "token $env:GITHUB_TOKEN"}
   Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
   ```

4. **Use GitHub CLI:**
   - Often more reliable than tokens
   - Better error messages
   - Handles authentication automatically

---

## Related Documentation

- **BRANCH_PROTECTION_JSON_GUIDE.md** - How to use the JSON configuration
- **BRANCH_ENV_PROTECTION_CONFIG.md** - Complete configuration details
- **GITHUB_TOKEN_SETUP.md** - Token setup instructions
