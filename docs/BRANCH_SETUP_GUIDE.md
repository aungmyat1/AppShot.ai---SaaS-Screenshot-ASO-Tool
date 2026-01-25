# Branch Setup Guide

Quick start guide for setting up and using the professional git branching strategy.

## Quick Start

### 1. Check Your Current Branch Environment

```bash
npm run branch:check
```

This shows:
- Current branch
- Branch type
- Environment configuration
- Sync command needed

### 2. Sync Environment Variables

```bash
npm run branch:sync
```

This automatically syncs the correct environment variables based on your current branch.

### 3. Create a New Branch

```bash
# Feature branch
npm run branch:create feature my-feature-name

# Bugfix branch
npm run branch:create bugfix bug-description

# Hotfix branch
npm run branch:create hotfix critical-issue

# Release branch
npm run branch:create release v1.0.0
```

## Branch Types

### Primary Branches

- **`main`** - Production environment
- **`staging`** - Staging environment  
- **`develop`** - Development environment

### Supporting Branches

- **`feature/*`** - New features (uses development environment)
- **`bugfix/*`** - Bug fixes (uses development environment)
- **`hotfix/*`** - Critical production fixes (uses production environment)
- **`release/*`** - Release preparation (uses staging environment)

## Common Workflows

### Starting a New Feature

```bash
# 1. Create feature branch
npm run branch:create feature user-authentication

# 2. Sync environment (automatic with branch:create)
npm run branch:sync

# 3. Start development
npm run dev
```

### Switching Between Branches

```bash
# 1. Check environment for new branch
git checkout develop
npm run branch:check

# 2. Sync environment variables
npm run branch:sync

# 3. Verify setup
npm run env:check
```

### Preparing for Production

```bash
# 1. Switch to main branch
git checkout main

# 2. Sync production environment
npm run branch:sync

# 3. Verify production variables
npm run env:check

# 4. Deploy
npm run deploy:production
```

## Environment Variable Management

### Automatic Sync

The `branch:sync` command automatically:
- Detects your current branch
- Maps it to the correct environment
- Syncs variables from Doppler to Vercel

### Manual Sync

If you need to manually sync:

```bash
# Development
npm run env:sync:dev

# Staging/Preview
npm run env:sync:preview

# Production
npm run env:sync:prod
```

## Branch Protection

### Recommended Settings

**Main Branch:**
- Require 2 PR approvals
- Require status checks
- No force pushes
- No deletions

**Develop Branch:**
- Require 1 PR approval
- Require status checks
- No force pushes

**Staging Branch:**
- Require 1 PR approval
- Require status checks
- No force pushes

## Troubleshooting

### Environment Variables Not Syncing

```bash
# Check current branch
git branch --show-current

# Manually sync
npm run branch:sync

# Verify
npm run env:check
```

### Wrong Environment Detected

The script automatically maps:
- `feature/*` and `bugfix/*` → Development
- `hotfix/*` → Production
- `release/*` → Staging

For custom branches, manually run the appropriate sync command.

### Branch Creation Fails

```bash
# Ensure base branch exists
git branch -a

# Pull latest changes
git checkout develop
git pull origin develop

# Try again
npm run branch:create feature my-feature
```

## Related Commands

```bash
# Branch management
npm run branch:check          # Check current branch environment
npm run branch:sync           # Sync environment variables
npm run branch:setup          # Check + show sync command
npm run branch:create         # Create properly named branch

# Environment management
npm run env:sync:dev          # Sync development environment
npm run env:sync:preview      # Sync preview/staging environment
npm run env:sync:prod         # Sync production environment
npm run env:check             # Verify environment variables
npm run env:check:clerk        # Check Clerk configuration
npm run env:check:doppler      # Check Doppler integration
```

## Next Steps

1. Read [Git Branching Strategy](./GIT_BRANCHING_STRATEGY.md) for detailed workflow
2. Review [Environment Variables](./ENVIRONMENT_VARIABLES.md) for variable configuration
3. Check [Branch Environment Mapping](./BRANCH_ENVIRONMENT_MAPPING.md) for quick reference

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the detailed documentation
3. Verify your Doppler and Vercel configurations
