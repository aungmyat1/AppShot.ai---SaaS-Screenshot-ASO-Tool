#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Branch Setup Script
 * 
 * Helps set up the correct environment when switching branches.
 * Automatically syncs environment variables based on the current branch.
 * 
 * Usage:
 *   node scripts/branch-setup.js
 *   node scripts/branch-setup.js --check
 *   node scripts/branch-setup.js --sync
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BRANCH_ENV_MAP = {
  'main': {
    environment: 'production',
    dopplerConfig: 'production',
    vercelEnv: 'production',
    syncCommand: 'npm run env:sync:prod',
  },
  'master': {
    environment: 'production',
    dopplerConfig: 'production',
    vercelEnv: 'production',
    syncCommand: 'npm run env:sync:prod',
  },
  'staging': {
    environment: 'staging',
    dopplerConfig: 'preview',
    vercelEnv: 'preview',
    syncCommand: 'npm run env:sync:preview',
  },
  'develop': {
    environment: 'development',
    dopplerConfig: 'development',
    vercelEnv: 'development',
    syncCommand: 'npm run env:sync:dev',
  },
  'dev': {
    environment: 'development',
    dopplerConfig: 'development',
    vercelEnv: 'development',
    syncCommand: 'npm run env:sync:dev',
  },
};

function getCurrentBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    return branch;
  } catch (error) {
    console.error('❌ Error getting current branch:', error.message);
    process.exit(1);
  }
}

function getBranchType(branch) {
  if (branch.startsWith('feature/')) return 'feature';
  if (branch.startsWith('bugfix/')) return 'bugfix';
  if (branch.startsWith('hotfix/')) return 'hotfix';
  if (branch.startsWith('release/')) return 'release';
  return 'primary';
}

function getEnvironmentConfig(branch) {
  // Check for exact match first
  if (BRANCH_ENV_MAP[branch]) {
    return BRANCH_ENV_MAP[branch];
  }

  // Check for branch type
  const branchType = getBranchType(branch);
  if (branchType === 'feature' || branchType === 'bugfix') {
    // Feature and bugfix branches use development environment
    return BRANCH_ENV_MAP['develop'];
  }

  if (branchType === 'hotfix') {
    // Hotfix branches use production environment
    return BRANCH_ENV_MAP['main'];
  }

  // Default to development
  console.warn(`⚠️  Unknown branch "${branch}", defaulting to development environment`);
  return BRANCH_ENV_MAP['develop'];
}

function checkEnvironment() {
  const branch = getCurrentBranch();
  const config = getEnvironmentConfig(branch);
  const branchType = getBranchType(branch);

  console.log('\n📋 Branch Environment Configuration\n');
  console.log(`Current Branch: ${branch}`);
  console.log(`Branch Type: ${branchType}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Doppler Config: ${config.dopplerConfig}`);
  console.log(`Vercel Environment: ${config.vercelEnv}`);
  console.log(`\nTo sync environment variables, run:`);
  console.log(`  ${config.syncCommand}\n`);

  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local file exists');
  } else {
    console.log('⚠️  .env.local file not found');
    console.log('   Consider creating it from .env.example');
  }

  return config;
}

function syncEnvironment() {
  const branch = getCurrentBranch();
  const config = getEnvironmentConfig(branch);

  console.log(`\n🔄 Syncing environment variables for ${branch} branch...\n`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Command: ${config.syncCommand}\n`);

  try {
    execSync(config.syncCommand, { stdio: 'inherit' });
    console.log(`\n✅ Environment variables synced successfully for ${config.environment} environment\n`);
  } catch (error) {
    console.error(`\n❌ Error syncing environment variables:`, error.message);
    console.error(`\nPlease run manually: ${config.syncCommand}\n`);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (command === '--check' || command === '-c') {
  checkEnvironment();
} else if (command === '--sync' || command === '-s') {
  syncEnvironment();
} else {
  // Default: show info and prompt
  const config = checkEnvironment();
  console.log('💡 Tip: Run with --sync to automatically sync environment variables\n');
}
