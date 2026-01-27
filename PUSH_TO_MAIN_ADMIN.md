# Push to Main with Admin Rights

## Current Situation

Branch protection on `main` blocks direct pushes. With admin rights, you have options:

## Option 1: Temporarily Disable Branch Protection (Recommended)

### Step 1: Disable Protection Temporarily

1. **Go to:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
2. **Click** on the `main` branch protection rule
3. **Scroll down** and click **"Disable protection"** (or uncheck "Protect matching branches")
4. **Save changes**

### Step 2: Push to Main

```powershell
# Make sure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Push your changes
git push origin main
```

### Step 3: Re-enable Protection

**⚠️ IMPORTANT:** Re-enable protection immediately after pushing!

1. **Go back to:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
2. **Click** "Add rule" or re-enable the `main` branch rule
3. **Configure** the protection settings
4. **Save changes**

## Option 2: Use Force Push (If You're Solo)

**⚠️ WARNING:** Only use this if you're the only one working on the branch!

```powershell
# Make sure you're on main
git checkout main

# Pull latest
git pull origin main

# Force push (bypasses protection if you're admin)
git push origin main --force
```

**Note:** This will likely fail if force pushes are disabled in branch protection.

## Option 3: Create PR and Merge (Safest)

Even with admin rights, using a PR is safer:

```powershell
# Create a branch from your current work
git checkout -b admin-push-to-main

# Push the branch
git push -u origin admin-push-to-main

# Create PR on GitHub
# Then merge it (no reviews needed if protection is updated)
```

## Option 4: Use GitHub CLI to Bypass

If you have GitHub CLI authenticated:

```powershell
# Check current branch
git branch

# If you have uncommitted changes, commit them first
git add .
git commit -m "your commit message"

# Push using GitHub CLI (might bypass some restrictions)
gh repo sync
```

## Option 5: Update Branch Protection to Allow Admin Bypass

Configure branch protection to allow admins to bypass:

1. **Go to:** https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/settings/branches
2. **Edit** `main` branch rule
3. **Uncheck** "Include administrators" (this allows admins to bypass)
4. **Save changes**

Then you can push directly:

```powershell
git push origin main
```

## Quick Admin Push Workflow

**Fastest method:**

1. **Temporarily disable protection** (30 seconds)
   - Settings → Branches → Main → Disable protection

2. **Push your changes** (10 seconds)
   ```powershell
   git push origin main
   ```

3. **Re-enable protection** (30 seconds)
   - Settings → Branches → Main → Re-enable protection

**Total time: ~1 minute**

## Verify You Have Admin Rights

```powershell
# Check if you're authenticated
gh auth status

# Check repository access
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool --jq '.permissions.admin'
```

Should return `true` if you have admin access.

## Troubleshooting

### Error: "remote: error: GH006: Protected branch update failed"

**Solution:** Branch protection is still active. Use Option 1 to temporarily disable it.

### Error: "! [remote rejected] main -> main (push declined)"

**Solution:** Direct pushes are blocked. Either:
- Temporarily disable protection (Option 1)
- Use PR workflow (Option 3)
- Uncheck "Include administrators" in protection (Option 5)

### Error: "Updates were rejected because the remote contains work"

**Solution:** Pull first, then push:
```powershell
git pull origin main --rebase
git push origin main
```

## Recommended Approach

**For solo developer with admin rights:**

1. **Uncheck "Include administrators"** in branch protection (one-time setup)
2. **Then you can push directly:**
   ```powershell
   git push origin main
   ```

This way you don't need to disable/enable protection each time.

---

**Last Updated**: 2026-01-27
**Status**: Guide for pushing to main with admin rights
