#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Fix Lockfile Script
 * 
 * Checks if package.json and package-lock.json are in sync.
 * If not, provides instructions to fix.
 * 
 * Usage:
 *   node scripts/fix-lockfile.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = path.join(process.cwd(), 'package.json');
const PACKAGE_LOCK = path.join(process.cwd(), 'package-lock.json');

function checkLockfile() {
  console.log('\n🔍 Checking lockfile sync...\n');

  // Check if package.json exists
  if (!fs.existsSync(PACKAGE_JSON)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  // Check if package-lock.json exists
  if (!fs.existsSync(PACKAGE_LOCK)) {
    console.log('⚠️  package-lock.json not found');
    console.log('\n📝 To fix:');
    console.log('   npm install\n');
    return false;
  }

  try {
    // Try to run npm ci in dry-run mode to check sync
    console.log('Checking if package.json and package-lock.json are in sync...\n');
    execSync('npm ci --dry-run', { stdio: 'pipe' });
    console.log('✅ package.json and package-lock.json are in sync!\n');
    return true;
  } catch (error) {
    console.log('❌ package.json and package-lock.json are OUT OF SYNC\n');
    console.log('📝 To fix, run:');
    console.log('   npm install\n');
    console.log('   This will update package-lock.json to match package.json\n');
    return false;
  }
}

// Main execution
const isSynced = checkLockfile();

if (!isSynced) {
  console.log('💡 After running npm install, commit the updated package-lock.json\n');
  process.exit(1);
}
