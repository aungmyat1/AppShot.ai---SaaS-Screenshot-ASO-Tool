#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up PostgreSQL database and runs migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

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

function printSuccess(msg) {
  print(`✓ ${msg}`, colors.green);
}

function printInfo(msg) {
  print(`ℹ ${msg}`, colors.blue);
}

function printWarning(msg) {
  print(`⚠ ${msg}`, colors.yellow);
}

function printError(msg) {
  print(`✗ ${msg}`, colors.red);
}

function runCommand(command, silent = false) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkDatabaseConnection(dbUrl) {
  print('\nTesting database connection...');
  
  // Create a temporary test script
  const testScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function test() {
  try {
    await prisma.$connect();
    console.log('Connection successful');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

test();
  `;

  fs.writeFileSync('test-db-connection.js', testScript);

  const result = runCommand(`DATABASE_URL="${dbUrl}" node test-db-connection.js`, false);
  
  fs.unlinkSync('test-db-connection.js');
  
  if (result.success) {
    printSuccess('Database connection successful!');
    return true;
  } else {
    printError('Database connection failed!');
    return false;
  }
}

async function setupLocalDocker() {
  printHeader('🐳 Setting up Local PostgreSQL with Docker');
  
  // Check if Docker is installed
  const dockerCheck = runCommand('docker --version', true);
  
  if (!dockerCheck.success) {
    printError('Docker is not installed or not running.');
    print('\nInstall Docker from: https://www.docker.com/get-started');
    return null;
  }

  printSuccess('Docker is installed');
  
  // Check if container already exists
  const containerName = 'getappshots-db';
  const existing = runCommand(`docker ps -a --filter name=${containerName} --format "{{.Names}}"`, true);
  
  if (existing.success && existing.output.includes(containerName)) {
    printWarning(`Container '${containerName}' already exists`);
    const remove = await question('Remove existing container and create new? (y/n): ');
    
    if (remove.toLowerCase() === 'y') {
      print('Stopping and removing existing container...');
      runCommand(`docker stop ${containerName}`, true);
      runCommand(`docker rm ${containerName}`, true);
    } else {
      print('Starting existing container...');
      const start = runCommand(`docker start ${containerName}`, false);
      if (start.success) {
        printSuccess('Container started');
        return 'postgresql://postgres:postgres@localhost:5432/getappshots?schema=public';
      }
      return null;
    }
  }

  // Get configuration
  const useDefaults = await question('\nUse default configuration? (y/n): ');
  
  let dbName, dbUser, dbPassword, dbPort;
  
  if (useDefaults.toLowerCase() === 'y') {
    dbName = 'getappshots';
    dbUser = 'postgres';
    dbPassword = 'postgres';
    dbPort = '5432';
  } else {
    dbName = await question('Database name (default: getappshots): ') || 'getappshots';
    dbUser = await question('Database user (default: postgres): ') || 'postgres';
    dbPassword = await question('Database password (default: postgres): ') || 'postgres';
    dbPort = await question('Port (default: 5432): ') || '5432';
  }

  print('\nStarting PostgreSQL container...');
  
  const dockerCmd = `docker run --name ${containerName} \
    -e POSTGRES_DB=${dbName} \
    -e POSTGRES_USER=${dbUser} \
    -e POSTGRES_PASSWORD=${dbPassword} \
    -p ${dbPort}:5432 \
    -d postgres:16-alpine`;

  const result = runCommand(dockerCmd, false);
  
  if (result.success) {
    printSuccess('PostgreSQL container started!');
    
    // Wait for database to be ready
    print('\nWaiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const dbUrl = `postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}?schema=public`;
    
    print('\nDatabase connection string:');
    printInfo(dbUrl);
    
    return dbUrl;
  } else {
    printError('Failed to start PostgreSQL container');
    return null;
  }
}

async function setupCloudDatabase() {
  printHeader('☁️ Cloud Database Setup');
  
  print('Choose your cloud database provider:\n');
  print('1. Vercel Postgres (Recommended for Vercel deployments)');
  print('2. Neon (Serverless PostgreSQL)');
  print('3. Supabase (PostgreSQL with additional features)');
  print('4. AWS RDS');
  print('5. Google Cloud SQL');
  print('6. I already have a connection string\n');

  const choice = await question('Enter choice (1-6): ');

  switch (choice) {
    case '1':
      print('\n📋 Vercel Postgres Setup:');
      print('1. Go to your Vercel project dashboard');
      print('2. Click "Storage" tab');
      print('3. Click "Create Database" → "Postgres"');
      print('4. Choose a region close to your users');
      print('5. Copy the DATABASE_URL from the connection details\n');
      break;

    case '2':
      print('\n📋 Neon Setup:');
      print('1. Go to https://neon.tech');
      print('2. Sign up and create a new project');
      print('3. Create a database');
      print('4. Copy the connection string\n');
      break;

    case '3':
      print('\n📋 Supabase Setup:');
      print('1. Go to https://supabase.com');
      print('2. Create a new project');
      print('3. Wait for the database to be provisioned');
      print('4. Go to Settings → Database');
      print('5. Copy the connection string (choose "Prisma" format)\n');
      break;

    case '4':
      print('\n📋 AWS RDS Setup:');
      print('1. Go to AWS RDS Console');
      print('2. Create a new PostgreSQL database');
      print('3. Configure security groups to allow connections');
      print('4. Get connection details after creation\n');
      break;

    case '5':
      print('\n📋 Google Cloud SQL Setup:');
      print('1. Go to Google Cloud Console');
      print('2. Navigate to SQL');
      print('3. Create a PostgreSQL instance');
      print('4. Create a database and user');
      print('5. Get connection details\n');
      break;

    case '6':
      break;

    default:
      printError('Invalid choice');
      return null;
  }

  await question('Press Enter when you have your connection string...');
  const dbUrl = await question('\nEnter your DATABASE_URL: ');
  
  return dbUrl;
}

async function runPrismaMigrations(dbUrl) {
  printHeader('🔄 Running Database Migrations');
  
  print('This will apply all pending migrations to your database.\n');
  
  const confirm = await question('Continue with migrations? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    printWarning('Migrations skipped');
    return false;
  }

  // Generate Prisma Client first
  print('\nGenerating Prisma Client...');
  const generate = runCommand('npx prisma generate --schema apps/web/prisma/schema.prisma', false);
  
  if (!generate.success) {
    printError('Failed to generate Prisma Client');
    return false;
  }

  // Run migrations
  print('\nRunning migrations...');
  const migrate = runCommand(
    `DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema apps/web/prisma/schema.prisma`,
    false
  );

  if (migrate.success) {
    printSuccess('Migrations completed successfully!');
    return true;
  } else {
    printError('Migrations failed');
    return false;
  }
}

async function seedDatabase(dbUrl) {
  printHeader('🌱 Database Seeding');
  
  print('Would you like to seed the database with sample data?\n');
  printWarning('This is optional and only recommended for development.');
  
  const seed = await question('\nSeed database? (y/n): ');
  
  if (seed.toLowerCase() !== 'y') {
    printInfo('Skipping database seeding');
    return true;
  }

  // Check if seed script exists
  if (!fs.existsSync('apps/web/prisma/seed.ts') && !fs.existsSync('apps/web/prisma/seed.js')) {
    printWarning('No seed script found');
    return true;
  }

  print('\nSeeding database...');
  const result = runCommand(
    `DATABASE_URL="${dbUrl}" npx prisma db seed --schema apps/web/prisma/schema.prisma`,
    false
  );

  if (result.success) {
    printSuccess('Database seeded successfully!');
    return true;
  } else {
    printWarning('Seeding failed or not configured');
    return true; // Non-critical
  }
}

async function saveToEnv(dbUrl) {
  printHeader('💾 Saving Configuration');
  
  const envPath = '.env.local';
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Remove existing DATABASE_URL
    envContent = envContent.replace(/^DATABASE_URL=.*/gm, '');
  }

  // Add DATABASE_URL
  if (!envContent.includes('# Database')) {
    envContent += '\n# Database\n';
  }
  envContent += `DATABASE_URL="${dbUrl}"\n`;

  fs.writeFileSync(envPath, envContent);
  printSuccess(`Configuration saved to ${envPath}`);
}

async function viewDatabaseInfo(dbUrl) {
  printHeader('📊 Database Information');
  
  print('Running Prisma Studio to explore your database...');
  print('This will open a web interface at http://localhost:5555\n');
  printWarning('Press Ctrl+C to close Prisma Studio when done.\n');
  
  const open = await question('Open Prisma Studio? (y/n): ');
  
  if (open.toLowerCase() === 'y') {
    runCommand(
      `DATABASE_URL="${dbUrl}" npx prisma studio --schema apps/web/prisma/schema.prisma`,
      false
    );
  }
}

async function main() {
  printHeader('🗄️ Database Setup Wizard');
  
  print('This wizard will help you set up your PostgreSQL database.\n');
  
  print('Choose setup option:');
  print('1. Local PostgreSQL (Docker)');
  print('2. Cloud Database Provider');
  print('3. I already have a DATABASE_URL\n');

  const choice = await question('Enter choice (1-3): ');
  
  let dbUrl;

  switch (choice) {
    case '1':
      dbUrl = await setupLocalDocker();
      break;
    case '2':
      dbUrl = await setupCloudDatabase();
      break;
    case '3':
      dbUrl = await question('Enter your DATABASE_URL: ');
      break;
    default:
      printError('Invalid choice');
      rl.close();
      return;
  }

  if (!dbUrl) {
    printError('Database setup failed');
    rl.close();
    return;
  }

  // Test connection
  const connected = await checkDatabaseConnection(dbUrl);
  
  if (!connected) {
    printError('Could not connect to database. Please check your connection string.');
    rl.close();
    return;
  }

  // Run migrations
  const migrated = await runPrismaMigrations(dbUrl);
  
  if (!migrated) {
    printWarning('Migrations were not completed. You can run them later with:');
    print('npx prisma migrate deploy --schema apps/web/prisma/schema.prisma');
  }

  // Seed database (optional)
  await seedDatabase(dbUrl);

  // Save to .env
  await saveToEnv(dbUrl);

  // View database info
  await viewDatabaseInfo(dbUrl);

  printHeader('✅ Database Setup Complete!');
  
  print('Next steps:\n');
  print('1. Your DATABASE_URL is saved in .env.local');
  print('2. Database migrations have been applied');
  print('3. You can now start your development server:');
  print('   npm run web:dev\n');
  print('4. To manage your database, use:');
  print('   npx prisma studio --schema apps/web/prisma/schema.prisma\n');

  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  print('\n\nSetup cancelled by user.', colors.yellow);
  rl.close();
  process.exit(0);
});

main().catch(error => {
  printError(`Fatal error: ${error.message}`);
  process.exit(1);
});
