#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * GitHub Branch Protection Configuration Helper
 * 
 * This script provides guidance and commands for configuring branch protection rules.
 * It can also generate GitHub CLI commands or Terraform configurations.
 * 
 * Usage:
 *   node scripts/configure-branch-protection.js
 *   node scripts/configure-branch-protection.js --generate-gh-cli
 *   node scripts/configure-branch-protection.js --generate-terraform
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_OWNER = 'aungmyat1';
const REPO_NAME = 'AppShot.ai---SaaS-Screenshot-ASO-Tool';

// Status checks from CI workflow
const STATUS_CHECKS = {
  main: [
    'Web • lint / typecheck / unit tests',
    'API • black / pylint / mypy / pytest',
    'API • integration smoke (uvicorn + /health)',
    'Web • E2E (Playwright)',
    'Security • dependency and secret scanning',
  ],
  staging: [
    'Web • lint / typecheck / unit tests',
    'API • black / pylint / mypy / pytest',
    'Web • E2E (Playwright)',
  ],
  develop: [
    'Web • lint / typecheck / unit tests',
    'API • black / pylint / mypy / pytest',
  ],
};

// Branch protection configurations
const PROTECTION_CONFIG = {
  main: {
    requiredApprovals: 2,
    requireCodeOwners: true,
    requireLinearHistory: true,
    requireSignedCommits: true,
    enforceAdmins: true,
    allowForcePushes: false,
    allowDeletions: false,
    requireConversationResolution: true,
    statusChecks: STATUS_CHECKS.main,
  },
  staging: {
    requiredApprovals: 1,
    requireCodeOwners: false,
    requireLinearHistory: false,
    requireSignedCommits: false,
    enforceAdmins: false,
    allowForcePushes: false,
    allowDeletions: false,
    requireConversationResolution: true,
    statusChecks: STATUS_CHECKS.staging,
  },
  develop: {
    requiredApprovals: 1,
    requireCodeOwners: false,
    requireLinearHistory: false,
    requireSignedCommits: false,
    enforceAdmins: false,
    allowForcePushes: false,
    allowDeletions: false,
    requireConversationResolution: true,
    statusChecks: STATUS_CHECKS.develop,
  },
};

