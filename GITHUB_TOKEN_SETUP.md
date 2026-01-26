# GitHub Token Setup - Quick Reference

## ✅ Token is Set for Current Session

Your `GITHUB_TOKEN` has been set for the current PowerShell session. You can now use branch protection scripts.

## Quick Commands

```powershell
# Verify token is set
if ($env:GITHUB_TOKEN) { Write-Host "✅ Token is set" } else { Write-Host "❌ Token not set" }

# Test branch protection (dry run)
npm run branch:protection:apply:dry

# Apply branch protection rules
npm run branch:protection:apply
```

## Making Token Persistent

The token is currently only set for this PowerShell session. To make it persistent:

### Option 1: Add to PowerShell Profile (Recommended)

```powershell
# Add to your PowerShell profile
# Replace 'your_token_here' with your actual GitHub token
Add-Content -Path $PROFILE -Value "`$env:GITHUB_TOKEN = 'your_token_here'"

# Then reload profile
. $PROFILE
```

### Option 2: Use the Setup Script

```powershell
.\scripts\setup-github-token.ps1
# Enter your token when prompted
# Choose 'y' to add to profile
```

### Option 3: Set Each Session Manually

```powershell
# Run this each time you open PowerShell
# Replace 'your_token_here' with your actual GitHub token
$env:GITHUB_TOKEN="your_token_here"
```

## Security Notes

⚠️ **Important:**
- ✅ Token is set in environment variable (not in files)
- ✅ `.gitignore` already excludes `.env*` files
- ❌ **Never commit the token to git**
- ❌ **Never share the token publicly**
- ✅ Token is only stored in your PowerShell profile (local to your machine)

## Verify Token Works

```powershell
# Test the token
node scripts/apply-branch-protection-from-json.js --dry-run
```

If you see "✅ Authentication method: GITHUB_TOKEN", the token is working correctly.

## Next Steps

1. **Test (Dry Run):**
   ```powershell
   npm run branch:protection:apply:dry
   ```

2. **Apply Rules:**
   ```powershell
   npm run branch:protection:apply
   ```

3. **Apply for Specific Branch:**
   ```powershell
   node scripts/apply-branch-protection-from-json.js --branch=main
   ```

## Troubleshooting

If the token doesn't work:
1. Verify token has `repo` scope: https://github.com/settings/tokens
2. Check token hasn't expired
3. Verify token is set: `echo $env:GITHUB_TOKEN`
4. Try setting it again in a new PowerShell window
