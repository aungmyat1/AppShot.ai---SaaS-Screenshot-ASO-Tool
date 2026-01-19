#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Automates Vercel deployment with environment variable setup
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

function runCommand(command, description) {
  try {
    print(`\n${description}...`, colors.yellow);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
    printSuccess(`${description} completed`);
    return true;
  } catch (error) {
    printError(`${description} failed: ${error.message}`);
    return false;
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function installVercelCLI() {
  printWarning('Vercel CLI is not installed.');
  const install = await question('Install Vercel CLI globally? (y/n): ');
  
  if (install.toLowerCase() === 'y') {
    return runCommand('npm install -g vercel', 'Installing Vercel CLI');
  }
  return false;
}

async function checkEnvFile() {
  const hasEnvLocal = fs.existsSync('.env.local');
  const hasEnv = fs.existsSync('.env');
  
  if (!hasEnvLocal && !hasEnv) {
    printWarning('No .env.local or .env file found!');
    printInfo('You need environment variables configured before deployment.');
    
    const runSetup = await question('\nRun external services setup wizard? (y/n): ');
    if (runSetup.toLowerCase() === 'y') {
      return runCommand('node scripts/setup-external-services.js', 'Running setup wizard');
    }
    
    printError('Cannot proceed without environment configuration.');
    return false;
  }
  
  printSuccess('Environment file found');
  return true;
}

async function deploymentChecks() {
  printHeader('🔍 Pre-Deployment Checks');
  
  // Check if git is clean
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      printWarning('You have uncommitted changes.');
      const cont = await question('Continue anyway? (y/n): ');
      if (cont.toLowerCase() !== 'y') {
        return false;
      }
    } else {
      printSuccess('Git working directory is clean');
    }
  } catch (error) {
    printWarning('Could not check git status');
  }

  // Run deployment readiness check
  print('\nRunning deployment readiness check...');
  try {
    execSync('npm run check:deployment', { stdio: 'inherit' });
  } catch (error) {
    printError('Deployment readiness check failed');
    const cont = await question('Continue with deployment anyway? (y/n): ');
    if (cont.toLowerCase() !== 'y') {
      return false;
    }
  }

  return true;
}

async function vercelLogin() {
  print('\nChecking Vercel authentication...');
  
  try {
    execSync('vercel whoami', { encoding: 'utf-8', stdio: 'pipe' });
    printSuccess('Already logged in to Vercel');
    return true;
  } catch {
    printWarning('Not logged in to Vercel');
    const login = await question('Log in to Vercel now? (y/n): ');
    
    if (login.toLowerCase() === 'y') {
      return runCommand('vercel login', 'Logging in to Vercel');
    }
    return false;
  }
}

async function linkProject() {
  print('\nChecking if project is linked to Vercel...');
  
  if (fs.existsSync('.vercel')) {
    printSuccess('Project is already linked to Vercel');
    return true;
  }

  printWarning('Project is not linked to Vercel yet');
  const link = await question('Link project now? (y/n): ');
  
  if (link.toLowerCase() === 'y') {
    return runCommand('vercel link', 'Linking project to Vercel');
  }
  return false;
}

async function setupIntegrations() {
  printHeader('🔌 Vercel Integrations Setup');
  
  print('Vercel integrations automate environment variable sync:\n');
  print('Available integrations:');
  print('  1. Clerk (Authentication) - Auto-sync auth keys');
  print('  2. Stripe (Payments) - Auto-sync payment keys');
  print('  3. Vercel Postgres (Database) - One-click database');
  print('  4. Vercel KV (Redis) - One-click Redis');
  print('  5. Doppler (Secrets) - Sync storage credentials\n');
  
  const setup = await question('Do you want to set up integrations now? (y/n): ');
  
  if (setup.toLowerCase() === 'y') {
    print('\n📋 Setting up integrations:');
    print('1. Go to your Vercel project dashboard');
    print('2. Click "Settings" > "Integrations"');
    print('3. Install desired integrations');
    print('4. For each integration, follow the setup wizard\n');
    
    print('Recommended integrations:');
    print('  ✓ Clerk - for authentication');
    print('  ✓ Stripe - for payments');
    print('  ✓ Vercel Postgres - for database');
    print('  ✓ Doppler - for storage secrets\n');
    
    await question('Press Enter when integrations are set up...');
    printSuccess('Integrations configured');
  } else {
    printWarning('Skipping integrations. You\'ll need to set environment variables manually.');
  }
}

async function pushEnvVars() {
  printHeader('🔐 Environment Variables Setup');
  
  const hasEnvLocal = fs.existsSync('.env.local');
  
  if (!hasEnvLocal) {
    printWarning('No .env.local file found to push');
    return false;
  }

  print('You can push your local environment variables to Vercel.\n');
  printWarning('Only push non-sensitive variables. Use integrations for secrets!');
  
  const push = await question('\nPush environment variables to Vercel? (y/n): ');
  
  if (push.toLowerCase() === 'y') {
    print('\nChoose environment:');
    print('1. Development only');
    print('2. Preview only');
    print('3. Production only');
    print('4. All environments\n');
    
    const envChoice = await question('Enter choice (1-4): ');
    
    let envFlag = '';
    switch (envChoice) {
      case '1':
        envFlag = 'development';
        break;
      case '2':
        envFlag = 'preview';
        break;
      case '3':
        envFlag = 'production';
        break;
      case '4':
        envFlag = 'development,preview,production';
        break;
      default:
        printWarning('Invalid choice, skipping');
        return false;
    }

    printWarning('\n⚠ Important: Review variables before pushing!');
    const confirm = await question('Confirm push to Vercel? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      // Note: Vercel CLI doesn't have bulk env push, needs manual setup
      print('\n📋 To push environment variables:');
      print('1. Go to your Vercel project dashboard');
      print('2. Click "Settings" > "Environment Variables"');
      print('3. Copy variables from .env.local');
      print('4. Or use Vercel CLI individually:');
      print('   vercel env add VARIABLE_NAME\n');
      
      await question('Press Enter when environment variables are set...');
      printSuccess('Environment variables configured');
      return true;
    }
  }
  
  return false;
}

