#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Setup Branches Script
 * 
 * Creates the professional branch structure:
 * - develop (from main)
 * - staging (from main)
 * 
 * Usage:
 *   node scripts/setup-branches.js
 */

const { execSync } = require('child_process');

const BRANCHES = [
  { name: 'develop', from: 'main', description: 'Development integration branch' },
  { name: 'staging', from: 'main', description: 'Staging/pre-production branch' },
];

function checkBranchExists(branch) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branch}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkRemoteBranchExists(branch) {
  try {
    execSync(`git ls-remote --heads origin ${branch}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error('❌ Error getting current branch:', error.message);
    process.exit(1);
  }
}

function setupBranches() {
  console.log('\n🌿 Setting up professional branch structure\n');
  console.log('This will create:');
  BRANCHES.forEach(branch => {
    console.log(`  - ${branch.name} (${branch.description})`);
  });
  console.log('');

  const currentBranch = getCurrentBranch();
  console.log(`Current branch: ${currentBranch}\n`);

  // Check if we're on main
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.log('⚠️  Warning: Not on main/master branch');
    console.log('   Branches will be created from current branch\n');
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const branch of BRANCHES) {
    const existsLocally = checkBranchExists(branch.name);
    const existsRemotely = checkRemoteBranchExists(branch.name);

    if (existsLocally && existsRemotely) {
      console.log(`⏭️  Branch "${branch.name}" already exists (local and remote)`);
      skippedCount++;
      continue;
    }

    if (existsLocally && !existsRemotely) {
      console.log(`📤 Branch "${branch.name}" exists locally, pushing to remote...`);
      try {
        execSync(`git push -u origin ${branch.name}`, { stdio: 'inherit' });
        console.log(`✅ Pushed "${branch.name}" to remote\n`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to push "${branch.name}":`, error.message);
      }
      continue;
    }

    if (!existsLocally && existsRemotely) {
      console.log(`📥 Branch "${branch.name}" exists on remote, checking out...`);
      try {
        execSync(`git checkout -b ${branch.name} origin/${branch.name}`, { stdio: 'inherit' });
        console.log(`✅ Checked out "${branch.name}"\n`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to checkout "${branch.name}":`, error.message);
      }
      continue;
    }

    // Branch doesn't exist, create it
    console.log(`✨ Creating branch "${branch.name}" from "${branch.from}"...`);
    try {
      // Ensure we're on the base branch
      if (currentBranch !== branch.from) {
        console.log(`   Checking out ${branch.from}...`);
        execSync(`git checkout ${branch.from}`, { stdio: 'inherit' });
      }

      // Create the branch
      execSync(`git checkout -b ${branch.name}`, { stdio: 'inherit' });
      console.log(`✅ Created branch "${branch.name}"`);

      // Push to remote
      console.log(`   Pushing to remote...`);
      execSync(`git push -u origin ${branch.name}`, { stdio: 'inherit' });
      console.log(`✅ Pushed "${branch.name}" to remote\n`);
      createdCount++;

      // Return to original branch
      if (currentBranch !== branch.from) {
        execSync(`git checkout ${currentBranch}`, { stdio: 'ignore' });
      }
    } catch (error) {
      console.error(`❌ Failed to create "${branch.name}":`, error.message);
      console.error('   You may need to run this manually:\n');
      console.error(`   git checkout ${branch.from}`);
      console.error(`   git checkout -b ${branch.name}`);
      console.error(`   git push -u origin ${branch.name}\n`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${createdCount} branch(es)`);
  console.log(`   Skipped: ${skippedCount} branch(es)`);
  console.log('');

  if (createdCount > 0) {
    console.log('✅ Branch setup completed!\n');
    console.log('📋 Available branches:');
    try {
      execSync('git branch -a', { stdio: 'inherit' });
    } catch {
      // Ignore errors
    }
  } else {
    console.log('ℹ️  All branches already exist\n');
  }

  console.log('💡 Next steps:');
  console.log('   1. Set up branch protection rules in GitHub');
  console.log('   2. Configure environment variables in Doppler');
  console.log('   3. Test branch setup: npm run branch:check\n');
}

// Main execution
try {
  setupBranches();
} catch (error) {
  console.error('\n❌ Error during branch setup:', error.message);
  console.error('\nYou can create branches manually:');
  console.error('  git checkout main');
  console.error('  git checkout -b develop');
  console.error('  git push -u origin develop');
  console.error('  git checkout main');
  console.error('  git checkout -b staging');
  console.error('  git push -u origin staging\n');
  process.exit(1);
}
