# Troubleshooting Branch Setup - Permission Issues

## Current Issue

You're experiencing Git permission errors when trying to create branches. This is typically caused by another process locking the Git repository.

## 🔍 Diagnosis

The error messages indicate:
- `Permission denied` when creating lock files
- `Unable to create '.../.git/refs/heads/develop.lock'`
- `Unable to create '.../.git/index.lock'`

## ✅ Solutions (Try in Order)

### Solution 1: Close All Git Processes (Most Common Fix)

1. **Close Cursor/VS Code completely**
   - Save all files
   - Close the application entirely (not just the window)

2. **Close any Git GUI applications:**
   - GitHub Desktop
   - SourceTree
   - GitKraken
   - Any other Git tools

3. **Check for running Git processes:**
   ```powershell
   # In PowerShell, check for git processes
   Get-Process | Where-Object {$_.ProcessName -like "*git*"}
   
   # If any are found, close them:
   Stop-Process -Name "git" -Force -ErrorAction SilentlyContinue
   ```

4. **Wait 10-15 seconds** for locks to clear

5. **Try again:**
   ```bash
   git checkout -b develop
   ```

### Solution 2: Remove All Lock Files

Run these commands in PowerShell (as Administrator if needed):

```powershell
cd D:\ddev\getappshots\AppShot.ai---SaaS-Screenshot-ASO-Tool

# Remove all lock files
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
Remove-Item .git\refs\heads\*.lock -ErrorAction SilentlyContinue
Remove-Item .git\refs\remotes\*.lock -ErrorAction SilentlyContinue

# Check if any lock files remain
Get-ChildItem .git -Recurse -Filter "*.lock" | Remove-Item -Force -ErrorAction SilentlyContinue
```

### Solution 3: Use GitHub Web Interface (Alternative)

If local Git commands continue to fail, create branches via GitHub:

1. **Go to your repository on GitHub:**
   ```
   https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool
   ```

2. **Create `develop` branch:**
   - Click the branch dropdown (currently shows "main")
   - Type "develop" in the search box
   - Click "Create branch: develop from 'main'"

3. **Create `staging` branch:**
   - Click the branch dropdown again
   - Type "staging" in the search box
   - Click "Create branch: staging from 'main'"

4. **Fetch branches locally:**
   ```bash
   git fetch origin
   git checkout develop
   git checkout staging
   git checkout main
   ```

### Solution 4: Check File Permissions

1. **Right-click on the `.git` folder**
2. **Properties → Security tab**
3. **Ensure your user account has "Full control"**
4. **If not, click "Edit" and grant full control**

### Solution 5: Use a Different Terminal

Sometimes the issue is with the terminal session:

1. **Close current terminal**
2. **Open a new PowerShell window** (not in Cursor)
3. **Navigate to project:**
   ```powershell
   cd D:\ddev\getappshots\AppShot.ai---SaaS-Screenshot-ASO-Tool
   ```
4. **Try Git commands:**
   ```bash
   git checkout -b develop
   ```

### Solution 6: Restart Computer

If nothing else works:
1. Save all work
2. Close all applications
3. Restart your computer
4. Try again after restart

## 🎯 Once Branches Are Created

After successfully creating branches (via any method above), verify:

```bash
# List all branches
git branch -a

# You should see:
# * main
#   develop
#   staging
#   remotes/origin/main
#   remotes/origin/develop
#   remotes/origin/staging
```

Then test the branch scripts:

```bash
npm run branch:check
```

## 📋 Manual Branch Creation Commands

Once the permission issue is resolved, run these commands:

```bash
# Ensure you're on main
git checkout main
git pull origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
git checkout main

# Create staging branch
git checkout -b staging
git push -u origin staging
git checkout main

# Verify
git branch -a
```

## 🔧 Prevention

To avoid this issue in the future:

1. **Close Git GUI apps** before running Git commands
2. **Use one Git interface at a time** (don't mix CLI and GUI)
3. **Wait a few seconds** after closing apps before running commands
4. **Check for lock files** if you see permission errors

## 📞 Still Having Issues?

If none of the above solutions work:

1. **Check Windows Event Viewer** for file system errors
2. **Run PowerShell as Administrator** and try again
3. **Check antivirus software** - it might be blocking file operations
4. **Try creating branches on a different machine** and push them

## ✅ Success Indicators

You'll know it's working when:
- ✅ `git checkout -b develop` completes without errors
- ✅ `git branch -a` shows the new branches
- ✅ `npm run branch:check` runs successfully
- ✅ No "Permission denied" errors

---

**Recommended Next Step:** Try Solution 1 first (close all Git processes), then Solution 3 (GitHub web interface) as a quick alternative.
