# Git Branching Strategy

This document outlines the professional git branching strategy for AppShot.ai, including branch naming conventions, workflow, and environment variable management.

## Branch Structure

### Primary Branches

| Branch | Purpose | Environment | Auto-Deploy | Protection |
|--------|---------|-------------|-------------|------------|
| `main` | Production-ready code | Production | ✅ Yes | 🔒 Protected |
| `develop` | Integration branch for features | Development | ✅ Yes | 🔒 Protected |
| `staging` | Pre-production testing | Staging | ✅ Yes | 🔒 Protected |

### Supporting Branches

| Branch Type | Naming Convention | Purpose | Lifecycle |
|-------------|------------------|---------|-----------|
| **Feature** | `feature/<feature-name>` | New features | Merged to `develop`, then deleted |
| **Bugfix** | `bugfix/<bug-description>` | Bug fixes | Merged to `develop` or `main`, then deleted |
| **Hotfix** | `hotfix/<issue-description>` | Critical production fixes | Merged to `main` and `develop`, then deleted |
| **Release** | `release/<version>` | Release preparation | Merged to `main` and `develop`, then deleted |

## Branch Workflow

### Development Flow

```
feature/new-feature → develop → staging → main
```

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Work on Feature**
   - Make commits with clear messages
   - Push to remote: `git push origin feature/new-feature`
   - Create Pull Request to `develop`

3. **Merge to Develop**
   - After PR review and approval
   - Merge via GitHub (squash merge recommended)
   - Auto-deploys to Development environment

4. **Promote to Staging**
   - Create PR from `develop` to `staging`
   - After testing, merge to `staging`
   - Auto-deploys to Staging environment

5. **Release to Production**
   - Create PR from `staging` to `main`
   - After final approval, merge to `main`
   - Auto-deploys to Production environment

### Hotfix Flow

```
hotfix/critical-fix → main → develop
```

1. **Create Hotfix Branch from Main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. **Fix and Test**
   - Make the fix
   - Test thoroughly
   - Push and create PR to `main`

3. **Merge to Main**
   - After approval, merge to `main`
   - Immediately merge to `develop` to keep in sync

## Environment Variables by Branch

### Branch → Environment Mapping

| Branch | Environment | Doppler Config | Vercel Environment | Database | Stripe Mode |
|--------|-------------|---------------|-------------------|----------|------------|
| `main` | Production | `production` | Production | Production DB | Live |
| `staging` | Staging | `preview` | Preview | Staging DB | Test |
| `develop` | Development | `development` | Development | Dev DB | Test |
| `feature/*` | Development | `development` | Development | Dev DB | Test |

### Environment Variable Management

#### Using Doppler (Recommended)

```bash
# Sync environment variables for each environment
npm run env:sync:dev      # For develop branch
npm run env:sync:preview  # For staging branch
npm run env:sync:prod     # For main branch
```

#### Manual Configuration

See [Environment Variables Configuration](./ENVIRONMENT_VARIABLES.md) for detailed setup.

## Branch Protection Rules

### Main Branch
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict who can push
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### Develop Branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### Staging Branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Do not allow force pushes

## Deployment Triggers

### Automatic Deployments

| Branch | Trigger | Target | Vercel Project |
|--------|---------|--------|----------------|
| `main` | Push/PR merge | Production | `getappshots-prod` |
| `staging` | Push/PR merge | Staging | `getappshots-staging` |
| `develop` | Push/PR merge | Development | `getappshots-dev` |

### Manual Deployments

For feature branches, deployments are manual via Vercel preview deployments.

## Branch Naming Guidelines

### Feature Branches
- ✅ `feature/user-authentication`
- ✅ `feature/screenshot-extraction`
- ✅ `feature/payment-integration`
- ❌ `feature` (too generic)
- ❌ `new-feature` (missing prefix)

### Bugfix Branches
- ✅ `bugfix/login-error`
- ✅ `bugfix/stripe-webhook-failure`
- ❌ `fix` (too generic)
- ❌ `bug` (missing prefix)

### Hotfix Branches
- ✅ `hotfix/critical-security-patch`
- ✅ `hotfix/database-connection-issue`
- ❌ `hotfix` (too generic)

## Best Practices

### 1. Branch Hygiene
- Delete branches after merging
- Keep branches up to date with their base branch
- Use descriptive branch names
- One feature per branch

### 2. Commit Messages
- Use conventional commits format
- Be descriptive and clear
- Reference issue numbers when applicable

### 3. Pull Requests
- Write clear PR descriptions
- Link related issues
- Request appropriate reviewers
- Ensure CI checks pass before merging

### 4. Environment Variables
- Never commit secrets to git
- Use Doppler for secret management
- Sync environment variables before deployment
- Verify environment variables after deployment

## Quick Reference Commands

### Creating Branches
```bash
# Feature branch
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Bugfix branch
git checkout develop
git checkout -b bugfix/my-bugfix

# Hotfix branch
git checkout main
git checkout -b hotfix/my-hotfix
```

### Syncing Branches
```bash
# Update develop from main
git checkout develop
git pull origin main
git push origin develop

# Update feature branch from develop
git checkout feature/my-feature
git pull origin develop
```

### Environment Setup
```bash
# Switch to develop and sync dev environment
git checkout develop
npm run env:sync:dev

# Switch to staging and sync preview environment
git checkout staging
npm run env:sync:preview

# Switch to main and sync production environment
git checkout main
npm run env:sync:prod
```

## Troubleshooting

### Branch Out of Sync
```bash
# Update your branch from base
git checkout your-branch
git pull origin base-branch
# Resolve conflicts if any
git push origin your-branch
```

### Wrong Environment Variables
```bash
# Check current branch
git branch --show-current

# Sync correct environment
npm run env:sync:dev      # for develop
npm run env:sync:preview  # for staging
npm run env:sync:prod     # for main
```

### Deployment Issues
1. Verify branch protection rules
2. Check CI/CD status
3. Verify environment variables are synced
4. Check Vercel deployment logs

## Related Documentation

- [Environment Variables Configuration](./ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](./DEPLOY_VERCEL_INTEGRATIONS.md)
- [Doppler Setup](./QUICK_SETUP_SECRETS.md)
- [Launch Plan](../LAUNCH_PLAN.md)
