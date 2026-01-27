# Debug: Bad Credentials (401) - Step by Step Fix

## Current Issue

You're still getting `Bad credentials (HTTP 401)` even after setting the token. Let's debug this step by step.

## Step 1: Verify Token is Actually Set

```powershell
# Check if token is set
echo $env:GITHUB_TOKEN

# If nothing shows or shows empty, the token is not set
# If it shows the token, proceed to Step 2
```

## Step 2: Check Token Format

```powershell
# Check token details
$token = $env:GITHUB_TOKEN
if ($token) {
    Write-Host "Token length: $($token.Length)"
    Write-Host "Token prefix: $($token.Substring(0, [Math]::Min(15, $token.Length)))"
    
    # Should be:
    # - Length: 40+ characters
    # - Prefix: "ghp_" (classic) or "github_pat_" (fine-grained)
} else {
    Write-Host "❌ Token is not set!"
}
```

## Step 3: Test Token with Simple API Call

```powershell
# Test with a simple API call
gh api user

# If this fails, the token is invalid
```

## Step 4: Check if Token Has Required Permissions

The token needs `repo` scope (Full control) for branch protection:

```powershell
# Check token permissions
gh api user --jq '.login'

# If this works, try checking repo access
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool --jq '.name'
```

## Step 5: Create a New Token (If Current One is Invalid)

If the token is invalid, create a new one:

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Name:** "Branch Protection Admin"
4. **Expiration:** 90 days (or your preference)
5. **Scopes:** ✅ Check **repo** (Full control of private repositories)
6. **Generate** and copy the token

## Step 6: Set the New Token Correctly

```powershell
# IMPORTANT: Use single quotes and set it correctly
$env:GITHUB_TOKEN='your_new_token_here'

# Verify it's set
echo $env:GITHUB_TOKEN

# Test immediately
gh api user
```

## Step 7: Alternative - Use GitHub CLI Login Instead

If tokens keep failing, use GitHub CLI's built-in authentication:

```powershell
# Clear the environment variable
$env:GITHUB_TOKEN = $null

# Use GitHub CLI login
gh auth login

# Follow the prompts:
# 1. GitHub.com
# 2. HTTPS
# 3. Login with a web browser
# 4. Complete authentication in browser
```

## Common Issues and Fixes

### Issue 1: Token Not Set
**Symptom:** `echo $env:GITHUB_TOKEN` shows nothing
**Fix:** Set the token with quotes:
```powershell
$env:GITHUB_TOKEN='your_token_here'
```

### Issue 2: Token Expired
**Symptom:** Token was created a long time ago
**Fix:** Create a new token at https://github.com/settings/tokens

### Issue 3: Token Missing Permissions
**Symptom:** Token works for some commands but not branch protection
**Fix:** Create new token with `repo` scope (Full control)

### Issue 4: Token Format Wrong
**Symptom:** Token doesn't start with `ghp_` or `github_pat_`
**Fix:** Make sure you copied the entire token, including prefix

### Issue 5: Token Revoked
**Symptom:** Token was working before but now fails
**Fix:** Check if token was revoked at https://github.com/settings/tokens

## Quick Test Script

Run this to diagnose the issue:

```powershell
# Complete diagnostic
Write-Host "=== GitHub Token Diagnostic ===" -ForegroundColor Cyan

# Check if set
if ($env:GITHUB_TOKEN) {
    Write-Host "✅ Token is set" -ForegroundColor Green
    Write-Host "   Length: $($env:GITHUB_TOKEN.Length)"
    Write-Host "   Prefix: $($env:GITHUB_TOKEN.Substring(0, [Math]::Min(15, $env:GITHUB_TOKEN.Length)))"
    
    # Test token
    Write-Host "`nTesting token..." -ForegroundColor Yellow
    try {
        $user = gh api user --jq '.login' 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Token is valid! User: $user" -ForegroundColor Green
        } else {
            Write-Host "❌ Token is invalid: $user" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Token test failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Token is NOT set" -ForegroundColor Red
    Write-Host "   Set it with: `$env:GITHUB_TOKEN='your_token_here'" -ForegroundColor Yellow
}
```

## Recommended Solution

**If nothing works, use GitHub CLI login:**

```powershell
# This is the most reliable method
$env:GITHUB_TOKEN = $null
gh auth login
```

Then use the script:
```powershell
node scripts/apply-branch-protection-from-json.js
```

---

**Last Updated**: 2026-01-27
**Status**: Debugging token authentication issues
