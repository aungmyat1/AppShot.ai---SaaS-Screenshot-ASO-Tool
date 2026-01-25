#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Create Branch Script
 * 
 * Helps create properly named branches following the git branching strategy.
 * 
 * Usage:
 *   node scripts/create-branch.js feature my-feature
 *   node scripts/create-branch.js bugfix login-error
 *   node scripts/create-branch.js hotfix critical-fix
 *   node scripts/create-branch.js release v1.0.0
 */

const { execSync } = require('child_process');

const BRANCH_TYPES = {
  feature: {
    prefix: 'feature',
    baseBranch: 'develop',
    description: 'New feature development',
  },
  bugfix: {
    prefix: 'bugfix',
    baseBranch: 'develop',
    description: 'Bug fix',
  },
  hotfix: {
    prefix: 'hotfix',
    baseBranch: 'main',
    description: 'Critical production fix',
  },
  release: {
    prefix: 'release',
    baseBranch: 'develop',
    description: 'Release preparation',
  },
};

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error('❌ Error getting current branch:', error.message);
    process.exit(1);
  }
}

function checkBranchExists(branch) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branch}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function createBranch(type, name) {
  if (!BRANCH_TYPES[type]) {
    console.error(`❌ Invalid branch type: ${type}`);
    console.error(`\nValid types: ${Object.keys(BRANCH_TYPES).join(', ')}\n`);
    process.exit(1);
  }

  if (!name || name.trim() === '') {
    console.error('❌ Branch name is required');
    console.error(`\nUsage: node scripts/create-branch.js ${type} <branch-name>\n`);
    process.exit(1);
  }

  const config = BRANCH_TYPES[type];
  const branchName = `${config.prefix}/${name}`;
  const baseBranch = config.baseBranch;

  // Check if branch already exists
  if (checkBranchExists(branchName)) {
    console.error(`❌ Branch "${branchName}" already exists`);
    process.exit(1);
  }

  // Check if base branch exists
  if (!checkBranchExists(baseBranch)) {
    console.error(`❌ Base branch "${baseBranch}" does not exist`);
    console.error(`\nPlease create it first or use a different base branch.\n`);
    process.exit(1);
  }

  const currentBranch = getCurrentBranch();

  console.log(`\n🌿 Creating ${config.description} branch\n`);
  console.log(`Branch Name: ${branchName}`);
  console.log(`Base Branch: ${baseBranch}`);
  console.log(`Current Branch: ${currentBranch}\n`);

  try {
    // Checkout base branch
    if (currentBranch !== baseBranch) {
      console.log(`📥 Checking out ${baseBranch}...`);
      execSync(`git checkout ${baseBranch}`, { stdio: 'inherit' });
    }

    // Pull latest changes
    console.log(`\n📥 Pulling latest changes from ${baseBranch}...`);
    execSync(`git pull origin ${baseBranch}`, { stdio: 'inherit' });

    // Create new branch
    console.log(`\n✨ Creating branch ${branchName}...`);
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

    console.log(`\n✅ Branch "${branchName}" created successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Make your changes`);
    console.log(`   2. Commit: git add . && git commit -m "feat: your message"`);
    console.log(`   3. Push: git push origin ${branchName}`);
    console.log(`   4. Create PR to ${baseBranch}\n`);

  } catch (error) {
    console.error(`\n❌ Error creating branch:`, error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Missing arguments');
  console.error('\nUsage: node scripts/create-branch.js <type> <name>');
  console.error('\nTypes:');
  Object.entries(BRANCH_TYPES).forEach(([type, config]) => {
    console.error(`  ${type.padEnd(10)} - ${config.description} (base: ${config.baseBranch})`);
  });
  console.error('\nExamples:');
  console.error('  node scripts/create-branch.js feature user-authentication');
  console.error('  node scripts/create-branch.js bugfix login-error');
  console.error('  node scripts/create-branch.js hotfix critical-security-patch\n');
  process.exit(1);
}

const [type, ...nameParts] = args;
const name = nameParts.join('-');

createBranch(type, name);
