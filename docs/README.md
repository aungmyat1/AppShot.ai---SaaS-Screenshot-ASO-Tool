# Documentation Index

Welcome to the GetAppShots documentation. This guide helps you find the right documentation for your needs.

## 📚 Quick Navigation

### 🚀 Getting Started
- **[Local Setup Guide](./SETUP_LOCAL.md)** - Set up the project locally
- **[Environment Variables](./SETUP_ENVIRONMENT_VARIABLES.md)** - Configure all required environment variables

### ☁️ Deployment

#### Vercel (Recommended)
- **[Complete Vercel Guide](./DEPLOY_VERCEL_INTEGRATIONS.md)** - Full deployment guide with built-in integrations
- **[Secrets Management](./QUICK_SETUP_SECRETS.md)** - Quick setup for automated secrets (40 min)
- **[Secrets Strategy](./RECOMMENDED_SECRETS_STRATEGY.md)** - Detailed strategy for secrets management

#### Other Platforms
- **[Docker Deployment](../infrastructure/docker/README.md)** - Docker and Docker Compose setup
- **[Kubernetes Deployment](../infrastructure/k8s/README.md)** - Kubernetes manifests and setup
- **[Terraform Infrastructure](../infrastructure/terraform/README.md)** - Infrastructure as Code

### ⚙️ Configuration

- **[Stripe Integration](./STRIPE_PRICING_SYNC.md)** - Stripe setup, pricing sync, and webhook configuration
- **[Pricing Management](./STRIPE_PRICING_SYNC.md)** - How to update prices and sync with Stripe

### 📋 Reference

- **[Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)** - Complete pre-deployment checklist
- **[AI Assistant Context](./AI_ASSISTANT_CONTEXT.md)** - Context for AI assistants working on this project

---

## 📖 Documentation by Category

### Setup & Installation

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Local Setup](./SETUP_LOCAL.md) | Local development setup | First time setting up the project |
| [Environment Variables](./SETUP_ENVIRONMENT_VARIABLES.md) | All environment variables explained | Setting up services and credentials |

### Deployment Guides

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Vercel Integrations](./DEPLOY_VERCEL_INTEGRATIONS.md) | Complete Vercel deployment with integrations | Deploying to Vercel (recommended) |
| [Quick Secrets Setup](./QUICK_SETUP_SECRETS.md) | 40-minute automated secrets setup | Setting up secrets management |
| [Secrets Strategy](./RECOMMENDED_SECRETS_STRATEGY.md) | Detailed secrets management strategy | Planning secrets architecture |

### Service Configuration

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Stripe Setup](./STRIPE_PRICING_SYNC.md) | Stripe integration and pricing sync | Setting up payments |
| [Pricing Management](./STRIPE_PRICING_SYNC.md) | Update prices and sync to Stripe | Changing subscription prices |

### Infrastructure

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Docker](../infrastructure/docker/README.md) | Docker deployment | Using Docker |
| [Kubernetes](../infrastructure/k8s/README.md) | K8s deployment | Deploying to Kubernetes |
| [Terraform](../infrastructure/terraform/README.md) | Infrastructure as Code | Provisioning cloud infrastructure |

### Reference

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) | Pre-deployment verification | Before deploying to production |
| [AI Context](./AI_ASSISTANT_CONTEXT.md) | Project context for AI | AI assistants working on codebase |

---

## 🎯 Common Tasks

### First Time Setup
1. Read [Local Setup Guide](./SETUP_LOCAL.md)
2. Configure [Environment Variables](./SETUP_ENVIRONMENT_VARIABLES.md)
3. Set up [Stripe Integration](./STRIPE_PRICING_SYNC.md)

### Deploying to Production
1. Review [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)
2. Follow [Vercel Integrations Guide](./DEPLOY_VERCEL_INTEGRATIONS.md)
3. Set up [Automated Secrets](./QUICK_SETUP_SECRETS.md)

### Updating Prices
1. Edit `apps/web/lib/pricing-config.ts`
2. Run `npm run stripe:sync`
3. Update environment variables
4. See [Stripe Pricing Sync](./STRIPE_PRICING_SYNC.md) for details

---

## 📝 Documentation Structure

```
docs/
├── README.md (this file)
├── SETUP_LOCAL.md - Local development setup
├── SETUP_ENVIRONMENT_VARIABLES.md - Environment variables guide
├── DEPLOY_VERCEL_INTEGRATIONS.md - Complete Vercel deployment
├── QUICK_SETUP_SECRETS.md - Quick secrets setup (40 min)
├── RECOMMENDED_SECRETS_STRATEGY.md - Secrets management strategy
├── STRIPE_PRICING_SYNC.md - Stripe setup and pricing management
├── AI_ASSISTANT_CONTEXT.md - AI assistant context
└── DEPLOYMENT_CHECKLIST.md - Pre-deployment checklist (root)
```

---

## 🔄 Documentation Updates

This documentation is actively maintained. If you find:
- Outdated information
- Missing steps
- Unclear instructions

Please update the relevant document or create an issue.

---

## 💡 Tips

- **New to the project?** Start with [Local Setup](./SETUP_LOCAL.md)
- **Deploying?** Use [Vercel Integrations Guide](./DEPLOY_VERCEL_INTEGRATIONS.md)
- **Setting up secrets?** Follow [Quick Setup](./QUICK_SETUP_SECRETS.md) for fastest path
- **Need details?** Check [Secrets Strategy](./RECOMMENDED_SECRETS_STRATEGY.md) for comprehensive approach

---

Last Updated: 2025-01-09
