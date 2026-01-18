# AppShot.ai - SaaS Screenshot & ASO Tool

> Professional app screenshot generation service for App Store Optimization (ASO)

[![Deployment Status](https://img.shields.io/badge/deployment-ready-brightgreen)](./IMPLEMENTATION_COMPLETE.md)
[![Code Quality](https://img.shields.io/badge/code%20quality-100%25-brightgreen)](./DEPLOYMENT_PREPARATION_SUMMARY.md)

---

## 🎯 What is AppShot.ai?

AppShot.ai is a SaaS platform that automates app screenshot generation and optimization for the App Store and Google Play Store. It helps developers and marketers create professional screenshots quickly for ASO (App Store Optimization).

### Key Features

- 📱 **App Store Screenshots**: Automatically fetch screenshots from iOS App Store
- 🤖 **Google Play Screenshots**: Extract screenshots from Google Play Store
- 📦 **Bulk Download**: Download all screenshots as a ZIP file
- 🔐 **User Management**: Authentication with Clerk
- 💳 **Subscription Plans**: Stripe-powered billing with multiple tiers
- ⚡ **Fast & Reliable**: Built with Next.js 15 and modern tech stack

---

## 🏗️ Project Structure

```
AppShot.ai/
├── apps/
│   ├── web/          ← Main Next.js application (SaaS frontend)
│   ├── api/          ← FastAPI backend (optional companion service)
│   └── admin/        ← Admin dashboard
├── packages/
│   ├── ui/           ← Shared UI components
│   ├── types/        ← TypeScript type definitions
│   └── shared/       ← Shared utilities
├── infrastructure/
│   ├── docker/       ← Docker configurations
│   ├── k8s/          ← Kubernetes manifests
│   └── terraform/    ← Infrastructure as Code
├── scripts/          ← Automation scripts
└── docs/             ← Documentation
```

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd AppShot.ai---SaaS-Screenshot-ASO-Tool

# 2. Install dependencies
npm install

# 3. Run setup wizard (interactive)
npm run setup:services

# 4. Start development
npm run web:dev
```

### Option 2: Manual Setup

See [QUICK_START.md](./QUICK_START.md) for detailed instructions.

---

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Python** 3.12+ (for API service)
- **PostgreSQL** 16+ (or use Docker)
- **Docker** & Docker Compose (optional, for local services)

### Required External Services

- **Clerk** - User authentication
- **Stripe** - Payment processing
- **Cloudflare R2** or **AWS S3** - File storage
- **Redis** - Caching (optional but recommended)

---

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev                    # Start all apps
npm run web:dev               # Start web app only
npm run api:dev               # Start API only

# Building
npm run build                 # Build all apps
npm run web:build             # Build web app only

# Testing
npm run lint                  # Lint all code
npm run env:check             # Verify environment variables

# Setup & Deployment
npm run setup:services        # Interactive setup wizard
npm run setup:database        # Database setup wizard
npm run deploy:vercel         # Deploy to Vercel (full wizard)
npm run check:deployment      # Check deployment readiness

# Database
npm run prisma:generate       # Generate Prisma Client
npm run prisma:migrate        # Run migrations
npm run prisma:studio         # Open Prisma Studio

# Stripe
npm run stripe:sync           # Sync Stripe pricing
npm run stripe:check          # Verify Stripe setup
```

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure services** (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)):
   - Clerk (authentication)
   - Stripe (payments)
   - PostgreSQL (database)
   - R2/S3 (storage)
   - Redis (caching)

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
   ```

---

## 📚 Documentation

### Essential Guides

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICK_START.md](./QUICK_START.md)** | Fast 5-step deployment | 5 min |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Complete deployment guide | 30 min |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Command cheat sheet | 2 min |
| **[DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)** | Documentation navigation | 5 min |

### Setup Guides

- [Setup Environment Variables](./docs/SETUP_ENVIRONMENT_VARIABLES.md)
- [Setup Local Development](./docs/SETUP_LOCAL.md)
- [Vercel Deployment with Integrations](./docs/DEPLOY_VERCEL_INTEGRATIONS.md)
- [Quick Secrets Setup (40 min)](./docs/QUICK_SETUP_SECRETS.md)
- [Stripe Configuration](./docs/STRIPE_PRICING_SYNC.md)

### Reference

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
- [Deployment Preparation](./DEPLOYMENT_PREPARATION_SUMMARY.md)

---

## 🚢 Deployment

### Vercel (Recommended for Web App)

```bash
# Option 1: Use deployment wizard
npm run deploy:vercel

# Option 2: Manual deployment
vercel --prod
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

### Docker

```bash
# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Start for development
docker-compose -f infrastructure/docker/docker-compose.dev.yml up
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f infrastructure/k8s/base
kubectl apply -f infrastructure/k8s/apps
```

---

## 🏢 Tech Stack

### Frontend (Web App)
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Tailwind CSS** - Styling
- **Clerk** - Authentication
- **Stripe** - Payments
- **Prisma** - ORM
- **TanStack Query** - Data fetching

### Backend (API)
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Celery** - Background tasks
- **Redis** - Caching & queues

### Infrastructure
- **PostgreSQL 16** - Database
- **Redis 7** - Cache & queue
- **Cloudflare R2** - File storage
- **Vercel** - Web hosting
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Terraform** - Infrastructure as Code

---

## 🎯 Deployment Status

**Status**: ✅ **100% Ready for Deployment**

- ✅ Code quality: No linter errors
- ✅ TypeScript: Fully typed
- ✅ Database: Schema and migrations ready
- ✅ Infrastructure: Docker, K8s, Terraform configured
- ✅ CI/CD: GitHub Actions pipelines active
- ✅ Documentation: Comprehensive guides available
- ✅ Automation: Interactive setup wizards

**What's needed**: Configure external services (Clerk, Stripe, Database, Storage)

Run `npm run check:deployment` to verify readiness.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 🆘 Support

### Quick Help

```bash
# Check what's needed
npm run check:deployment

# Interactive setup
npm run setup:services

# Verify configuration
npm run env:check
```

### Documentation

- **Getting Started**: [QUICK_START.md](./QUICK_START.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Commands**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **All Docs**: [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)

### Common Issues

See [Troubleshooting](./DEPLOYMENT_GUIDE.md#-troubleshooting) in the deployment guide.

---

## 🎉 Ready to Deploy?

1. **Check readiness**: `npm run check:deployment`
2. **Run setup**: `npm run setup:services`
3. **Deploy**: `npm run deploy:vercel`

For detailed guidance, see [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md).

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
