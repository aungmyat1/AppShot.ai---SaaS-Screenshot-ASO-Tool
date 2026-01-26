#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Configure Branch Environment and Protection
 * 
 * This script:
 * 1. Checks current git branch
 * 2. Verifies environment configuration
 * 3. Provides guidance for fixing issues
 * 4. Optionally applies branch protection rules
 * 
 * Usage:
 *   node scripts/configure-branch-env.js
 *   node scripts/configure-branch-env.js --apply-protection
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

function getCurrentBranch() {
  // Check if .git directory exists
  const gitDir = path.join(projectRoot, '.git');
  if (!fs.existsSync(gitDir)) {
    return null;
  }
  
  // Try reading from .git/HEAD first (most reliable, no process spawn)
  try {
    const headFile = path.join(gitDir, 'HEAD');
    if (fs.existsSync(headFile)) {
      const headContent = fs.readFileSync(headFile, 'utf-8').trim();
      // Format: ref: refs/heads/branch-name
      const match = headContent.match(/ref: refs\/heads\/(.+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    // Fall through to execSync methods
  }
  
  // Fallback: try execSync methods
  const options = {
    encoding: 'utf-8',
    stdio: 'pipe',
    shell: true,
    cwd: projectRoot,
    timeout: 5000
  };
  
  try {
    // Try modern git command first
    const result = execSync('git branch --show-current', options);
    const branch = result.toString().trim();
    if (branch && branch.length > 0) return branch;
  } catch (error) {
    // Fallback for older git versions
    try {
      const result = execSync('git rev-parse --abbrev-ref HEAD', options);
      const branch = result.toString().trim();
      if (branch && branch.length > 0) return branch;
    } catch {
      // Last resort: parse git branch output
      try {
        const result = execSync('git branch', options);
        const output = result.toString();
        const lines = output.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('*')) {
            const branch = trimmed.replace(/^\*\s*/, '').trim();
            if (branch) return branch;
          }
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

function checkCommand(command) {
  try {
    execSync(command, { 
      stdio: 'ignore', 
      shell: true,
      cwd: projectRoot
    });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const applyProtection = args.includes('--apply-protection') || args.includes('-p');

  console.log('\n🔧 Branch Environment & Protection Configuration');
  console.log('='.repeat(60));

  // 1. Check current branch
  console.log('\n📌 Step 1: Checking git branch...');
  const currentBranch = getCurrentBranch();
  if (currentBranch) {
    console.log(`✅ Current branch: ${currentBranch}`);
    
    const branchEnvMap = {
      'main': { env: 'production', doppler: 'prod', vercel: 'Production' },
      'staging': { env: 'preview', doppler: 'staging', vercel: 'Preview' },
      'develop': { env: 'development', doppler: 'dev', vercel: 'Development' }
    };
    
    const mapping = branchEnvMap[currentBranch];
    if (mapping) {
      console.log(`   Environment: ${mapping.env}`);
      console.log(`   Doppler Config: ${mapping.doppler}`);
      console.log(`   Vercel Environment: ${mapping.vercel}`);
    } else {
      console.log(`   ⚠️  Branch "${currentBranch}" is not a standard branch`);
    }
  } else {
    console.log('❌ Could not determine current branch');
    console.log('   Ensure you are in a git repository');
    process.exit(1);
  }

  // 2. Check Doppler
  console.log('\n📌 Step 2: Checking Doppler configuration...');
  const dopplerInstalled = checkCommand('doppler --version');
  if (dopplerInstalled) {
    console.log('✅ Doppler CLI installed');
    try {
      const dopplerAuth = execSync('doppler me', { 
        encoding: 'utf-8',
        stdio: 'pipe',
        shell: true,
        cwd: projectRoot
      });
      console.log('✅ Doppler authenticated');
    } catch {
      console.log('❌ Doppler not authenticated');
      console.log('   Run: doppler login');
    }
  } else {
    console.log('❌ Doppler CLI not installed');
    console.log('   Install: https://docs.doppler.com/docs/install-cli');
  }

  // 3. Check Vercel
  console.log('\n📌 Step 3: Checking Vercel configuration...');
  const vercelInstalled = checkCommand('vercel --version');
  if (vercelInstalled) {
    console.log('✅ Vercel CLI installed');
    try {
      execSync('vercel whoami', { 
        stdio: 'ignore', 
        shell: true,
        cwd: projectRoot
      });
      console.log('✅ Vercel authenticated');
    } catch {
      console.log('❌ Vercel not authenticated');
      console.log('   Run: vercel login');
    }
  } else {
    console.log('⚠️  Vercel CLI not installed (optional)');
    console.log('   Install: npm i -g vercel');
  }

  // 4. Check environment variables
  console.log('\n📌 Step 4: Checking environment variables...');
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  if (vercelProjectId) {
    console.log(`✅ VERCEL_PROJECT_ID is set`);
  } else {
    console.log('❌ VERCEL_PROJECT_ID not set');
    console.log('   Set in Doppler: doppler secrets set VERCEL_PROJECT_ID="your_id"');
  }

  // 5. Summary and recommendations
  console.log('\n' + '='.repeat(60));
  console.log('📊 Configuration Summary');
  console.log('='.repeat(60));
  
  const recommendations = [];

  if (!dopplerInstalled) {
    recommendations.push('Install Doppler CLI');
  }
  if (vercelProjectId) {
    console.log('✅ VERCEL_PROJECT_ID configured');
  } else {
    recommendations.push('Set VERCEL_PROJECT_ID in Doppler');
  }

  if (recommendations.length > 0) {
    console.log('\n⚠️  Recommended Actions:');
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  // 6. Next steps
  console.log('\n💡 Next Steps:');
  console.log('   1. Verify environment: npm run branch:env:verify');
  
  if (currentBranch === 'main') {
    console.log('   2. Sync production env: npm run branch:env:verify:sync');
  }
  
  console.log('   3. Preview branch protection: npm run branch:protection:apply:dry');
  
  if (applyProtection) {
    console.log('\n📌 Applying branch protection rules...');
    try {
      execSync('npm run branch:protection:apply', { 
        stdio: 'inherit',
        shell: true,
        cwd: projectRoot
      });
      console.log('\n✅ Branch protection applied!');
    } catch (error) {
      console.log('\n❌ Failed to apply branch protection');
      console.log('   Check authentication and try again');
    }
  } else {
    console.log('   4. Apply branch protection: npm run branch:protection:apply');
    console.log('      Or run with --apply-protection flag');
  }

  console.log('\n');
}

main();
