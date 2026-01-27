# GitHub CLI Authentication Fix

## Current Situation

GitHub CLI detected that `GITHUB_TOKEN` environment variable is set, so it's using that for authentication instead of storing credentials locally.

**This is actually fine!** Your `gh` commands will work with the environment variable.

## Option 1: Use Existing GITHUB_TOKEN (Recommended)

If your `GITHUB_TOKEN` is valid and has the right permissions, you can use it directly:

```powershell
# Verify token works
gh auth status

# Test with a command
gh pr list

# If it works, you're good to go!
```

## Option 2: Clear Token and Use GitHub CLI Storage

If you want GitHub CLI to store credentials instead:

```powershell
# Clear the environment variable (current session only)
$env:GITHUB_TOKEN = $null

# Or remove from PowerShell profile (permanent)
# Edit your profile: notepad $PROFILE
# Remove the line: $env:GITHUB_TOKEN = '...'

# Then login with GitHub CLI
gh auth login
```

## Option 3: Keep Both (Token + CLI Storage)

You can have both - the environment variable takes precedence:

```powershell
# Check current auth status
gh auth status

# If you see "Token: ghp_..." it's using your env var
# If you see "Logged in as ..." it's using CLI storage
```

## Quick Commands to Merge PR

Since you have `GITHUB_TOKEN` set, you can use `gh` commands directly:

```powershell
# List your PRs
gh pr list

# View a specific PR
gh pr view <PR_NUMBER>

# Approve a PR (if you need to)
gh pr review <PR_NUMBER> --approve

# Merge a PR (as admin, bypasses some checks)
gh pr merge <PR_NUMBER> --admin --merge

# Or merge normally (requires reviews/checks)
gh pr merge <PR_NUMBER> --merge
```

## Verify Your Token Has Admin Permissions

```powershell
# Check what permissions your token has
gh api user

# Check if you can modify branch protection (admin:repo scope needed)
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool --jq '.permissions'
```

## Troubleshooting

**If `gh` commands fail with authentication errors:**

1. **Check token is set:**
   ```powershell
   echo $env:GITHUB_TOKEN
   ```

2. **Verify token is valid:**
   ```powershell
   gh auth status
   ```

3. **If token is invalid, set a new one:**
   ```powershell
   # Get a new token from: https://github.com/settings/tokens
   $env:GITHUB_TOKEN='your_new_token_here'
   ```

4. **Or use GitHub CLI login:**
   ```powershell
   $env:GITHUB_TOKEN = $null
   gh auth login
   ```

## Recommended: Use Environment Variable

For your use case (merging PRs with admin rights), keeping `GITHUB_TOKEN` set is fine:

```powershell
# Your token is already set, just use gh commands
gh pr list
gh pr merge <PR_NUMBER> --admin --merge
```

**No need to run `gh auth login` if your token is already working!**

---

**Last Updated**: 2026-01-27
**Status**: GitHub CLI can use existing GITHUB_TOKEN
