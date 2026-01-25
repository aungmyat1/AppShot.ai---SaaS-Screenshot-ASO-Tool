#!/usr/bin/env node

/**
 * Fix Lockfile Hygiene
 * 
 * This script ensures package.json and package-lock.json are in sync.
 * 
 * Problem: npm ci fails when package.json and package-lock.json don't match.
 * Solution: Run `npm install` to update package-lock.json, then commit it.
 * 
 * Usage:
 *   1. Run: npm install
 *   2. Commit: git add package-lock.json && git commit -m "chore: sync lockfile"
 *   3. Push: git push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');

console.log('🔍 Checking lockfile hygiene...\n');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const turboVersion = packageJson.devDependencies?.turbo;

if (!turboVersion) {
  console.error('❌ turbo not found in package.json devDependencies');
  process.exit(1);
}

console.log(`📦 package.json: turbo@${turboVersion}`);

// Read package-lock.json
if (!fs.existsSync(packageLockPath)) {
  console.error('❌ package-lock.json not found. Run: npm install');
  process.exit(1);
}

const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
const lockfileTurboVersion = packageLock.packages?.['']?.devDependencies?.turbo;
const nodeModulesTurboVersion = packageLock.packages?.['node_modules/turbo']?.version;

console.log(`📦 package-lock.json (root): turbo@${lockfileTurboVersion || 'not found'}`);
console.log(`📦 package-lock.json (node_modules/turbo): version ${nodeModulesTurboVersion || 'not found'}\n`);

// Check if versions match
const packageVersion = turboVersion.replace(/[\^~]/, '');
const lockfileVersion = nodeModulesTurboVersion || lockfileTurboVersion?.replace(/[\^~]/, '');

if (packageVersion === lockfileVersion) {
  console.log('✅ Lockfile is in sync!');
  console.log('   package.json and package-lock.json match.\n');
  process.exit(0);
}

console.log('⚠️  Lockfile mismatch detected!\n');
console.log('📋 Fix steps:');
console.log('   1. Run: npm install');
console.log('   2. Commit: git add package-lock.json');
console.log('   3. Commit: git commit -m "chore: sync turbo lockfile"');
console.log('   4. Push: git push\n');
console.log('💡 Why?');
console.log('   - npm ci requires package.json and package-lock.json to match exactly');
console.log('   - npm install updates the lockfile to match package.json');
console.log('   - npm ci never updates the lockfile (CI = lockfile must be correct)\n');

process.exit(1);
