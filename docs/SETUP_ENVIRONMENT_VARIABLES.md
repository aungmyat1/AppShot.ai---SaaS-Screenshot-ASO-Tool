# Setting Up Environment Variables

This document explains how to configure the required environment variables for the AppShot.ai application.

## Prerequisites

Before configuring the environment variables, you need to set up the following external services:

1. [PostgreSQL database](#setting-up-postgresql-database)
2. [Clerk for authentication](#setting-up-clerk-authentication)
3. [Stripe for payment processing](#setting-up-stripe-payment-processing)
4. [Storage service (Cloudflare R2 or AWS S3)](#setting-up-storage-service)
5. [Redis (optional but recommended)](#setting-up-redis-cache-and-queues)

---

## Setting up PostgreSQL Database

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally or use Docker:
   ```bash
   docker run --name getappshots-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
   ```

### Option 2: Cloud PostgreSQL
1. Choose a cloud provider (AWS RDS, Google Cloud SQL, Azure Database, etc.)
2. Create a PostgreSQL instance (version 16 or higher)
3. Note down the connection details (host, port, username, password, database name)

### Running Migrations
After setting up the database, run the Prisma migrations:

```bash
# From the project root
npx prisma migrate deploy --schema apps/web/prisma/schema.prisma
```

---

## Setting up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create an account
2. Create a new application
3. In the "Settings" > "API Keys" section, copy your:
   - Publishable key (starts with `pk_test_` or `pk_live_`)
   - Secret key (starts with `sk_test_` or `sk_live_`)
4. In the "Settings" > "Redirect URLs" section, add:
   - For local development: `http://localhost:3000`, `http://localhost:3000/sign-in`, `http://localhost:3000/sign-up`
   - For production: Your production domain
5. In the "Settings" > "Session Console" section, set:
   - Session lifetime: As desired
   - Session refresh: As desired

---

## Setting up Stripe Payment Processing

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and create an account
2. Navigate to "Developers" > "API keys" and copy your:
   - Secret key (starts with `sk_test_` for testing or `sk_live_` for production)
   - Publishable key (starts with `pk_test_` for testing or `pk_live_` for production)
3. Go to "Products" and create your subscription products:
   - Create a "Pro" plan and note the price ID (starts with `price_`)
   - Create a "Starter" plan if needed
4. Set up a webhook endpoint:
   - Navigate to "Developers" > "Webhooks"
   - Click "Add endpoint"
   - Enter your endpoint URL:
     - Local: `http://localhost:3000/api/stripe/webhook` (using a tunnel service like ngrok)
     - Production: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `invoice.created`
     - `invoice.finalized`
   - Click "Add endpoint" and copy the signing secret (starts with `whsec_`)

---

## Setting up Storage Service

Choose either Cloudflare R2 (recommended) or AWS S3:

### Option 1: Cloudflare R2 (Recommended)

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Navigate to R2 in the dashboard
3. Create a new bucket
4. Go to "R2 API" and create an "R2 API Token" or use your Account ID and Access Keys
5. Note down:
   - Account ID
   - Bucket name
   - Access Key ID
   - Secret Access Key

### Option 2: AWS S3

1. Sign up for an [AWS account](https://aws.amazon.com/) if you don't have one
2. Navigate to S3 in the AWS Console
3. Create a new bucket
4. Go to IAM and create a new user with programmatic access
5. Attach the `AmazonS3FullAccess` policy or create a custom policy with the permissions your app needs
6. Note down:
   - Bucket name
   - Region
   - Access Key ID
   - Secret Access Key

---

## Setting up Redis (Cache and Queues)

### Option 1: Local Redis
1. Install Redis locally or use Docker:
   ```bash
   docker run --name getappshots-redis -p 6379:6379 -d redis:7-alpine
   ```

### Option 2: Cloud Redis
1. Choose a cloud provider:
   - AWS ElastiCache
   - Google Cloud Memorystore
   - Azure Cache for Redis
   - Or managed Redis providers like Upstash
2. Create a Redis instance
3. Note down the connection URL

---

## Using Environment Variables

### Copy the Example File

```bash
cp .env.example .env.local
```

### Update Values

Edit the `.env.local` file and replace placeholder values with your actual configuration:

1. Replace `DATABASE_URL` with your PostgreSQL connection string
2. Replace Clerk credentials with your actual keys
3. Replace Stripe credentials with your actual keys
4. Replace storage credentials with your actual configuration
5. Update JWT secret key with a secure random string

### Important Security Notes

1. **Never commit** your `.env` files to version control
2. Change the default `JWT_SECRET_KEY` to a secure random string
3. Use strong passwords and API keys
4. In production, use your platform's secure environment variable management (Vercel, Heroku, etc.)

---

## Testing Your Configuration

After setting up all environment variables:

1. Install dependencies: `npm install`
2. Run the development server: `npm run web:dev`
3. Check that the application starts without errors related to missing environment variables
4. Test authentication, payment, and storage functionality as appropriate