# Fix 401 Bad Credentials Error

## Error Message
```
❌ Error configuring protection for main
   Status: 401
   Message: Bad credentials
```

## Quick Fix Steps

### Step 1: Verify Token is Set
```powershell
# Check if token is set
echo $env:GITHUB_TOKEN

# If not set, set it:
$env:GITHUB_TOKEN="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"
```

### Step 2: Test Token Validity

Run this to test your token:
```powershell
$token = $env:GITHUB_TOKEN
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell"
}
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    Write-Host "✅ Token is valid! Authenticated as: $($response.login)" -ForegroundColor Green
} catch {
    Write-Host "❌ Token is invalid: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Step 3: Check Token Scopes

The token needs `repo` scope for branch protection. Verify at:
- https://github.com/settings/tokens

**Required Scopes:**
- ✅ **repo** (Full control of private repositories) - Required for branch protection

### Step 4: Regenerate Token (If Invalid)

If the token is invalid or expired:

1. **Go to GitHub Settings:**
   - https://github.com/settings/tokens

2. **Create New Token (Classic):**
   - Click "Generate new token (classic)"
   - Give it a name: "Branch Protection Scripts"
   - Select scope: ✅ **repo** (all sub-scopes)
   - Click "Generate token"
   - **Copy the token immediately**

3. **Update Environment:**
   ```powershell
   # Set in current session
   $env:GITHUB_TOKEN="your_new_token_here"
   
   # Update PowerShell profile (persistent)
   $profileContent = Get-Content $PROFILE
   $newContent = $profileContent | ForEach-Object {
       if ($_ -match 'GITHUB_TOKEN') {
           "\$env:GITHUB_TOKEN = 'your_new_token_here'"
       } else {
           $_
       }
   }
   Set-Content -Path $PROFILE -Value $newContent
   . $PROFILE
   ```

### Step 5: Verify Token Works

```powershell
# Test the token
npm run branch:protection:apply:dry
```

If you see "✅ Authentication method: GITHUB_TOKEN", the token is working.

## Alternative: Use GitHub CLI (Recommended)

GitHub CLI is more reliable and handles authentication better:

```powershell
# Install GitHub CLI (if not installed)
winget install --id GitHub.cli

# After installation, restart terminal, then:
gh auth login

# Select:
# - GitHub.com
# - HTTPS
# - Login with a web browser
# - Follow the prompts

# Then run:
npm run branch:protection:apply
```

The script will automatically use GitHub CLI authentication if available.

## Common Causes

1. **Token Expired** - Tokens can expire if set with expiration date
2. **Token Revoked** - Token was manually revoked in GitHub settings
3. **Wrong Scopes** - Token doesn't have `repo` scope
4. **Token Not Set** - Environment variable not set correctly
5. **Token Format** - Token should start with `ghp_` for classic tokens

## Verify Current Token

```powershell
# Check token format
$token = $env:GITHUB_TOKEN
if ($token) {
    Write-Host "Token prefix: $($token.Substring(0, [Math]::Min(10, $token.Length)))"
    Write-Host "Token length: $($token.Length)"
    if ($token -notmatch '^ghp_|^gho_|^github_pat_') {
        Write-Host "⚠️  Token format may be incorrect" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Token not set" -ForegroundColor Red
}
```

## Still Having Issues?

1. **Clear and Reset:**
   ```powershell
   # Remove old token
   $env:GITHUB_TOKEN = $null
   
   # Create new token at: https://github.com/settings/tokens
   # Set new token
   $env:GITHUB_TOKEN="new_token_here"
   
   # Test
   npm run branch:protection:apply:dry
   ```

2. **Use GitHub CLI Instead:**
   - More reliable authentication
   - Better error messages
   - No token management needed

3. **Check Repository Access:**
   - Verify you have admin access to: `aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool`
   - Go to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/access
