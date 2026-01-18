#!/usr/bin/env node

/**
 * Interactive External Services Setup Guide
 * Walks through setting up Clerk, Stripe, Database, and Storage
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function print(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(`${colors.cyan}${query}${colors.reset}`, resolve));
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  print(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function printSection(title) {
  print(`\n${title}`, colors.bright + colors.yellow);
  console.log('-'.repeat(60));
}

function printSuccess(msg) {
  print(`✓ ${msg}`, colors.green);
}

function printInfo(msg) {
  print(`ℹ ${msg}`, colors.blue);
}

function printWarning(msg) {
  print(`⚠ ${msg}`, colors.yellow);
}

const envVars = {};

async function setupClerk() {
  printSection('🔐 Setting up Clerk Authentication');
  
  print('\nClerk provides authentication and user management.\n');
  print('Steps to set up Clerk:');
  print('1. Go to https://dashboard.clerk.com');
  print('2. Sign up or log in');
  print('3. Click "Add application"');
  print('4. Choose "Next.js" as the framework');
  print('5. Copy your API keys\n');

  const hasClerk = await question('Have you already created a Clerk application? (y/n): ');
  
  if (hasClerk.toLowerCase() !== 'y') {
    print('\n📋 Follow these steps:');
    print('1. Open https://dashboard.clerk.com in your browser');
    print('2. Create a new application');
    print('3. Come back here when ready\n');
    
    await question('Press Enter when you\'re ready to continue...');
  }

  printInfo('\nNow let\'s collect your Clerk credentials:');
  
  envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = await question('\nEnter your Clerk Publishable Key (pk_test_...): ');
  envVars.CLERK_SECRET_KEY = await question('Enter your Clerk Secret Key (sk_test_...): ');
  envVars.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/sign-in';
  envVars.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/sign-up';
  
  const adminEmails = await question('Enter admin email addresses (comma-separated): ');
  envVars.ADMIN_EMAILS = adminEmails;

  printSuccess('Clerk configuration collected!');
  
  print('\n📝 Don\'t forget to configure redirect URLs in Clerk Dashboard:');
  print('   - Development: http://localhost:3000');
  print('   - Production: https://yourdomain.com');
}

async function setupStripe() {
  printSection('💳 Setting up Stripe Payments');
  
  print('\nStripe handles payments and subscriptions.\n');
  print('Steps to set up Stripe:');
  print('1. Go to https://dashboard.stripe.com');
  print('2. Sign up or log in');
  print('3. Go to Developers > API Keys');
  print('4. Copy your API keys');
  print('5. Create products and pricing plans');
  print('6. Set up webhook endpoint\n');

  const hasStripe = await question('Have you already created a Stripe account? (y/n): ');
  
  if (hasStripe.toLowerCase() !== 'y') {
    print('\n📋 Follow these steps:');
    print('1. Open https://dashboard.stripe.com in your browser');
    print('2. Create an account');
    print('3. Create products and pricing plans');
    print('4. Come back here when ready\n');
    
    await question('Press Enter when you\'re ready to continue...');
  }

  printInfo('\nLet\'s collect your Stripe credentials:');
  
  const testMode = await question('\nAre you using test mode? (y/n, recommended for development): ');
  const isTest = testMode.toLowerCase() === 'y';
  
  envVars.STRIPE_SECRET_KEY = await question(`Enter your Stripe Secret Key (sk_${isTest ? 'test' : 'live'}_...): `);
  envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = await question(`Enter your Stripe Publishable Key (pk_${isTest ? 'test' : 'live'}_...): `);
  
  print('\n📋 Now create a webhook endpoint:');
  print('1. Go to Developers > Webhooks in Stripe Dashboard');
  print('2. Click "Add endpoint"');
  print('3. For local: http://localhost:3000/api/stripe/webhook');
  print('4. For production: https://yourdomain.com/api/stripe/webhook');
  print('5. Select these events:');
  print('   - customer.subscription.created');
  print('   - customer.subscription.updated');
  print('   - customer.subscription.deleted');
  print('   - invoice.paid');
  print('   - invoice.payment_failed\n');
  
  await question('Press Enter after creating the webhook...');
  
  envVars.STRIPE_WEBHOOK_SECRET = await question('Enter your Webhook Secret (whsec_...): ');
  
  print('\n📋 Now let\'s get your pricing plan IDs:');
  print('1. Go to Products in Stripe Dashboard');
  print('2. Click on your Pro/Premium plan');
  print('3. Copy the Price ID (starts with price_...)\n');
  
  const priceId = await question('Enter your Pro plan Price ID (price_...): ');
  envVars.STRIPE_PRICE_PRO = priceId;
  envVars.NEXT_PUBLIC_STRIPE_PRICE_PRO = priceId;

  printSuccess('Stripe configuration collected!');
}

async function setupDatabase() {
  printSection('🗄️ Setting up PostgreSQL Database');
  
  print('\nYou need a PostgreSQL database (version 16+ recommended).\n');
  print('Choose your database option:');
  print('1. Vercel Postgres (Recommended - one-click setup)');
  print('2. Local Docker (For development)');
  print('3. Cloud Provider (AWS RDS, Neon, Supabase, etc.)');
  print('4. I already have a database URL\n');

  const dbChoice = await question('Enter your choice (1-4): ');

  switch (dbChoice) {
    case '1':
      print('\n📋 Setting up Vercel Postgres:');
      print('1. Go to your Vercel project dashboard');
      print('2. Click "Storage" tab');
      print('3. Click "Create Database" > "Postgres"');
      print('4. Choose a region close to your users');
      print('5. Copy the DATABASE_URL from the .env.local tab\n');
      
      await question('Press Enter after creating the database...');
      envVars.DATABASE_URL = await question('Enter your DATABASE_URL: ');
      break;

    case '2':
      print('\n📋 Setting up Local Docker PostgreSQL:');
      print('Run this command in your terminal:\n');
      print('docker run --name getappshots-db \\');
      print('  -e POSTGRES_PASSWORD=postgres \\');
      print('  -p 5432:5432 \\');
      print('  -d postgres:16-alpine\n');
      
      const runDocker = await question('Should I run this command for you? (y/n): ');
      
      if (runDocker.toLowerCase() === 'y') {
        try {
          execSync('docker run --name getappshots-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine', 
            { stdio: 'inherit' });
          printSuccess('Docker PostgreSQL started!');
          envVars.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/getappshots?schema=public';
          printInfo(`Using DATABASE_URL: ${envVars.DATABASE_URL}`);
        } catch (error) {
          printWarning('Failed to start Docker. Please run the command manually.');
          envVars.DATABASE_URL = await question('Enter your DATABASE_URL: ');
        }
      } else {
        print('\nDefault local URL: postgresql://postgres:postgres@localhost:5432/getappshots?schema=public');
        envVars.DATABASE_URL = await question('Enter your DATABASE_URL (or press Enter for default): ') 
          || 'postgresql://postgres:postgres@localhost:5432/getappshots?schema=public';
      }
      break;

    case '3':
      print('\n📋 Cloud Provider Setup:');
      print('Follow your provider\'s instructions to create a PostgreSQL database.');
      print('Make sure to get the connection string in this format:');
      print('postgresql://username:password@host:5432/database?sslmode=require\n');
      
      await question('Press Enter when you have your database URL...');
      envVars.DATABASE_URL = await question('Enter your DATABASE_URL: ');
      break;

    case '4':
      envVars.DATABASE_URL = await question('Enter your DATABASE_URL: ');
      break;

    default:
      printWarning('Invalid choice. Skipping database setup.');
  }

  if (envVars.DATABASE_URL) {
    printSuccess('Database configuration collected!');
    
    print('\n📋 After setup, you\'ll need to run migrations:');
    print('npx prisma migrate deploy --schema apps/web/prisma/schema.prisma');
  }
}

async function setupStorage() {
  printSection('📦 Setting up Cloud Storage (R2/S3)');
  
  print('\nYou need cloud storage for screenshots and files.\n');
  print('Choose your storage option:');
  print('1. Cloudflare R2 (Recommended - S3-compatible, no egress fees)');
  print('2. AWS S3');
  print('3. I already have credentials\n');

  const storageChoice = await question('Enter your choice (1-3): ');

  switch (storageChoice) {
    case '1':
      print('\n📋 Setting up Cloudflare R2:');
      print('1. Go to https://dash.cloudflare.com');
      print('2. Navigate to R2 Object Storage');
      print('3. Create a bucket (e.g., getappshots-prod)');
      print('4. Go to "Manage R2 API Tokens"');
      print('5. Create an API token with "Edit" permissions\n');
      
      await question('Press Enter after creating bucket and token...');
      
      envVars.R2_ACCOUNT_ID = await question('Enter your R2 Account ID: ');
      envVars.R2_BUCKET_NAME = await question('Enter your R2 Bucket Name: ');
      envVars.R2_ACCESS_KEY_ID = await question('Enter your R2 Access Key ID: ');
      envVars.R2_SECRET_ACCESS_KEY = await question('Enter your R2 Secret Access Key: ');
      
      // Set storage vars (both R2 and generic)
      envVars.STORAGE_ENDPOINT_URL = `https://${envVars.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
      envVars.STORAGE_BUCKET = envVars.R2_BUCKET_NAME;
      envVars.STORAGE_REGION = 'auto';
      envVars.STORAGE_ACCESS_KEY_ID = envVars.R2_ACCESS_KEY_ID;
      envVars.STORAGE_SECRET_ACCESS_KEY = envVars.R2_SECRET_ACCESS_KEY;
      
      const hasPublicUrl = await question('\nDo you have a public R2 domain configured? (y/n): ');
      if (hasPublicUrl.toLowerCase() === 'y') {
        envVars.STORAGE_PUBLIC_BASE_URL = await question('Enter your public R2 URL: ');
      }
      break;

    case '2':
      print('\n📋 Setting up AWS S3:');
      print('1. Go to https://console.aws.amazon.com/s3');
      print('2. Create a bucket');
      print('3. Go to IAM > Users > Create user');
      print('4. Attach S3 permissions');
      print('5. Create access keys\n');
      
      await question('Press Enter after creating bucket and IAM user...');
      
      envVars.STORAGE_BUCKET = await question('Enter your S3 Bucket Name: ');
      envVars.STORAGE_REGION = await question('Enter your AWS Region (e.g., us-east-1): ');
      envVars.STORAGE_ACCESS_KEY_ID = await question('Enter your AWS Access Key ID: ');
      envVars.STORAGE_SECRET_ACCESS_KEY = await question('Enter your AWS Secret Access Key: ');
      envVars.STORAGE_ENDPOINT_URL = `https://s3.${envVars.STORAGE_REGION}.amazonaws.com`;
      break;

    case '3':
      print('\nEnter your storage credentials:\n');
      envVars.STORAGE_BUCKET = await question('Bucket Name: ');
      envVars.STORAGE_REGION = await question('Region: ');
      envVars.STORAGE_ACCESS_KEY_ID = await question('Access Key ID: ');
      envVars.STORAGE_SECRET_ACCESS_KEY = await question('Secret Access Key: ');
      envVars.STORAGE_ENDPOINT_URL = await question('Endpoint URL: ');
      break;

    default:
      printWarning('Invalid choice. Skipping storage setup.');
  }

  if (envVars.STORAGE_BUCKET) {
    printSuccess('Storage configuration collected!');
  }
}

async function setupRedis() {
  printSection('🔄 Setting up Redis (Optional)');
  
  print('\nRedis is optional but recommended for caching and queues.\n');
  
  const wantsRedis = await question('Do you want to set up Redis? (y/n): ');
  
  if (wantsRedis.toLowerCase() !== 'y') {
    printInfo('Skipping Redis setup. App will work without it.');
    return;
  }

  print('\nChoose your Redis option:');
  print('1. Vercel KV (Recommended for Vercel deployments)');
  print('2. Local Docker (For development)');
  print('3. Cloud Provider (Upstash, AWS ElastiCache, etc.)');
  print('4. I already have a Redis URL\n');

  const redisChoice = await question('Enter your choice (1-4): ');

  switch (redisChoice) {
    case '1':
      print('\n📋 Setting up Vercel KV:');
      print('1. Go to your Vercel project dashboard');
      print('2. Click "Storage" tab');
      print('3. Click "Create Database" > "KV"');
      print('4. Copy the KV_URL or REDIS_URL\n');
      
      await question('Press Enter after creating KV database...');
      envVars.REDIS_URL = await question('Enter your REDIS_URL: ');
      break;

    case '2':
      print('\n📋 Setting up Local Docker Redis:');
      print('Run this command in your terminal:\n');
      print('docker run --name getappshots-redis -p 6379:6379 -d redis:7-alpine\n');
      
      const runRedis = await question('Should I run this command for you? (y/n): ');
      
      if (runRedis.toLowerCase() === 'y') {
        try {
          execSync('docker run --name getappshots-redis -p 6379:6379 -d redis:7-alpine', 
            { stdio: 'inherit' });
          printSuccess('Docker Redis started!');
          envVars.REDIS_URL = 'redis://localhost:6379';
          printInfo(`Using REDIS_URL: ${envVars.REDIS_URL}`);
        } catch (error) {
          printWarning('Failed to start Docker. Please run the command manually.');
          envVars.REDIS_URL = await question('Enter your REDIS_URL: ');
        }
      } else {
        envVars.REDIS_URL = 'redis://localhost:6379';
      }
      break;

    case '3':
      print('\nFollow your provider\'s instructions to get the Redis URL.\n');
      envVars.REDIS_URL = await question('Enter your REDIS_URL: ');
      break;

    case '4':
      envVars.REDIS_URL = await question('Enter your REDIS_URL: ');
      break;

    default:
      printWarning('Invalid choice. Skipping Redis setup.');
  }

  if (envVars.REDIS_URL) {
    printSuccess('Redis configuration collected!');
  }
}

function saveToEnvFile() {
  printSection('💾 Saving Configuration');
  
  const envFilePath = path.resolve('.env.local');
  let envContent = '';

  // Add header
  envContent += '# AppShot.ai Environment Configuration\n';
  envContent += `# Generated: ${new Date().toISOString()}\n\n`;

  // Clerk
  if (envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    envContent += '# Clerk Authentication\n';
    envContent += `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}\n`;
    envContent += `CLERK_SECRET_KEY=${envVars.CLERK_SECRET_KEY}\n`;
    envContent += `NEXT_PUBLIC_CLERK_SIGN_IN_URL=${envVars.NEXT_PUBLIC_CLERK_SIGN_IN_URL}\n`;
    envContent += `NEXT_PUBLIC_CLERK_SIGN_UP_URL=${envVars.NEXT_PUBLIC_CLERK_SIGN_UP_URL}\n`;
    envContent += `ADMIN_EMAILS=${envVars.ADMIN_EMAILS}\n\n`;
  }

  // Stripe
  if (envVars.STRIPE_SECRET_KEY) {
    envContent += '# Stripe Payments\n';
    envContent += `STRIPE_SECRET_KEY=${envVars.STRIPE_SECRET_KEY}\n`;
    envContent += `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}\n`;
    envContent += `STRIPE_WEBHOOK_SECRET=${envVars.STRIPE_WEBHOOK_SECRET}\n`;
    envContent += `STRIPE_PRICE_PRO=${envVars.STRIPE_PRICE_PRO}\n`;
    envContent += `NEXT_PUBLIC_STRIPE_PRICE_PRO=${envVars.NEXT_PUBLIC_STRIPE_PRICE_PRO}\n\n`;
  }

  // Database
  if (envVars.DATABASE_URL) {
    envContent += '# Database\n';
    envContent += `DATABASE_URL=${envVars.DATABASE_URL}\n\n`;
  }

  // Storage
  if (envVars.STORAGE_BUCKET) {
    envContent += '# Storage\n';
    if (envVars.R2_ACCOUNT_ID) {
      envContent += `R2_ACCOUNT_ID=${envVars.R2_ACCOUNT_ID}\n`;
      envContent += `R2_BUCKET_NAME=${envVars.R2_BUCKET_NAME}\n`;
      envContent += `R2_ACCESS_KEY_ID=${envVars.R2_ACCESS_KEY_ID}\n`;
      envContent += `R2_SECRET_ACCESS_KEY=${envVars.R2_SECRET_ACCESS_KEY}\n`;
    }
    envContent += `STORAGE_ENDPOINT_URL=${envVars.STORAGE_ENDPOINT_URL}\n`;
    envContent += `STORAGE_BUCKET=${envVars.STORAGE_BUCKET}\n`;
    envContent += `STORAGE_REGION=${envVars.STORAGE_REGION}\n`;
    envContent += `STORAGE_ACCESS_KEY_ID=${envVars.STORAGE_ACCESS_KEY_ID}\n`;
    envContent += `STORAGE_SECRET_ACCESS_KEY=${envVars.STORAGE_SECRET_ACCESS_KEY}\n`;
    if (envVars.STORAGE_PUBLIC_BASE_URL) {
      envContent += `STORAGE_PUBLIC_BASE_URL=${envVars.STORAGE_PUBLIC_BASE_URL}\n`;
    }
    envContent += '\n';
  }

  // Redis
  if (envVars.REDIS_URL) {
    envContent += '# Redis\n';
    envContent += `REDIS_URL=${envVars.REDIS_URL}\n\n`;
  }

  // Additional settings
  envContent += '# Scraping Settings (for Vercel/serverless)\n';
  envContent += 'SCRAPE_QUEUE_MODE=sync\n';
  envContent += 'PLAY_SCRAPE_MODE=html\n';
  envContent += 'PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false\n';

  // Save file
  fs.writeFileSync(envFilePath, envContent);
  printSuccess(`Configuration saved to ${envFilePath}`);
  
  // Print summary
  print('\n📋 Configuration Summary:');
  print(`   - Clerk: ${envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✓' : '✗'}`);
  print(`   - Stripe: ${envVars.STRIPE_SECRET_KEY ? '✓' : '✗'}`);
  print(`   - Database: ${envVars.DATABASE_URL ? '✓' : '✗'}`);
  print(`   - Storage: ${envVars.STORAGE_BUCKET ? '✓' : '✗'}`);
  print(`   - Redis: ${envVars.REDIS_URL ? '✓' : '(optional)'}`);
}

async function main() {
  printHeader('🚀 AppShot.ai External Services Setup');
  
  print('This wizard will help you set up all required external services.\n');
  print('You can press Ctrl+C at any time to exit.\n');
  
  const start = await question('Ready to begin? (y/n): ');
  
  if (start.toLowerCase() !== 'y') {
    print('Setup cancelled.');
    rl.close();
    return;
  }

  try {
    await setupClerk();
    await setupStripe();
    await setupDatabase();
    await setupStorage();
    await setupRedis();
    
    saveToEnvFile();
    
    printHeader('✅ Setup Complete!');
    
    print('Next steps:\n');
    print('1. Run database migrations:');
    print('   npx prisma migrate deploy --schema apps/web/prisma/schema.prisma\n');
    print('2. Verify your configuration:');
    print('   npm run env:check\n');
    print('3. Start development server:');
    print('   npm run web:dev\n');
    print('4. For Vercel deployment, run:');
    print('   node scripts/deploy-to-vercel.js\n');
    
  } catch (error) {
    print(`\nError: ${error.message}`, colors.red);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  print('\n\nSetup cancelled by user.', colors.yellow);
  rl.close();
  process.exit(0);
});

main();
