# AppShot.ai - SaaS Screenshot ASO Tool

This is a monorepo for AppShot.ai - a SaaS tool for generating app screenshots for ASO (App Store Optimization).

## Project Structure

- [apps/web](./apps/web) - Next.js web application
- [apps/api](./apps/api) - FastAPI backend
- [apps/admin](./apps/admin) - Admin panel (placeholder)
- [packages/ui](./packages/ui) - Shared UI components
- [packages/types](./packages/types) - Shared TypeScript types
- [packages/shared](./packages/shared) - Shared utilities
- [infrastructure/docker](./infrastructure/docker) - Docker configurations
- [infrastructure/k8s](./infrastructure/k8s) - Kubernetes configurations
- [infrastructure/terraform](./infrastructure/terraform) - Infrastructure as Code

## Recent Updates

The repository was recently updated with:
- Updated web app dependencies to latest stable versions (React 19.1.2, Next.js 15.2.3, etc.)
- Updated API app dependencies to latest stable versions (FastAPI 0.117.0, uvicorn 0.36.2, etc.)
- Updated Turbo dependency to version 2.3.7 in the root package.json

## Development

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose
- Doppler CLI (for secrets management)

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup environment: `npm run setup:env` or `npm run doppler:init`
4. Run in development mode: `npm run dev`

For detailed setup instructions, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).

## Scripts

The project uses npm scripts for various tasks:

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps
- `npm run web:dev` - Start web app in development mode
- `npm run api:dev` - Start API in development mode
- `npm run stripe:sync` - Sync Stripe product/price information
- `npm run doppler:init` - Initialize Doppler configuration

## Deployment

Deployment configurations for various platforms are located in the [infrastructure](./infrastructure) directory.

