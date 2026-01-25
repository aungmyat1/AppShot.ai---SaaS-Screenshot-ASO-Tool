# 🚀 Quick Branch Setup - Run These Commands Now

Follow these steps to set up your professional branch structure.

## ⚠️ Important: Before You Start

**CRITICAL:** If you're experiencing permission errors, you MUST:

1. **Close Cursor/VS Code completely** (not just the window - fully exit the application)
2. **Close all Git GUI applications** (GitHub Desktop, SourceTree, etc.)
3. **Wait 10-15 seconds** for locks to clear
4. **Open a fresh PowerShell window** (outside of Cursor)
5. **Navigate to your project** and try the commands

**Alternative:** If local commands fail, use [GitHub Web Interface](#alternative-github-web-interface) to create branches.

## 📝 Step-by-Step Instructions

### Step 1: Remove Any Lock Files (if needed)

Open PowerShell in your project directory and run:

```powershell
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
Remove-Item .git\refs\heads\*.lock -ErrorAction SilentlyContinue
```

### Step 2: Create Develop Branch

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create develop branch
git checkout -b develop

# Push to remote
git push -u origin develop

# Return to main
git checkout main
```

### Step 3: Create Staging Branch

```bash
# Ensure you're on main branch
git checkout main

# Create staging branch
git checkout -b staging

# Push to remote
git push -u origin staging

# Return to main
git checkout main
```

### Step 4: Verify Branches Were Created

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

### Step 5: Test Branch Scripts

```bash
# Test on main branch
npm run branch:check

# Test on develop branch
git checkout develop
npm run branch:check

# Test on staging branch
git checkout staging
npm run branch:check

# Return to main
git checkout main
```

## ✅ Success Checklist

After running the commands above, you should have:

- [ ] `develop` branch created locally
- [ ] `develop` branch pushed to remote
- [ ] `staging` branch created locally
- [ ] `staging` branch pushed to remote
- [ ] All branches visible with `git branch -a`
- [ ] Branch scripts working (`npm run branch:check`)

## 🎯 Next Steps After Branch Setup

### 1. Set Up Branch Protection Rules

Go to your GitHub repository:
1. Settings → Branches
2. Add branch protection rules for:
   - `main` (require 2 approvals, status checks)
   - `develop` (require 1 approval, status checks)
   - `staging` (require 1 approval, status checks)

### 2. Configure Environment Variables

Set up Doppler configs for each environment:

```bash
# Development environment
npm run env:sync:dev

# Staging/Preview environment
npm run env:sync:preview

# Production environment
npm run env:sync:prod
```

### 3. Test Creating a Feature Branch

```bash
# Create a test feature branch
npm run branch:create feature test-setup

# Check environment
npm run branch:check

# Clean up
git checkout develop
git branch -d feature/test-setup
```

## 🌐 Alternative: GitHub Web Interface

If you're experiencing permission errors, create branches via GitHub:

1. **Go to your repository:**
   ```
   https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool
   ```

2. **Create `develop` branch:**
   - Click branch dropdown (shows "main")
   - Type "develop" → Click "Create branch: develop from 'main'"

3. **Create `staging` branch:**
   - Click branch dropdown again
   - Type "staging" → Click "Create branch: staging from 'main'"

4. **Fetch locally:**
   ```bash
   git fetch origin
   git checkout develop
   git checkout staging
   git checkout main
   ```

## 🆘 Troubleshooting

### "Permission denied" Error

**Solution:**
1. Close all Git applications
2. Remove lock files (see Step 1 above)
3. Wait a few seconds
4. Try again

### "Branch already exists" Error

**Solution:**
- If branch exists locally: `git push -u origin <branch-name>`
- If branch exists remotely: `git checkout -b <branch-name> origin/<branch-name>`

### "Cannot lock ref" Error

**Solution:**
1. Close all applications using Git
2. Remove lock files
3. Wait 10 seconds
4. Try again

## 📚 Documentation

For more details, see:
- [Troubleshooting Guide](./TROUBLESHOOTING_BRANCH_SETUP.md) - **Read this if you have permission errors**
- [Branch Setup Instructions](./docs/BRANCH_SETUP_INSTRUCTIONS.md)
- [Git Branching Strategy](./docs/GIT_BRANCHING_STRATEGY.md)
- [Branch Setup Guide](./docs/BRANCH_SETUP_GUIDE.md)

---

**Ready?** Start with Step 1 above! 🚀
