#!/usr/bin/env node
/**
 * Create or update branch rollback/pre-npm-ci-refactor at commit before cc9fbcf.
 * If the branch already exists, it is updated to point to that commit.
 * Usage: node scripts/create-rollback-branch.js
 * Then: git push origin rollback/pre-npm-ci-refactor
 */

const { execSync, spawnSync } = require('child_process');

const BRANCH = 'rollback/pre-npm-ci-refactor';
const COMMIT = 'cc9fbcf^';

function run(cmd, options = {}) {
  return spawnSync(cmd, { shell: true, stdio: 'pipe', ...options });
}

// Try to create the branch
let result = run(`git branch ${BRANCH} ${COMMIT}`);

if (result.status !== 0) {
  const stderr = (result.stderr && result.stderr.toString()) || '';
  if (stderr.includes('already exists') || /fatal: a branch named/.test(stderr)) {
    // Branch exists: force-update it to the rollback commit
    result = run(`git branch -f ${BRANCH} ${COMMIT}`);
    if (result.status !== 0) {
      console.error(result.stderr?.toString() || result.error?.message || 'Failed to update branch');
      process.exit(1);
    }
    console.log(`Branch '${BRANCH}' already existed; updated to point to ${COMMIT}.`);
  } else {
    console.error(stderr || result.stdout?.toString() || 'Failed to create branch');
    process.exit(1);
  }
} else {
  console.log(`Branch '${BRANCH}' created at ${COMMIT}.`);
}

console.log('\nPush with: git push origin ' + BRANCH);