function getCurrentBranch() {
  try {
    // Try multiple methods for cross-platform compatibility
    let branch;
    try {
      branch = execSync('git branch --show-current', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      // Fallback for older git versions
      branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    }
    return branch || null;
  } catch (error) {
    // Silently fail - branch detection is optional
    return null;
  }
}

function generateGhCliCommands() {
  console.log('\n📝 GitHub CLI Commands for Branch Protection\n');
  console.log('⚠️  Note: Replace :owner with your GitHub username and :repo with your repository name\n');
  console.log('First, ensure you have GitHub CLI installed and authenticated:');
  console.log('  gh auth login\n');

  Object.entries(PROTECTION_CONFIG).forEach(([branch, config]) => {
    console.log(`\n# Configure ${branch} branch protection`);
    console.log(`gh api repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection \\`);
    console.log(`  --method PUT \\`);
    console.log(`  --field required_status_checks='{"strict":true,"contexts":${JSON.stringify(config.statusChecks)}}' \\`);
    console.log(`  --field enforce_admins=${config.enforceAdmins} \\`);
    console.log(`  --field required_pull_request_reviews='{"required_approving_review_count":${config.requiredApprovals},"dismiss_stale_reviews":true,"require_code_owner_reviews":${config.requireCodeOwners}}' \\`);
    console.log(`  --field restrictions=null \\`);
    console.log(`  --field required_linear_history=${config.requireLinearHistory} \\`);
    console.log(`  --field allow_force_pushes=${config.allowForcePushes} \\`);
    console.log(`  --field allow_deletions=${config.allowDeletions}`);
    console.log('');
  });
}

function generateTerraformConfig() {
  console.log('\n📝 Terraform Configuration for Branch Protection\n');
  console.log('Add this to your Terraform configuration:\n');

  Object.entries(PROTECTION_CONFIG).forEach(([branch, config]) => {
    console.log(`# ${branch} branch protection`);
    console.log(`resource "github_branch_protection" "${branch.replace('-', '_')}" {`);
    console.log(`  repository     = "${REPO_NAME}"`);
    console.log(`  branch         = "${branch}"`);
    console.log(`  enforce_admins = ${config.enforceAdmins}`);
    console.log('');
    console.log(`  required_status_checks {`);
    console.log(`    strict   = true`);
    console.log(`    contexts = ${JSON.stringify(config.statusChecks, null, 2).split('\n').map((line, i) => i === 0 ? line : '      ' + line).join('\n')}`);
    console.log(`  }`);
    console.log('');
    console.log(`  required_pull_request_reviews {`);
    console.log(`    required_approving_review_count = ${config.requiredApprovals}`);
    console.log(`    dismiss_stale_reviews           = true`);
    console.log(`    require_code_owner_reviews      = ${config.requireCodeOwners}`);
    console.log(`  }`);
    console.log('');
    console.log(`  restrictions {`);
    console.log(`    # Add user/team restrictions here if needed`);
    console.log(`  }`);
    console.log('');
    if (config.requireLinearHistory) {
      console.log(`  required_linear_history = true`);
    }
    if (config.requireSignedCommits) {
      console.log(`  require_signed_commits = true`);
    }
    console.log(`}\n`);
  });
}

function displayCurrentStatus() {
  const branch = getCurrentBranch();
  
  console.log('\n📊 Current Branch Protection Status\n');
  console.log(`Current Branch: ${branch || 'Unknown'}`);
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}\n`);

  if (branch && PROTECTION_CONFIG[branch]) {
    const config = PROTECTION_CONFIG[branch];
    console.log(`\n✅ Configuration available for ${branch} branch:\n`);
    console.log(`  Required Approvals: ${config.requiredApprovals}`);
    console.log(`  Require Code Owners: ${config.requireCodeOwners ? 'Yes' : 'No'}`);
    console.log(`  Require Linear History: ${config.requireLinearHistory ? 'Yes' : 'No'}`);
    console.log(`  Require Signed Commits: ${config.requireSignedCommits ? 'Yes' : 'No'}`);
    console.log(`  Enforce Admins: ${config.enforceAdmins ? 'Yes' : 'No'}`);
    console.log(`  Allow Force Pushes: ${config.allowForcePushes ? 'Yes' : 'No'}`);
    console.log(`  Allow Deletions: ${config.allowDeletions ? 'Yes' : 'No'}`);
    console.log(`  Required Status Checks: ${config.statusChecks.length}`);
    config.statusChecks.forEach(check => {
      console.log(`    - ${check}`);
    });
  } else {
    console.log(`\n⚠️  No specific protection configuration for branch: ${branch}`);
    console.log(`   Available configurations: ${Object.keys(PROTECTION_CONFIG).join(', ')}\n`);
  }

  console.log('\n📋 Manual Configuration Steps:\n');
  console.log('1. Go to: https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/settings/branches');
  console.log('2. Click "Add rule" or edit existing rule');
  console.log('3. Enter branch name pattern');
  console.log('4. Configure settings as per BRANCH_ENV_PROTECTION_CONFIG.md');
  console.log('5. Save changes\n');
}

function displaySummary() {
  console.log('\n📚 Branch Protection Configuration Summary\n');
  console.log('This script helps configure GitHub branch protection rules.\n');
  console.log('Available commands:');
  console.log('  --generate-gh-cli      Generate GitHub CLI commands');
  console.log('  --generate-terraform   Generate Terraform configuration');
  console.log('  (no args)              Display current status and manual steps\n');
  console.log('For detailed configuration, see: BRANCH_ENV_PROTECTION_CONFIG.md\n');
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (command === '--generate-gh-cli' || command === '--gh') {
  generateGhCliCommands();
} else if (command === '--generate-terraform' || command === '--tf') {
  generateTerraformConfig();
} else if (command === '--help' || command === '-h') {
  displaySummary();
} else {
  displayCurrentStatus();
  displaySummary();
}
