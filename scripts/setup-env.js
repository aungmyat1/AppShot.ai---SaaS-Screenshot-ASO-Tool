#!/usr/bin/env node

/**
 * Setup Script for AppShot.ai
 *
 * This script helps with initial environment configuration by:
 * 1. Checking if .env.local exists
 * 2. Creating it from .env.example if it doesn't exist
 * 3. Printing next steps for required values
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const exampleEnvPath = '.env.example';
const localEnvPath = '.env.local';

console.log('AppShot.ai - Initial Environment Setup');

// Check if .env.local already exists
if (fs.existsSync(localEnvPath)) {
  console.log('.env.local already exists. Skipping setup.');
  console.log('If you want to recreate it, delete the existing file first.');
  process.exit(0);
}

// Check if .env.example exists
if (!fs.existsSync(exampleEnvPath)) {
  console.error('.env.example file not found!');
  process.exit(1);
}

// Copy .env.example to .env.local
try {
  fs.copyFileSync(exampleEnvPath, localEnvPath);
  console.log(`Created ${localEnvPath} from ${exampleEnvPath}`);
} catch (err) {
  console.error(`Failed to copy file: ${err.message}`);
  process.exit(1);
}

console.log('\nEnvironment file created successfully!');
console.log('\nImportant: You need to configure the following values in your .env.local file:');
console.log('- Database URL (DATABASE_URL)');
console.log('- Clerk API keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)');
console.log('- Stripe API keys (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, etc.)');
console.log('- Storage credentials (R2 or S3 configuration)');
console.log('- JWT secret (JWT_SECRET_KEY) - change from default!');

console.log('\nFor detailed instructions, see docs/SETUP_ENVIRONMENT_VARIABLES.md');

// Ask if user wants to run database migrations
askRunMigrations();

function askRunMigrations() {
  rl.question('\nWould you like to run database migrations now? (y/N): ', (answer) => {
    if (answer.toLowerCase().startsWith('y')) {
      runMigrations();
    } else {
      console.log('Remember to run database migrations before starting the application.');
      console.log('Command: npx prisma migrate deploy --schema apps/web/prisma/schema.prisma');
      rl.close();
    }
  });
}

function runMigrations() {
  console.log('Checking for Prisma installation...');
  
  // Try to run migrations
  const { spawn } = require('child_process');
  
  const migrateProcess = spawn('npx', ['prisma', 'migrate', 'deploy', '--schema', 'apps/web/prisma/schema.prisma'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  migrateProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Database migrations completed successfully!');
    } else {
      console.log('Database migrations failed. Please check your database configuration.');
    }
    rl.close();
  });
  
  migrateProcess.on('error', (err) => {
    console.error('Error running migrations:', err.message);
    console.log('\nMake sure you have installed dependencies first (npm install)');
    console.log('Also ensure you have a database running and configured in your .env.local file');
    rl.close();
  });
}