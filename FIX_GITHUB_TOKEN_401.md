# Fix: GitHub CLI Bad Credentials (401 Error)

## Problem

You're getting `Bad credentials (HTTP 401)` when using GitHub CLI API commands. This means your `GITHUB_TOKEN` is either:
- Not set
- Invalid/expired
- Missing required permissions (needs `admin:repo` scope)

## Quick Fix Steps

### Step 1: Check if Token is Set

```powershell
# Check if token is set
echo $env:GITHUB_TOKEN

# If nothing shows, the token is not set
```

### Step 2: Verify Token is Valid

```powershell
# Test the token
gh auth status

# If it shows "Bad credentials", the token is invalid
```

### Step 3: Create a New Token with Admin Permissions

**You need a token with `admin:repo` scope to modify branch protection:**

1. **Go to GitHub Token Settings:**
   - https://github.com/settings/tokens
   - Click "Generate new token (classic)"

2. **Configure the Token:**
   - **Name:** "Branch Protection Admin"
   - **Expiration:** Choose your preference (90 days recommended)
   - **Scopes:** Check these:
     - ✅ **repo** (Full control of private repositories) - **REQUIRED**
     - ✅ **admin:repo_hook** (if needed)
   - Click "Generate token"

3. **Copy the token immediately** (you won't see it again!)

### Step 4: Set the New Token

```powershell
# Set token in current session (use quotes!)
$env:GITHUB_TOKEN='your_new_token_here'

# Verify it's set
echo $env:GITHUB_TOKEN

# Test it works
gh auth status

# Test API access
gh api user
```

### Step 5: Verify Admin Permissions

```powershell
# Check if token has admin permissions
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool --jq '.permissions'

# Should show admin: true or admin:repo permission
```

### Step 6: Apply Branch Protection Rules

Once your token is valid with admin permissions:

```powershell
# Test first
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection

# Apply main branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection --method PUT --input branch-protection-rules.json

# Apply staging branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/staging/protection --method PUT --input branch-protection-rules.json

# Apply develop branch protection
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/develop/protection --method PUT --input branch-protection-rules.json
```

## Alternative: Use the Script Instead

The script might handle authentication better:

```powershell
# Use the apply script (it might handle auth differently)
node scripts/apply-branch-protection-from-json.js --dry-run

# If that works, apply for real
node scripts/apply-branch-protection-from-json.js
```

## Make Token Persistent (Optional)

To keep the token across PowerShell sessions:

```powershell
# Add to PowerShell profile
$tokenLine = "\$env:GITHUB_TOKEN = 'your_new_token_here'"
Add-Content -Path $PROFILE -Value $tokenLine

# Reload profile
. $PROFILE

# Verify
echo $env:GITHUB_TOKEN
```

## Troubleshooting

### If Token Still Doesn't Work

1. **Check token format:**
   ```powershell
   $token = $env:GITHUB_TOKEN
   Write-Host "Token length: $($token.Length)"
   Write-Host "Token prefix: $($token.Substring(0, [Math]::Min(10, $token.Length)))"
   ```
   - Should be ~40+ characters
   - Should start with `ghp_` (classic) or `github_pat_` (fine-grained)

2. **Revoke old tokens:**
   - Go to: https://github.com/settings/tokens
   - Revoke any old/invalid tokens

3. **Try GitHub CLI login instead:**
   ```powershell
   # Clear environment variable
   $env:GITHUB_TOKEN = $null
   
   # Use GitHub CLI login
   gh auth login
   # Select: GitHub.com, HTTPS, Login with web browser
   ```

## Required Token Scopes

For branch protection, you need:
- ✅ **repo** (Full control) - **REQUIRED**
- ✅ **admin:repo_hook** (Optional, for webhooks)

**Note:** Fine-grained tokens need explicit repository access and admin permissions.

---

**Last Updated**: 2026-01-27
**Status**: Fix token authentication to apply branch protection rules
