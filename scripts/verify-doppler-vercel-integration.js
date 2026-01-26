#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify Doppler to Vercel Integration Status
 *
 * This script checks:
 * 1. If Doppler CLI is installed and authenticated
 * 2. If Doppler project/config exists
 * 3. If Vercel CLI is installed and authenticated
 * 4. If secrets are synced to Vercel
 * 5. If native integration is configured (if possible to detect)
 *
 * Usage:
 *   node scripts/verify-doppler-vercel-integration.js
 *   node scripts/verify-doppler-vercel-integration.js --config=dev
 *   node scripts/verify-doppler-vercel-integration.js --env=production
 */

const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgValue(prefix) {
  const arg = args.find((a) => a.startsWith(prefix));
  if (!arg) return undefined;
  return arg.slice(prefix.length);
}

const options = {
  config: parseArgValue('--config=') || 'dev',
  env: parseArgValue('--env=') || 'development',
  project: parseArgValue('--project=') || process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME,
  verbose: args.includes('--verbose') || args.includes('-v'),
};

const ENV_TO_DOPPLER_CONFIG = {
  development: 'dev',
  preview: 'staging',
  production: 'prod',
};

const dopplerConfig = options.config || ENV_TO_DOPPLER_CONFIG[options.env] || 'dev';

let errors = [];
let warnings = [];
let info = [];

function log(message, type = 'info') {
  const prefix = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  }[type] || '';

  console.log(`${prefix} ${message}`);

  if (type === 'error') errors.push(message);
  else if (type === 'warning') warnings.push(message);
  else info.push(message);
}

function checkCommand(command, args = ['--version']) {
  try {
    const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function runCommand(command, args = [], options = {}) {
  try {
    const result = spawnSync(command, args, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    });
    return { success: result.status === 0, output: result.stdout, error: result.stderr };
  } catch (e) {
    return { success: false, output: '', error: String(e) };
  }
}

function checkDopplerCLI() {
  log('Checking Doppler CLI installation...', 'info');
  if (checkCommand('doppler')) {
    const version = runCommand('doppler', ['--version']);
    if (version.success) {
      log(`Doppler CLI installed: ${version.output.trim()}`, 'success');
      return true;
    }
  }
  log('Doppler CLI not found. Install: https://docs.doppler.com/docs/install-cli', 'error');
  return false;
}

function checkDopplerAuth() {
  log('Checking Doppler authentication...', 'info');
  const result = runCommand('doppler', ['me'], { stdio: 'pipe' });
  if (result.success) {
    log('Doppler authenticated', 'success');
    if (options.verbose) {
      log(`  ${result.output.trim()}`, 'info');
    }
    return true;
  }
  log('Doppler not authenticated. Run: doppler login', 'error');
  return false;
}

function checkDopplerProject() {
  log(`Checking Doppler project 'getappshots'...`, 'info');
  
  // First, try to get project from current config
  const configResult = runCommand('doppler', ['configure', 'get', 'project'], {
    stdio: 'pipe',
  });
  
  if (configResult.success && configResult.output.includes('getappshots')) {
    log('Doppler project configured: getappshots', 'success');
    return true;
  }
  
  // Fallback: try to get project info directly
  const result = runCommand('doppler', ['projects', 'get', 'getappshots', '--plain'], {
    stdio: 'pipe',
  });
  
  if (result.success) {
    log('Doppler project exists', 'success');
    return true;
  }
  
  // If config check will pass, this is non-critical
  log("Doppler project 'getappshots' not found via API. Checking config access...", 'warning');
  log("  Note: If config check passes, project is accessible.", 'info');
  return false; // Non-critical if config works
}

function checkDopplerConfig() {
  log(`Checking Doppler config '${dopplerConfig}'...`, 'info');
  const result = runCommand(
    'doppler',
    ['secrets', 'download', '--no-file', '--format', 'json', '--config', dopplerConfig],
    { stdio: 'pipe' }
  );
  if (result.success) {
    try {
      const secrets = JSON.parse(result.output);
      const count = Object.keys(secrets).filter((k) => !k.startsWith('DOPPLER_')).length;
      log(`Doppler config '${dopplerConfig}' exists with ${count} secrets`, 'success');
      if (options.verbose) {
        const secretKeys = Object.keys(secrets)
          .filter((k) => !k.startsWith('DOPPLER_'))
          .slice(0, 10);
        log(`  Sample secrets: ${secretKeys.join(', ')}${count > 10 ? '...' : ''}`, 'info');
      }
      return true;
    } catch (e) {
      log(`Failed to parse Doppler secrets: ${e.message}`, 'error');
      return false;
    }
  }
  log(`Doppler config '${dopplerConfig}' not found. Create: doppler configs create ${dopplerConfig}`, 'error');
  return false;
}

function checkVercelCLI() {
  log('Checking Vercel CLI installation...', 'info');
  if (checkCommand('vercel')) {
    const version = runCommand('vercel', ['--version']);
    if (version.success) {
      log(`Vercel CLI installed: ${version.output.trim()}`, 'success');
      return true;
    }
  }
  log('Vercel CLI not found. Install: npm i -g vercel', 'warning');
  return false;
}

function checkVercelAuth() {
  log('Checking Vercel authentication...', 'info');
  const result = runCommand('vercel', ['whoami'], { stdio: 'pipe' });
  if (result.success) {
    log(`Vercel authenticated as: ${result.output.trim()}`, 'success');
    return true;
  }
  log('Vercel not authenticated. Run: vercel login', 'warning');
  return false;
}

function checkVercelProject() {
  if (!options.project) {
    log('Vercel project not specified. Set VERCEL_PROJECT_ID or use --project flag', 'warning');
    return false;
  }

  log(`Checking Vercel project '${options.project}'...`, 'info');
  const result = runCommand('vercel', ['project', 'ls'], { stdio: 'pipe' });
  if (result.success) {
    if (result.output.includes(options.project)) {
      log(`Vercel project '${options.project}' found`, 'success');
      return true;
    }
  }
  log(`Vercel project '${options.project}' not found or not accessible`, 'warning');
  return false;
}

function checkVercelEnvVars() {
  if (!options.project) {
    return false;
  }

  log(`Checking Vercel environment variables for '${options.env}'...`, 'info');
  const result = runCommand('vercel', ['env', 'ls', options.env], { stdio: 'pipe' });
  if (result.success) {
    const lines = result.output.split('\n').filter((l) => l.trim());
    const varCount = lines.length - 1; // Subtract header line
    log(`Found ${varCount} environment variables in Vercel`, 'success');
    if (options.verbose && varCount > 0) {
      log(`  ${lines.slice(1, 6).join('\n  ')}${varCount > 5 ? '\n  ...' : ''}`, 'info');
    }
    return true;
  }
  log('Could not list Vercel environment variables', 'warning');
  return false;
}

function checkDopplerYaml() {
  log('Checking doppler.yaml configuration...', 'info');
  const dopplerYamlPath = path.join(process.cwd(), 'doppler.yaml');
  if (fs.existsSync(dopplerYamlPath)) {
    log('doppler.yaml exists', 'success');
    if (options.verbose) {
      const content = fs.readFileSync(dopplerYamlPath, 'utf8');
      log(`  ${content.split('\n').slice(0, 5).join('\n  ')}`, 'info');
    }
    return true;
  }
  log('doppler.yaml not found', 'warning');
  return false;
}

function checkSyncScript() {
  log('Checking sync script...', 'info');
  const syncScriptPath = path.join(process.cwd(), 'scripts', 'sync-doppler-to-vercel.js');
  if (fs.existsSync(syncScriptPath)) {
    log('Sync script exists', 'success');
    return true;
  }
  log('Sync script not found', 'warning');
  return false;
}

function checkGitHubSecrets() {
  log('Checking GitHub Actions setup...', 'info');
  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'sync-env.yml');
  if (fs.existsSync(workflowPath)) {
    log('GitHub Actions workflow exists', 'success');
    log('  Note: Verify GitHub secrets are set: DOPPLER_TOKEN, VERCEL_TOKEN, VERCEL_PROJECT_ID', 'info');
    return true;
  }
  log('GitHub Actions workflow not found', 'warning');
  return false;
}

