#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify and Synchronize Lockfile Script
 * 
 * Ensures package.json and package-lock.json are in sync.
 * If they're not in sync, it regenerates the lockfile.
 * 
 * Usage:
 *   node scripts/verify-lockfile.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = path.join(process.cwd(), 'package.json');
const PACKAGE_LOCK = path.join(process.cwd(), 'package-lock.json');

function verifyAndSyncLockfile() {
  console.log('\n🔍 Verifying and synchronizing lockfile...\n');

  // Check if package.json exists
  if (!fs.existsSync(PACKAGE_JSON)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  // Check if package-lock.json exists
  if (!fs.existsSync(PACKAGE_LOCK)) {
    console.log('⚠️  package-lock.json not found, generating it...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ package-lock.json generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate package-lock.json:', error.message);
      process.exit(1);
    }
    return;
  }

  try {
    // Try to run npm ci in dry-run mode to check sync
    console.log('Checking if package.json and package-lock.json are in sync...\n');
    execSync('npm ci --dry-run', { stdio: 'pipe' });
    console.log('✅ package.json and package-lock.json are in sync!\n');
    return;
  } catch (error) {
    console.log('❌ package.json and package-lock.json are OUT OF SYNC\n');
    console.log('🔄 Regenerating package-lock.json to match package.json...\n');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ package-lock.json regenerated successfully!\n');
    } catch (installError) {
      console.error('❌ Failed to regenerate package-lock.json:', installError.message);
      process.exit(1);
    }
  }
}

// Main execution
verifyAndSyncLockfile();