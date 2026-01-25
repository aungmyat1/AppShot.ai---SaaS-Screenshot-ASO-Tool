# Branch Setup Instructions

This guide will help you set up the professional branch structure for your repository.

## Quick Setup

### Option 1: Automated Script (Recommended)

Run the setup script:

```bash
npm run branch:init
```

This will automatically:
- Create `develop` branch from `main`
- Create `staging` branch from `main`
- Push both branches to remote
- Show summary of created branches

### Option 2: Manual Setup

If the automated script encounters issues, you can create branches manually:

#### Step 1: Create Develop Branch

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

#### Step 2: Create Staging Branch

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

## Verify Setup

After creating branches, verify they exist:

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

## Test Branch Scripts

Test the branch management scripts:

```bash
# Check current branch environment
npm run branch:check

# Test on different branches
git checkout develop
npm run branch:check

git checkout staging
npm run branch:check

git checkout main
npm run branch:check
```

## Troubleshooting

### Permission Denied Errors

If you see "Permission denied" errors:

1. **Close any Git GUI applications** (GitHub Desktop, SourceTree, etc.)
2. **Close your IDE/editor** temporarily
3. **Check for lock files**:
   ```bash
   # Windows PowerShell
   Remove-Item .git\index.lock -ErrorAction SilentlyContinue
   Remove-Item .git\refs\heads\*.lock -ErrorAction SilentlyContinue
   ```
4. **Try again** with the setup script

### Branch Already Exists

If a branch already exists:

- **Locally only**: The script will push it to remote
- **Remotely only**: The script will check it out locally
- **Both**: The script will skip it

### Git Lock Issues

If you encounter lock file issues:

```bash
# Remove lock files (Windows)
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
Remove-Item .git\refs\heads\*.lock -ErrorAction SilentlyContinue

# Or manually delete:
# .git/index.lock
# .git/refs/heads/*.lock
```

Then try the setup again.

## Next Steps After Branch Setup

### 1. Set Up Branch Protection Rules

In GitHub repository settings → Branches:

**Main Branch:**
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Develop Branch:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Staging Branch:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Do not allow force pushes

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

### 3. Configure Vercel Deployment

In Vercel project settings:

- **Production**: Deploy from `main` branch
- **Preview**: Deploy from `staging` branch
- **Development**: Deploy from `develop` branch (optional)

### 4. Test the Workflow

```bash
# Create a test feature branch
npm run branch:create feature test-setup

# Check environment
npm run branch:check

# Sync environment variables
npm run branch:sync

# Clean up test branch
git checkout develop
git branch -d feature/test-setup
```

## Branch Structure After Setup

```
main (production)
├── develop (development)
│   ├── feature/* (new features)
│   └── bugfix/* (bug fixes)
└── staging (staging/pre-production)
    └── release/* (release preparation)
```

## Related Documentation

- [Git Branching Strategy](./GIT_BRANCHING_STRATEGY.md) - Full branching strategy
- [Branch Setup Guide](./BRANCH_SETUP_GUIDE.md) - Quick start guide
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Environment configuration
- [Branch Environment Mapping](./BRANCH_ENVIRONMENT_MAPPING.md) - Quick reference

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Git is not locked by another process
3. Try manual setup if automated script fails
4. Check GitHub repository permissions

---

**Ready to proceed?** Run `npm run branch:init` to set up your branches!
