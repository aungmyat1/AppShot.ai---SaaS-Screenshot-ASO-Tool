#!/usr/bin/env node

/**
 * Deployment Readiness Check Script
 * Verifies that the project is ready for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(condition, successMsg, failureMsg, isWarning = false) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    log.success(successMsg);
    return true;
  } else {
    if (isWarning) {
      warnings++;
      log.warning(failureMsg);
    } else {
      failedChecks++;
      log.error(failureMsg);
    }
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

function runCommand(command, silent = true) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

function checkGitStatus() {
  log.section('🔍 Checking Git Status');
  
  const status = runCommand('git status --porcelain');
  check(
    status.success,
    'Git is available',
    'Git is not available or not in a git repository',
    false
  );

  if (status.success) {
    const hasChanges = status.output.length > 0;
    check(
      !hasChanges,
      'No uncommitted changes',
      'You have uncommitted changes - consider committing before deployment',
      true
    );

    const branch = runCommand('git rev-parse --abbrev-ref HEAD');
    if (branch.success) {
      log.info(`Current branch: ${branch.output}`);
    }
  }
}

function checkProjectStructure() {
  log.section('📁 Checking Project Structure');

  const criticalPaths = [
    'apps/web/package.json',
    'apps/web/next.config.mjs',
    'apps/web/prisma/schema.prisma',
    'package.json',
    'turbo.json',
    'vercel.json',
  ];

  criticalPaths.forEach((filePath) => {
    check(
      fileExists(filePath),
      `${filePath} exists`,
      `${filePath} is missing`,
      false
    );
  });
}

function checkDocumentation() {
  log.section('📚 Checking Documentation');

  const docs = [
    '.env.example',
    'README.md',
    'DEPLOYMENT_CHECKLIST.md',
    'docs/SETUP_ENVIRONMENT_VARIABLES.md',
  ];

  docs.forEach((doc) => {
    check(
      fileExists(doc),
      `${doc} exists`,
      `${doc} is missing`,
      true
    );
  });
}

function checkDependencies() {
  log.section('📦 Checking Dependencies');

  check(
    fileExists('node_modules'),
    'node_modules directory exists',
    'Dependencies not installed - run: npm install',
    false
  );

  check(
    fileExists('package-lock.json'),
    'package-lock.json exists',
    'package-lock.json is missing',
    true
  );
}

function checkEnvironmentFiles() {
  log.section('🔐 Checking Environment Files');

  check(
    fileExists('.env.example'),
    '.env.example exists (template file)',
    '.env.example is missing',
    false
  );

  const envInGit = runCommand('git ls-files | grep -E "^\\.env$"');
  check(
    !envInGit.success || envInGit.output.length === 0,
    '.env is not tracked in git (secure)',
    '.env is tracked in git - this is a security risk!',
    false
  );

  const hasLocalEnv = fileExists('.env.local') || fileExists('.env');
  check(
    hasLocalEnv,
    'Local environment file exists (.env or .env.local)',
    'No local environment file found - copy .env.example to .env.local',
    true
  );
}

function checkInfrastructure() {
  log.section('🏗️ Checking Infrastructure');

  const infraFiles = [
    'infrastructure/docker/web.Dockerfile',
    'infrastructure/docker/docker-compose.yml',
    'vercel.json',
  ];

  infraFiles.forEach((file) => {
    check(
      fileExists(file),
      `${file} exists`,
      `${file} is missing`,
      true
    );
  });
}

function checkCICD() {
  log.section('⚙️ Checking CI/CD Configuration');

  const workflows = [
    '.github/workflows/ci.yml',
    '.github/workflows/cd.yml',
  ];

  workflows.forEach((workflow) => {
    check(
      fileExists(workflow),
      `${workflow} exists`,
      `${workflow} is missing`,
      true
    );
  });
}

function checkBuildProcess() {
  log.section('🔨 Checking Build Configuration');

  // Check if web app package.json has build script
  if (fileExists('apps/web/package.json')) {
    const webPackage = JSON.parse(fs.readFileSync('apps/web/package.json', 'utf-8'));
    check(
      webPackage.scripts && webPackage.scripts.build,
      'Web app has build script',
      'Web app is missing build script',
      false
    );

    check(
      webPackage.dependencies && webPackage.dependencies['@clerk/nextjs'],
      'Clerk authentication dependency installed',
      'Clerk dependency missing',
      true
    );

    check(
      webPackage.dependencies && webPackage.dependencies['stripe'],
      'Stripe dependency installed',
      'Stripe dependency missing',
      true
    );

    check(
      webPackage.dependencies && webPackage.dependencies['@prisma/client'],
      'Prisma client dependency installed',
      'Prisma client dependency missing',
      false
    );
  }
}

function checkDatabaseSetup() {
  log.section('🗄️ Checking Database Setup');

  check(
    fileExists('apps/web/prisma/schema.prisma'),
    'Prisma schema exists',
    'Prisma schema is missing',
    false
  );

  check(
    fileExists('apps/web/prisma/migrations'),
    'Database migrations directory exists',
    'No migrations directory found',
    true
  );

  const migrations = fs.existsSync('apps/web/prisma/migrations')
    ? fs.readdirSync('apps/web/prisma/migrations').filter((f) => f !== 'migration_lock.toml')
    : [];

  check(
    migrations.length > 0,
    `Found ${migrations.length} migration(s)`,
    'No database migrations found',
    true
  );
}

function checkSecurityFiles() {
  log.section('🔒 Checking Security Configuration');

  check(
    fileExists('.gitignore'),
    '.gitignore exists',
    '.gitignore is missing',
    false
  );

  if (fileExists('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    check(
      gitignore.includes('.env'),
      '.gitignore includes .env files',
      '.env files not in .gitignore - security risk!',
      false
    );
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  log.section('📊 Deployment Readiness Summary');
  console.log('='.repeat(60));

  console.log(`\nTotal Checks: ${totalChecks}`);
  console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);

  const score = Math.round((passedChecks / totalChecks) * 100);
  console.log(`\n${colors.bold}Readiness Score: ${score}%${colors.reset}`);

  if (failedChecks === 0 && warnings === 0) {
    console.log(`\n${colors.green}${colors.bold}✓ Project is READY for deployment!${colors.reset}`);
  } else if (failedChecks === 0) {
    console.log(`\n${colors.yellow}${colors.bold}⚠ Project is mostly ready, but check warnings above${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ Please fix failed checks before deployment${colors.reset}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nNext Steps:');
  if (failedChecks > 0) {
    console.log('1. Fix failed checks above');
    console.log('2. Re-run this script: npm run check:deployment');
  } else {
    console.log('1. Set up external services (Clerk, Stripe, Database, Storage)');
    console.log('2. Configure environment variables');
    console.log('3. Follow QUICK_START.md for deployment steps');
  }
  console.log('\nFor detailed guidance, see:');
  console.log('  - QUICK_START.md');
  console.log('  - DEPLOYMENT_PREPARATION_SUMMARY.md');
  console.log('  - docs/DEPLOY_VERCEL_INTEGRATIONS.md');
  console.log('='.repeat(60) + '\n');
}

// Run all checks
console.log(`${colors.bold}${colors.cyan}`);
console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║     Deployment Readiness Check for AppShot.ai        ║');
console.log('╚═══════════════════════════════════════════════════════╝');
console.log(colors.reset);

checkGitStatus();
checkProjectStructure();
checkDocumentation();
checkDependencies();
checkEnvironmentFiles();
checkInfrastructure();
checkCICD();
checkBuildProcess();
checkDatabaseSetup();
checkSecurityFiles();
printSummary();

// Exit with appropriate code
process.exit(failedChecks > 0 ? 1 : 0);