async function runMigrations() {
  printHeader('🗄️ Database Migrations');
  
  print('Database migrations need to be run before deployment.\n');
  
  const hasMigrations = fs.existsSync('apps/web/prisma/migrations');
  
  if (!hasMigrations) {
    printWarning('No migrations found');
    return true;
  }

  const run = await question('Run database migrations now? (y/n): ');
  
  if (run.toLowerCase() === 'y') {
    // Pull environment variables from Vercel first
    print('\nPulling environment variables from Vercel...');
    runCommand('vercel env pull .env.local', 'Pulling Vercel environment');
    
    return runCommand(
      'npx prisma migrate deploy --schema apps/web/prisma/schema.prisma',
      'Running database migrations'
    );
  }
  
  printWarning('Skipping migrations. Make sure to run them before going live!');
  return true;
}

async function deploy() {
  printHeader('🚀 Deploying to Vercel');
  
  print('Choose deployment type:');
  print('1. Preview deployment (for testing)');
  print('2. Production deployment (live)\n');
  
  const choice = await question('Enter choice (1-2): ');
  
  let command;
  let description;
  
  if (choice === '2') {
    printWarning('\n⚠ You are about to deploy to PRODUCTION!');
    const confirm = await question('Are you sure? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      print('Deployment cancelled.');
      return false;
    }
    
    command = 'vercel --prod';
    description = 'Deploying to production';
  } else {
    command = 'vercel';
    description = 'Deploying preview';
  }

  return runCommand(command, description);
}

async function postDeployment() {
  printHeader('✅ Deployment Complete!');
  
  print('Next steps:\n');
  print('1. Test your deployment:');
  print('   - Sign in with Clerk');
  print('   - Test payment flow (use Stripe test cards)');
  print('   - Try screenshot scraping');
  print('   - Test file uploads to storage\n');
  
  print('2. Configure webhooks in external services:');
  print('   - Stripe: Add your deployment URL + /api/stripe/webhook');
  print('   - Clerk: Add your deployment URL to allowed origins\n');
  
  print('3. Monitor your deployment:');
  print('   - Check Vercel logs for errors');
  print('   - Monitor database connections');
  print('   - Verify storage uploads work\n');
  
  print('4. Set up custom domain (optional):');
  print('   - Go to Vercel project > Settings > Domains');
  print('   - Add your domain and configure DNS\n');
  
  const openDashboard = await question('Open Vercel dashboard? (y/n): ');
  
  if (openDashboard.toLowerCase() === 'y') {
    try {
      const projectName = execSync('cat .vercel/project.json', { encoding: 'utf-8' });
      const project = JSON.parse(projectName);
      const url = `https://vercel.com/dashboard`;
      
      print(`\nOpening: ${url}`);
      
      if (process.platform === 'win32') {
        execSync(`start ${url}`, { stdio: 'ignore' });
      } else if (process.platform === 'darwin') {
        execSync(`open ${url}`, { stdio: 'ignore' });
      } else {
        execSync(`xdg-open ${url}`, { stdio: 'ignore' });
      }
    } catch (error) {
      print('Could not open browser automatically. Please visit https://vercel.com/dashboard');
    }
  }
}

async function main() {
  printHeader('🚀 Vercel Deployment Wizard');
  
  print('This wizard will deploy your AppShot.ai app to Vercel.\n');
  
  // Check Vercel CLI
  if (!checkVercelCLI()) {
    if (!(await installVercelCLI())) {
      printError('Vercel CLI is required. Install it with: npm install -g vercel');
      rl.close();
      return;
    }
  }
  
  // Check environment file
  if (!(await checkEnvFile())) {
    rl.close();
    return;
  }

  // Run pre-deployment checks
  if (!(await deploymentChecks())) {
    print('\nDeployment cancelled.');
    rl.close();
    return;
  }

  // Vercel login
  if (!(await vercelLogin())) {
    printError('You must be logged in to Vercel to deploy.');
    rl.close();
    return;
  }

  // Link project
  if (!(await linkProject())) {
    printError('Project must be linked to Vercel.');
    rl.close();
    return;
  }

  // Setup integrations
  await setupIntegrations();

  // Push environment variables
  await pushEnvVars();

  // Run migrations
  await runMigrations();

  // Deploy
  const deployed = await deploy();
  
  if (deployed) {
    await postDeployment();
  } else {
    printError('Deployment failed. Please check the errors above.');
  }

  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  print('\n\nDeployment cancelled by user.', colors.yellow);
  rl.close();
  process.exit(0);
});

main().catch(error => {
  printError(`Fatal error: ${error.message}`);
  process.exit(1);
});
