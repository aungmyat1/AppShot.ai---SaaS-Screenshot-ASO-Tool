# PowerShell Token Syntax Fix

## ❌ Common Error

**Incorrect syntax (will cause error):**
```powershell
$env:GITHUB_TOKEN=github_pat_EXAMPLE_TOKEN
```

**Error message:**
```
The term 'github_pat_...' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## ✅ Correct Syntax

**You MUST use quotes around the token value:**

```powershell
# Single quotes (recommended - no variable expansion)
$env:GITHUB_TOKEN='github_pat_EXAMPLE_TOKEN'

# OR double quotes (works, but allows variable expansion)
$env:GITHUB_TOKEN="github_pat_EXAMPLE_TOKEN"
```

## 🔒 Security Warning

**⚠️ CRITICAL:** The terminal history file contains exposed tokens:
- `c:\Users\aungp\.cursor\projects\d-ddev-getappshots-AppShot-ai-SaaS-Screenshot-ASO-Tool\terminals\2.txt`

**Immediate actions required:**

1. **Revoke any real tokens you previously pasted:**
   - Go to: https://github.com/settings/tokens
   - Revoke any tokens that were exposed in this terminal/session
   - Create new tokens if needed

2. **Clear terminal history:**
   ```powershell
   # Clear PowerShell history
   Clear-Host
   # Or clear history file (be careful!)
   Remove-Item (Get-PSReadlineOption).HistorySavePath -ErrorAction SilentlyContinue
   ```

3. **Use secure methods for token storage:**
   - Add to PowerShell profile (encrypted if possible)
   - Use environment variables in system settings
   - Use secret management tools (Doppler, etc.)

## 📝 Complete Example

```powershell
# Step 1: Set token with correct syntax (use quotes!)
$env:GITHUB_TOKEN='your_new_token_here'

# Step 2: Verify it's set
if ($env:GITHUB_TOKEN) { 
    Write-Host "✅ Token is set" -ForegroundColor Green
    Write-Host "Token length: $($env:GITHUB_TOKEN.Length)"
} else { 
    Write-Host "❌ Token not set" -ForegroundColor Red
}

# Step 3: Test the token
$headers = @{
    "Authorization" = "token $env:GITHUB_TOKEN"
    "Accept" = "application/vnd.github.v3+json"
}
try {
    $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    Write-Host "✅ Token works! Authenticated as: $($user.login)" -ForegroundColor Green
} catch {
    Write-Host "❌ Token invalid: $($_.Exception.Message)" -ForegroundColor Red
}
```

## 🔐 Best Practices

1. **Always use quotes** when setting environment variables in PowerShell
2. **Never paste tokens directly** into terminal without quotes
3. **Use single quotes** for tokens (prevents accidental variable expansion)
4. **Clear terminal history** after working with sensitive data
5. **Use secure storage** for tokens (PowerShell profile, system env vars, secret managers)
6. **Revoke tokens immediately** if exposed

## 🛠️ Alternative: Use GitHub CLI (More Secure)

Instead of managing tokens manually:

```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate (no token needed in terminal)
gh auth login

# Scripts will automatically use GitHub CLI authentication
npm run branch:protection:apply
```

This avoids exposing tokens in terminal history entirely.

---

**Last Updated**: 2026-01-27
**Status**: Syntax fixed, security warning added
