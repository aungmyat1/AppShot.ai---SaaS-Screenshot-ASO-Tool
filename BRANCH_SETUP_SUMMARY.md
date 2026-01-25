# Git Branching Strategy Setup - Summary

This document summarizes the professional git branching strategy and environment variable management setup that has been configured for your project.

## ✅ What Has Been Set Up

### 1. Documentation Created

- **`docs/GIT_BRANCHING_STRATEGY.md`** - Comprehensive branching strategy guide
- **`docs/ENVIRONMENT_VARIABLES.md`** - Environment variable configuration guide
- **`docs/BRANCH_ENVIRONMENT_MAPPING.md`** - Quick reference for branch-to-environment mapping
- **`docs/BRANCH_SETUP_GUIDE.md`** - Quick start guide for branch management

### 2. Scripts Created

- **`scripts/branch-setup.js`** - Automatically detects branch and syncs environment variables
- **`scripts/create-branch.js`** - Creates properly named branches following conventions

### 3. Package.json Scripts Added

New npm scripts for branch management:
- `npm run branch:check` - Check current branch environment configuration
- `npm run branch:sync` - Sync environment variables for current branch
- `npm run branch:setup` - Check + show sync command
- `npm run branch:create` - Create properly named branch

## 🌿 Branch Structure

### Primary Branches

| Branch | Environment | Purpose |
|--------|-------------|---------|
| `main` | Production | Production-ready code |
| `staging` | Staging | Pre-production testing |
| `develop` | Development | Integration branch for features |

### Supporting Branches

| Type | Pattern | Base Branch | Environment |
|------|---------|-------------|-------------|
| Feature | `feature/*` | `develop` | Development |
| Bugfix | `bugfix/*` | `develop` | Development |
| Hotfix | `hotfix/*` | `main` | Production |
| Release | `release/*` | `develop` | Staging |

## 🔧 Quick Start

### Check Your Current Branch Environment

```bash
npm run branch:check
```

### Sync Environment Variables

```bash
npm run branch:sync
```

### Create a New Feature Branch

```bash
npm run branch:create feature my-feature-name
```

## 📋 Branch → Environment Mapping

| Branch | Environment | Sync Command |
|--------|-------------|--------------|
| `main` | Production | `npm run env:sync:prod` |
| `staging` | Staging | `npm run env:sync:preview` |
| `develop` | Development | `npm run env:sync:dev` |
| `feature/*` | Development | `npm run env:sync:dev` |
| `bugfix/*` | Development | `npm run env:sync:dev` |
| `hotfix/*` | Production | `npm run env:sync:prod` |

## 🚀 Next Steps

### 1. Create Missing Branches (if needed)

**Option A: Use the automated script (recommended)**

```bash
# Make sure no other Git processes are running (close IDE, Git GUI, etc.)
npm run branch:init
```

**Option B: Manual setup**

If the automated script fails due to permission issues, create branches manually:

```bash
# Step 1: Ensure you're on main and up to date
git checkout main
git pull origin main

# Step 2: Create develop branch
git checkout -b develop
git push -u origin develop

# Step 3: Return to main and create staging branch
git checkout main
git checkout -b staging
git push -u origin staging

# Step 4: Return to main
git checkout main

# Step 5: Verify branches were created
git branch -a
```

**Troubleshooting Permission Issues:**

If you see "Permission denied" errors:
1. Close any Git GUI applications (GitHub Desktop, SourceTree, etc.)
2. Close your IDE/editor temporarily
3. Remove lock files (Windows PowerShell):
   ```powershell
   Remove-Item .git\index.lock -ErrorAction SilentlyContinue
   Remove-Item .git\refs\heads\*.lock -ErrorAction SilentlyContinue
   ```
4. Try the setup again

### 2. Set Up Branch Protection Rules

In GitHub repository settings:
- **Main branch**: Require 2 PR approvals, status checks, no force pushes
- **Develop branch**: Require 1 PR approval, status checks, no force pushes
- **Staging branch**: Require 1 PR approval, status checks, no force pushes

### 3. Configure Environment Variables in Doppler

Ensure you have Doppler configs for:
- `development` - For develop and feature branches
- `preview` - For staging branch
- `production` - For main branch

### 4. Test the Setup

```bash
# Test branch check
npm run branch:check

# Test branch creation
npm run branch:create feature test-feature

# Test environment sync (if Doppler is configured)
npm run branch:sync
```

## 📚 Documentation

For detailed information, see:

- **Quick Start**: `docs/BRANCH_SETUP_GUIDE.md`
- **Full Strategy**: `docs/GIT_BRANCHING_STRATEGY.md`
- **Environment Variables**: `docs/ENVIRONMENT_VARIABLES.md`
- **Quick Reference**: `docs/BRANCH_ENVIRONMENT_MAPPING.md`

## 🔍 Available Commands

### Branch Management
```bash
npm run branch:check          # Check current branch environment
npm run branch:sync            # Sync environment variables
npm run branch:setup           # Check + show sync command
npm run branch:create          # Create properly named branch
```

### Environment Management
```bash
npm run env:sync:dev           # Sync development environment
npm run env:sync:preview       # Sync preview/staging environment
npm run env:sync:prod          # Sync production environment
npm run env:check              # Verify environment variables
```

## ⚠️ Important Notes

1. **Environment Variables**: The scripts automatically map branches to environments. Feature/bugfix branches use development, hotfix branches use production.

2. **Doppler Integration**: Environment variable syncing requires Doppler to be set up. See `docs/QUICK_SETUP_SECRETS.md` for setup instructions.

3. **Branch Protection**: Set up branch protection rules in GitHub to enforce the workflow.

4. **Vercel Deployment**: Ensure Vercel is configured to deploy:
   - `main` → Production
   - `staging` → Preview/Staging
   - `develop` → Development

## 🎯 Workflow Example

### Starting a New Feature

```bash
# 1. Create feature branch
npm run branch:create feature user-authentication

# 2. Sync environment (automatic)
npm run branch:sync

# 3. Start development
npm run dev
```

### Promoting to Production

```bash
# 1. Merge feature to develop (via PR)
# 2. Merge develop to staging (via PR)
# 3. Merge staging to main (via PR)

# When on main branch:
npm run branch:sync  # Syncs production environment
npm run deploy:production
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting sections in the documentation
2. Verify your Doppler configuration
3. Ensure branch protection rules are set correctly
4. Verify Vercel project settings

---

**Setup completed on**: 2026-01-25
**All files are ready to use!**