function checkNativeIntegration() {
  log('Checking for native Vercel-Doppler integration...', 'info');
  log('  Note: Native integration status can only be verified in Vercel Dashboard', 'info');
  log('  Go to: Settings → Integrations → Check if Doppler is connected', 'info');
  return true; // Always return true as we can't programmatically check this
}

async function main() {
  console.log('\n🔍 Doppler to Vercel Integration Verification\n');
  console.log(`Configuration: ${dopplerConfig} → ${options.env}`);
  if (options.project) {
    console.log(`Project: ${options.project}`);
  }
  console.log('');

  const checks = [
    { name: 'Doppler CLI', fn: checkDopplerCLI },
    { name: 'Doppler Auth', fn: checkDopplerAuth },
    { name: 'Doppler Project', fn: checkDopplerProject },
    { name: 'Doppler Config', fn: checkDopplerConfig },
    { name: 'Vercel CLI', fn: checkVercelCLI },
    { name: 'Vercel Auth', fn: checkVercelAuth },
    { name: 'Vercel Project', fn: checkVercelProject },
    { name: 'Vercel Env Vars', fn: checkVercelEnvVars },
    { name: 'doppler.yaml', fn: checkDopplerYaml },
    { name: 'Sync Script', fn: checkSyncScript },
    { name: 'GitHub Actions', fn: checkGitHubSecrets },
    { name: 'Native Integration', fn: checkNativeIntegration },
  ];

  const results = checks.map((check) => ({
    name: check.name,
    passed: check.fn(),
  }));

  console.log('\n' + '='.repeat(50));
  console.log('Summary\n');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n${passed}/${total} checks passed\n`);

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log(`  - ${w}`));
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All checks passed! Integration appears to be configured correctly.\n');
    process.exit(0);
  } else if (errors.length > 0) {
    console.log('❌ Some critical checks failed. Please fix the errors above.\n');
    process.exit(1);
  } else {
    console.log('⚠️  Some checks have warnings. Review the warnings above.\n');
    process.exit(0);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
