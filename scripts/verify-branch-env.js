#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify Branch Environment Configuration
 * 
 * This script runs a comprehensive check of:
 * - Current git branch
 * - Environment variables (Doppler integration)
 * - Clerk configuration
 * 
 * Usage:
 *   node scripts/verify-branch-env.js
 *   node scripts/verify-branch-env.js --sync  (also syncs production env)
 */

const { execSync } = require('child_process');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log('='.repeat(60));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: true,
      timeout: 30000 // 30 second timeout
    });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stdout) {
      console.error(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
    // Check if it's a permission error
    if (error.message && error.message.includes('EPERM')) {
      console.error('\n⚠️  Permission error detected. This may be a Windows security issue.');
      console.error('   Try running the command directly: ' + command);
    }
    return { success: false, error: error.message };
  }
}

function getCurrentBranch() {
  try {
    // Try modern git command first
    const branch = execSync('git branch --show-current', { 
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: true
    }).trim();
    if (branch) return branch;
  } catch (error) {
    // Fallback for older git versions
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        encoding: 'utf-8',
        stdio: 'pipe',
        shell: true
      }).trim();
      if (branch) return branch;
    } catch {
      // Last resort: parse git branch output
      try {
        const output = execSync('git branch', { 
          encoding: 'utf-8',
          stdio: 'pipe',
          shell: true
        });
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('*')) {
            return line.trim().replace(/^\*\s*/, '');
          }
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const shouldSync = args.includes('--sync') || args.includes('-s');

  console.log('\n🔍 Branch Environment Verification');
  console.log('='.repeat(60));

  // 1. Check current branch
  console.log('\n📌 Step 1: Checking current git branch...');
  const currentBranch = getCurrentBranch();
  if (currentBranch) {
    console.log(`✅ Current branch: ${currentBranch}`);
    
    // Map branch to environment
    const branchEnvMap = {
      'main': 'production',
      'staging': 'preview',
      'develop': 'development'
    };
    
    const env = branchEnvMap[currentBranch] || 'unknown';
    console.log(`   Mapped environment: ${env}`);
    
    if (env === 'unknown') {
      console.log(`   ⚠️  Branch "${currentBranch}" is not mapped to a standard environment`);
    }
  } else {
    console.log('❌ Could not determine current branch');
  }

  // 2. Verify Doppler integration
  console.log('\n📌 Step 2: Verifying Doppler integration...');
  const dopplerCheck = runCommand(
    'npm run env:check:doppler',
    'Doppler Integration Check'
  );

  // 3. Check Clerk configuration
  console.log('\n📌 Step 3: Checking Clerk configuration...');
  const clerkCheck = runCommand(
    'npm run env:check:clerk',
    'Clerk Configuration Check'
  );

  // 4. Sync production environment (if requested)
  if (shouldSync) {
    console.log('\n📌 Step 4: Syncing production environment variables...');
    const syncCheck = runCommand(
      'npm run env:sync:prod',
      'Production Environment Sync'
    );
  } else {
    console.log('\n📌 Step 4: Skipping environment sync (use --sync to enable)');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60));
  
  const results = {
    branch: currentBranch ? '✅' : '❌',
    doppler: dopplerCheck.success ? '✅' : '❌',
    clerk: clerkCheck.success ? '✅' : '❌',
    sync: shouldSync ? (dopplerCheck.success ? '✅' : '⏭️') : '⏭️'
  };

  console.log(`Current Branch:     ${results.branch}`);
  console.log(`Doppler Check:       ${results.doppler}`);
  console.log(`Clerk Check:         ${results.clerk}`);
  console.log(`Environment Sync:    ${results.sync}`);

  const allPassed = currentBranch && dopplerCheck.success && clerkCheck.success;
  
  if (allPassed) {
    console.log('\n✅ All checks passed!');
    console.log('\n💡 Next steps:');
    console.log('   - If on main branch, ensure production environment is synced');
    console.log('   - Verify branch protection rules are applied');
    console.log('   - Run: npm run branch:protection:apply:dry (to preview)');
    console.log('   - Run: npm run branch:protection:apply (to apply)');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.');
    console.log('\n💡 Troubleshooting:');
    if (!currentBranch) {
      console.log('   - Ensure you are in a git repository');
    }
    if (!dopplerCheck.success) {
      console.log('   - Check Doppler setup: npm run doppler:setup');
      console.log('   - Verify Doppler CLI is installed and authenticated');
    }
    if (!clerkCheck.success) {
      console.log('   - Check Clerk environment variables');
      console.log('   - Run: npm run env:check:clerk for details');
    }
  }

  console.log('\n');
  
  process.exit(allPassed ? 0 : 1);
}

main();
