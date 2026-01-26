#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Apply Branch Protection Rules from JSON
 * 
 * This script reads branch protection rules from branch-protection-rules.json
 * and applies them to GitHub using the GitHub CLI or API.
 * 
 * Usage:
 *   node scripts/apply-branch-protection-from-json.js
 *   node scripts/apply-branch-protection-from-json.js --dry-run
 *   node scripts/apply-branch-protection-from-json.js --branch main
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const JSON_FILE = path.join(__dirname, '..', 'branch-protection-rules.json');
const REPO_OWNER = 'aungmyat1';
const REPO_NAME = 'AppShot.ai---SaaS-Screenshot-ASO-Tool';

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
}

function testGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function testGitHubAuth() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getGitHubToken() {
  // Check for token in environment variables
  return process.env.GITHUB_TOKEN || 
         process.env.GH_TOKEN || 
         null;
}

function testGitHubToken(token) {
  if (!token) return false;
  try {
    const https = require('https');
    const url = require('url');
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Node.js',
          'Accept': 'application/vnd.github.v3+json'
        }
      };
      
      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  } catch {
    return false;
  }
}

function buildApiPayload(rule) {
  const payload = {
    required_status_checks: {
      strict: rule.required_status_checks.strict,
      contexts: rule.required_status_checks.contexts,
    },
    enforce_admins: rule.enforce_admins,
    required_pull_request_reviews: {
      required_approving_review_count: rule.required_pull_request_reviews.required_approving_review_count,
      dismiss_stale_reviews: rule.required_pull_request_reviews.dismiss_stale_reviews,
      require_code_owner_reviews: rule.required_pull_request_reviews.require_code_owner_reviews,
    },
    restrictions: rule.restrictions,
    required_linear_history: rule.required_linear_history,
    allow_force_pushes: rule.allow_force_pushes,
    allow_deletions: rule.allow_deletions,
  };

  // Add optional fields if they exist
  if (rule.required_conversation_resolution !== undefined) {
    payload.required_conversation_resolution = rule.required_conversation_resolution;
  }
  if (rule.require_signed_commits !== undefined) {
    payload.require_signed_commits = rule.require_signed_commits;
  }

  return payload;
}

function applyBranchProtectionViaCLI(branchName, rule, dryRun = false) {
  const apiUrl = `repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}/protection`;
  const payload = buildApiPayload(rule);
  const payloadJson = JSON.stringify(payload);

  if (dryRun) {
    console.log(`\n[DRY RUN] Would execute:`);
    console.log(`  gh api ${apiUrl} --method PUT --input -`);
    console.log(`\nPayload:`);
    console.log(JSON.stringify(payload, null, 2));
    return true;
  }

  try {
    // Create temporary file for payload
    const tempFile = path.join(__dirname, '..', '.temp-protection-payload.json');
    fs.writeFileSync(tempFile, payloadJson);

    // Build GitHub CLI command
    const command = `gh api ${apiUrl} --method PUT --input ${tempFile}`;
    
    console.log(`   Executing: gh api ${apiUrl} --method PUT`);
    execSync(command, { stdio: 'inherit' });

    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    console.log(`✅ Successfully configured protection for ${branchName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error configuring protection for ${branchName}:`, error.message);
    return false;
  }
}

