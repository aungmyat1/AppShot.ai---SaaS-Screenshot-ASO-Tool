# Quick Fix for 401 Bad Credentials

## Immediate Fix

The token needs to be set correctly. Run this in PowerShell:

```powershell
# Set the token in current session
# IMPORTANT: Always use quotes around the token value!
$env:GITHUB_TOKEN='your_token_here'

# Verify it's set
echo $env:GITHUB_TOKEN

# Test the branch protection (dry run)
npm run branch:protection:apply:dry
```

## If Token is Invalid

If you still get 401 error, the token may be invalid or expired:

### Step 1: Create New Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Branch Protection Scripts"
4. Select scope: ✅ **repo** (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately**

### Step 2: Update Token

```powershell
# Set new token
$env:GITHUB_TOKEN="your_new_token_here"

# Add to PowerShell profile (persistent)
$profilePath = $PROFILE
$tokenLine = "\$env:GITHUB_TOKEN = 'your_new_token_here'"
if (Test-Path $profilePath) {
    $content = Get-Content $profilePath
    $updated = $content | ForEach-Object {
        if ($_ -match 'GITHUB_TOKEN') {
            $tokenLine
        } else {
            $_
        }
    }
    Set-Content -Path $profilePath -Value $updated
} else {
    Add-Content -Path $profilePath -Value $tokenLine
}

# Reload profile
. $PROFILE
```

### Step 3: Test

```powershell
npm run branch:protection:apply:dry
```

## Alternative: Use GitHub CLI

GitHub CLI is more reliable:

```powershell
# Install (if needed)
winget install --id GitHub.cli

# Authenticate
gh auth login

# Run branch protection
npm run branch:protection:apply
```

## Verify Token Works

```powershell
# Quick test
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