function applyBranchProtectionViaAPI(branchName, rule, token, dryRun = false) {
  const https = require('https');
  const payload = buildApiPayload(rule);
  const payloadJson = JSON.stringify(payload);

  if (dryRun) {
    console.log(`\n[DRY RUN] Would execute API call to:`);
    console.log(`  PUT https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}/protection`);
    console.log(`\nPayload:`);
    console.log(JSON.stringify(payload, null, 2));
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}/protection`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadJson)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Successfully configured protection for ${branchName}`);
          resolve(true);
        } else {
          console.error(`❌ Error configuring protection for ${branchName}`);
          console.error(`   Status: ${res.statusCode}`);
          try {
            const errorData = JSON.parse(data);
            console.error(`   Message: ${errorData.message || 'Unknown error'}`);
          } catch {
            console.error(`   Response: ${data.substring(0, 200)}`);
          }
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error configuring protection for ${branchName}:`, error.message);
      resolve(false);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      console.error(`❌ Timeout configuring protection for ${branchName}`);
      resolve(false);
    });

    req.write(payloadJson);
    req.end();
  });
}

async function applyBranchProtection(branchName, rule, useToken = false, token = null, dryRun = false) {
  console.log(`\n🔒 Configuring branch protection for: ${branchName}`);
  console.log(`   Description: ${rule.description || 'N/A'}`);

  if (useToken && token) {
    return await applyBranchProtectionViaAPI(branchName, rule, token, dryRun);
  } else {
    return applyBranchProtectionViaCLI(branchName, rule, dryRun);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const branchArg = args.find(arg => arg.startsWith('--branch='))?.split('=')[1] ||
                    args.find(arg => arg.startsWith('-b='))?.split('=')[1];

  console.log('\n📋 Branch Protection Configuration from JSON\n');
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`JSON File: ${JSON_FILE}\n`);

  // Read JSON file
  const config = readJsonFile(JSON_FILE);
  const rules = config.branch_protection_rules;

  // Determine authentication method
  let useCLI = false;
  let useToken = false;
  let token = null;

  // Check GitHub CLI first
  if (testGitHubCLI()) {
    if (dryRun || testGitHubAuth()) {
      useCLI = true;
      console.log('✅ Using GitHub CLI for authentication\n');
    } else {
      console.warn('⚠️  GitHub CLI is installed but not authenticated.');
      console.warn('   Checking for GITHUB_TOKEN environment variable...\n');
    }
  }

  // If CLI not available or not authenticated, try token
  if (!useCLI) {
    token = getGitHubToken();
    if (token) {
      useToken = true;
      console.log('✅ Using GITHUB_TOKEN for authentication\n');
      
      // Test token (async, but we'll proceed anyway)
      if (!dryRun) {
        console.log('   Testing token...');
        // Note: We'll test during actual API call
      }
    } else if (!dryRun) {
      // Only require authentication for actual runs, not dry-run
      console.error('❌ No authentication method available.');
      console.error('\nOptions:');
      console.error('  1. Install and authenticate GitHub CLI:');
      console.error('     Windows: winget install --id GitHub.cli');
      console.error('     Then: gh auth login');
      console.error('\n  2. Or set GITHUB_TOKEN environment variable:');
      console.error('     Windows: $env:GITHUB_TOKEN="your_token_here"');
      console.error('     Linux/Mac: export GITHUB_TOKEN="your_token_here"');
      console.error('\n  3. Get token from: https://github.com/settings/tokens');
      console.error('     Required scope: repo (Full control of private repositories)');
      console.error('\n💡 For dry-run mode, authentication is not required.');
      process.exit(1);
    } else {
      // Dry-run mode - no authentication needed
      console.log('⚠️  No authentication method available (dry-run mode - OK)\n');
    }
  }

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Determine which branches to configure
  const branchesToConfigure = branchArg 
    ? [branchArg]
    : Object.keys(rules);

  let successCount = 0;
  let failCount = 0;

  // Apply rules
  for (const branchName of branchesToConfigure) {
    if (!rules[branchName]) {
      console.warn(`⚠️  No rule found for branch: ${branchName}`);
      continue;
    }

    const success = await applyBranchProtection(
      branchName, 
      rules[branchName], 
      useToken || dryRun, // Use token if available, or if dry-run
      token, 
      dryRun
    );
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log(`📝 Total: ${branchesToConfigure.length}`);

  if (dryRun) {
    console.log('\n💡 To apply these changes, run without --dry-run flag');
  } else {
    console.log('\n✅ Configuration complete!');
    console.log('\nVerify at:');
    console.log(`  https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches`);
  }
  console.log('');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
