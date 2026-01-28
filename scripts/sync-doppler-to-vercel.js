#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sync Doppler secrets -> Vercel Environment Variables (non-interactive).
 *
 * Requirements:
 * - Doppler CLI installed + authenticated (or in CI via dopplerhq/cli-action)
 * - Vercel token available as VERCEL_TOKEN
 * - Vercel project available as VERCEL_PROJECT_ID (recommended) or VERCEL_PROJECT_NAME
 *
 * Usage:
 *   node scripts/sync-doppler-to-vercel.js --env=development
 *   node scripts/sync-doppler-to-vercel.js --env=preview --dry-run
 *   node scripts/sync-doppler-to-vercel.js --env=production --config=prod
 *
 * Notes:
 * - This script uses Vercel REST API (v10) to sync environment variables.
 * - It handles existing variables by updating them with PATCH to avoid conflicts.
 * - It does NOT delete/prune variables that exist in Vercel but not in Doppler.
 * - Variables that are already up-to-date are skipped.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

/** Load .env and .env.local so VERCEL_PROJECT_ID / VERCEL_TOKEN are available when running via npm. */
function loadEnvFiles() {
  for (const name of ['.env', '.env.local']) {
    const filePath = path.join(cwd, name);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/g)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/\\'/g, "'");
      if (key && !key.startsWith('#')) process.env[key] = value;
    }
  }
}
loadEnvFiles();

const args = process.argv.slice(2);

function parseArgValue(prefix) {
  const arg = args.find((a) => a.startsWith(prefix));
  if (!arg) return undefined;
  return arg.slice(prefix.length);
}

const options = {
  env: parseArgValue('--env=') || 'development',
  dryRun: args.includes('--dry-run'),
  project:
    parseArgValue('--project=') ||
    process.env.VERCEL_PROJECT_ID ||
    process.env.VERCEL_PROJECT_NAME,
  teamId: parseArgValue('--teamId=') || process.env.VERCEL_TEAM_ID,
  teamSlug: parseArgValue('--teamSlug=') || process.env.VERCEL_TEAM_SLUG,
  dopplerConfig: parseArgValue('--config='),
  allowlistPath: parseArgValue('--allowlist='),
};

/**
 * Mapping of Vercel environments to Doppler configuration names.
 * Doppler configs: dev (development), staging (preview), prd (production).
 * Override with --config= e.g. --env=preview --config=preview if you use 'preview' in Doppler.
 */
const ENV_TO_DOPPLER_CONFIG = {
  development: 'dev',
  preview: 'staging',
  production: 'prd',
};

const TARGETS = new Set(['development', 'preview', 'production']);
if (!TARGETS.has(options.env)) {
  console.error(
    `Invalid --env value '${options.env}'. Expected one of: development | preview | production`
  );
  process.exit(1);
}

const dopplerConfig = options.dopplerConfig || ENV_TO_DOPPLER_CONFIG[options.env];

// Try to get VERCEL_TOKEN from environment or Doppler
let vercelToken = process.env.VERCEL_TOKEN;

// If not in environment, try to get it from Doppler
if (!vercelToken && !options.dryRun) {
  try {
    const dopplerResult = spawnSync(
      'doppler',
      ['secrets', 'get', 'VERCEL_TOKEN', '--plain', '--config', dopplerConfig],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    if (dopplerResult.status === 0 && dopplerResult.stdout) {
      vercelToken = dopplerResult.stdout.trim();
    }
  } catch (e) {
    // Ignore errors, will show helpful message below
  }
}

if (!vercelToken && !options.dryRun) {
  console.error('❌ Missing VERCEL_TOKEN');
  console.error('');
  console.error('The VERCEL_TOKEN is required to sync environment variables to Vercel.');
  console.error('');
  console.error('Options:');
  console.error('  1. Set it as an environment variable:');
  console.error('     PowerShell: $env:VERCEL_TOKEN = "your_token_here"');
  console.error('     Bash:       export VERCEL_TOKEN="your_token_here"');
  console.error('');
  console.error('  2. Store it in Doppler (recommended):');
  console.error('     doppler secrets set VERCEL_TOKEN="your_token_here" --config=' + dopplerConfig);
  console.error('');
  console.error('  3. Get your token from: https://vercel.com/account/tokens');
  console.error('');
  console.error('Then run the sync command again.');
  process.exit(1);
}

if (!options.project) {
  console.error(
    'Missing Vercel project. Set VERCEL_PROJECT_ID (preferred) or VERCEL_PROJECT_NAME, or pass --project='
  );
  process.exit(1);
}

if (typeof fetch !== 'function') {
  console.error(
    'Global fetch() not found. Use Node.js 18+ (GitHub Actions setup-node@v3 node-version: 18).'
  );
  process.exit(1);
}

function maskValue(key, value) {
  if (isSensitiveKey(key)) return '********';
  if (value.length > 60) return `${value.slice(0, 60)}...`;
  return value;
}

function isSensitiveKey(key) {
  const upper = key.toUpperCase();
  const needles = [
    'SECRET',
    'TOKEN',
    'PASSWORD',
    'PRIVATE',
    'ACCESS_KEY',
    'SECRET_ACCESS_KEY',
    'DATABASE_URL',
    'JWT',
    'WEBHOOK',
    'API_KEY',
    'STRIPE_SECRET_KEY',
    'CLERK_SECRET_KEY',
  ];
  return needles.some((n) => upper.includes(n));
}

function readAllowlist(filePath) {
  if (!filePath) return null;
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    console.error(`Allowlist file not found: ${abs}`);
    process.exit(1);
  }
  const content = fs.readFileSync(abs, 'utf8');
  const keys = content
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  return new Set(keys);
}

function getDopplerSecrets() {
  const result = spawnSync(
    'doppler',
    ['secrets', 'download', '--no-file', '--format', 'json', '--config', dopplerConfig],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) {
    console.error('Failed to fetch Doppler secrets.');
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(result.stdout);
  } catch (e) {
    console.error('Failed to parse Doppler JSON output.');
    console.error(String(e));
    process.exit(1);
  }

  // Doppler commonly returns { KEY: "value" }, but we defensively support
  // { KEY: { raw, computed } } style objects too.
  const secrets = {};
  for (const [key, v] of Object.entries(json)) {
    if (key.startsWith('DOPPLER_')) continue;
    if (v && typeof v === 'object') {
      secrets[key] = String(v.computed ?? v.raw ?? '');
    } else {
      secrets[key] = String(v ?? '');
    }
  }
  return secrets;
}

function vercelBaseUrl() {
  const base = `https://api.vercel.com/v10/projects/${encodeURIComponent(options.project)}/env`;
  const qp = new URLSearchParams();
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  return `${base}${qp.toString() ? '?' + qp.toString() : ''}`;
}

let existingEnvVarsCache = null;

async function verifyProjectAccess() {
  // First, verify the project exists and we have access
  const projectUrl = `https://api.vercel.com/v9/projects/${encodeURIComponent(options.project)}`;
  const qp = new URLSearchParams();
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  const verifyUrl = `${projectUrl}${qp.toString() ? '?' + qp.toString() : ''}`;

  const res = await fetch(verifyUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
    },
  });

  if (res.status === 404) {
    throw new Error(
      `Project not found: ${options.project}\n` +
      `This could mean:\n` +
      `  1. The VERCEL_PROJECT_ID is incorrect\n` +
      `  2. The VERCEL_TOKEN doesn't have access to this project\n` +
      `  3. The project doesn't exist\n\n` +
      `To fix:\n` +
      `  - Verify project ID in Vercel dashboard: Settings → General → Project ID\n` +
      `  - Check VERCEL_TOKEN has access to this project\n` +
      `  - Ensure you're using the correct team ID if project is under a team`
    );
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to verify project access (${res.status}): ${errorText}\n` +
      `Project ID: ${options.project}`
    );
  }

  return true;
}

async function getExistingEnvVars() {
  if (existingEnvVarsCache !== null) {
    return existingEnvVarsCache;
  }

  // Verify project access first
  try {
    await verifyProjectAccess();
  } catch (error) {
    // If project verification fails, don't cache empty array - throw the error
    throw error;
  }

  const url = vercelBaseUrl();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
    },
  });

  if (res.status === 404) {
    throw new Error(
      `Project not found: ${options.project}\n` +
      `Verify the VERCEL_PROJECT_ID is correct in Doppler or environment variables.`
    );
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch environment variables (${res.status}): ${errorText}`
    );
  }

  const data = await res.json();
  existingEnvVarsCache = (data && data.envs) ? data.envs : [];
  return existingEnvVarsCache;
}

async function getExistingEnvVar(key) {
  const envVars = await getExistingEnvVars();
  const matching = envVars.filter((env) => env.key === key);
  const withTarget = matching.find((env) => env.target && env.target.includes(options.env));
  return withTarget || matching[0] || null;
}

async function getAllExistingEnvVarsForKey(key) {
  const envVars = await getExistingEnvVars();
  return envVars.filter((env) => env.key === key);
}

async function updateEnvVar(envVarId, existing, { key, value, type }) {
  const url = `${vercelBaseUrl()}/${envVarId}`;
  const qp = new URLSearchParams();
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  const updateUrl = `${url}${qp.toString() ? '?' + qp.toString() : ''}`;

  const existingTargets = existing.target || [];
  const hasTargetEnv = existingTargets.includes(options.env);
  const newTargets = hasTargetEnv 
    ? existingTargets
    : [...existingTargets, options.env];

  // Vercel doesn't allow changing the type of sensitive/encrypted variables
  const existingIsEncrypted = existing.type === 'encrypted' || existing.type === 'sensitive';
  const finalType = existingIsEncrypted ? existing.type : type;

  const body = {
    value,
    type: finalType,
    target: newTargets,
  };

  const res = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = text;
    }
    throw new Error(`Failed to update variable: ${JSON.stringify(errorData)}`);
  }

  return true;
}

async function deleteEnvVar(envVarId) {
  const url = `${vercelBaseUrl()}/${envVarId}`;
  const qp = new URLSearchParams();
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  const deleteUrl = `${url}${qp.toString() ? '?' + qp.toString() : ''}`;

  const res = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
    },
  });

  return res.ok;
}

async function upsertEnvVar({ key, value, type }) {
  const allExisting = await getAllExistingEnvVarsForKey(key);
  const existingWithTarget = allExisting.find((env) => env.target && env.target.includes(options.env));
  const existing = existingWithTarget || allExisting[0] || null;

  if (existing) {
    const hasTargetEnv = existing.target && existing.target.includes(options.env);
    const existingIsEncrypted = existing.type === 'encrypted' || existing.type === 'sensitive';
    const newIsEncrypted = type === 'encrypted';
    const isEncrypted = existingIsEncrypted || newIsEncrypted;
    const finalType = existingIsEncrypted ? existing.type : type;
    const valueMatches = isEncrypted ? false : (existing.value === value);
    const typeMatches = existing.type === finalType;
    
    if (hasTargetEnv && valueMatches && typeMatches && !isEncrypted) {
      return { skipped: true, reason: 'already up to date' };
    }

    try {
      await updateEnvVar(existing.id, existing, { key, value, type: finalType });
      return { updated: true };
    } catch (updateError) {
      const hasMultipleEntries = allExisting.length > 1;
      const isSingleEnv = existing.target && existing.target.length === 1 && existing.target[0] === options.env;
      const protectedVars = ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID'];
      const isProtected = protectedVars.includes(key);
      
      if (isProtected) {
        throw new Error(`Failed to update protected variable ${key}: ${updateError.message}`);
      }
      
      if (hasMultipleEntries && hasTargetEnv) {
        const deleted = await deleteEnvVar(existing.id);
        if (!deleted) {
          existingEnvVarsCache = null;
          const freshExisting = await getExistingEnvVar(key);
          if (freshExisting && freshExisting.id !== existing.id) {
            const existingIsEncrypted = freshExisting.type === 'encrypted' || freshExisting.type === 'sensitive';
            const finalType = existingIsEncrypted ? freshExisting.type : type;
            try {
              await updateEnvVar(freshExisting.id, freshExisting, { key, value, type: finalType });
              return { updated: true, retried: true };
            } catch {
              throw new Error(`Failed to delete or update variable ${key} for ${options.env}: ${updateError.message}`);
            }
          }
          throw new Error(`Failed to delete existing variable ${key} for ${options.env}: ${updateError.message}`);
        }
      } else if (isSingleEnv) {
        const deleted = await deleteEnvVar(existing.id);
        if (!deleted) {
          throw new Error(`Failed to delete existing variable ${key}: ${updateError.message}`);
        }
      } else {
        existingEnvVarsCache = null;
        const freshExisting = await getExistingEnvVar(key);
        if (freshExisting) {
          const existingIsEncrypted = freshExisting.type === 'encrypted' || freshExisting.type === 'sensitive';
          const finalType = existingIsEncrypted ? freshExisting.type : type;
          try {
            await updateEnvVar(freshExisting.id, freshExisting, { key, value, type: finalType });
            return { updated: true, retried: true };
          } catch (retryError) {
            throw new Error(`Failed to update variable ${key} (exists for multiple environments): ${updateError.message}. Retry also failed: ${retryError.message}`);
          }
        }
        throw new Error(`Failed to update variable ${key} (exists for multiple environments): ${updateError.message}`);
      }
    }
  }

  // Variable doesn't exist or was deleted - create new
  const body = {
    key,
    value,
    type,
    target: [options.env],
    comment: `Synced from Doppler config '${dopplerConfig}'`,
  };

  const url = vercelBaseUrl();
  const qp = new URLSearchParams({ upsert: 'true' });
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  const createUrl = `${url}?${qp.toString()}`;

  const res = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 400) {
      try {
        const errorData = typeof data === 'object' ? data : JSON.parse(text);
        if (errorData.error && errorData.error.code === 'ENV_CONFLICT') {
          existingEnvVarsCache = null;
          const existingNow = await getExistingEnvVar(key);
          if (existingNow) {
            const existingIsEncrypted = existingNow.type === 'encrypted' || existingNow.type === 'sensitive';
            const finalType = existingIsEncrypted ? existingNow.type : type;
            
            try {
              await updateEnvVar(existingNow.id, existingNow, { key, value, type: finalType });
              return { updated: true, retried: true };
            } catch (retryError) {
              const isSingleEnv = existingNow.target && existingNow.target.length === 1 && existingNow.target[0] === options.env;
              if (isSingleEnv && !existingIsEncrypted) {
                const deleted = await deleteEnvVar(existingNow.id);
                if (deleted) {
                  return await upsertEnvVar({ key, value, type });
                }
              }
              throw new Error(`Failed to update variable ${key} after conflict: ${retryError.message}`);
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 500));
            existingEnvVarsCache = null;
            const existingRetry = await getExistingEnvVar(key);
            if (existingRetry) {
              const existingIsEncrypted = existingRetry.type === 'encrypted' || existingRetry.type === 'sensitive';
              const finalType = existingIsEncrypted ? existingRetry.type : type;
              await updateEnvVar(existingRetry.id, existingRetry, { key, value, type: finalType });
              return { updated: true, retried: true };
            }
          }
        }
      } catch (parseError) {
        // Fall through to throw original error
      }
    }
    
    const msg = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Vercel API error (${res.status}): ${msg}`);
  }

  return data;
}

async function main() {
  console.log(
    `Syncing Doppler '${dopplerConfig}' -> Vercel '${options.env}' (project: ${options.project})`
  );
  if (options.teamId) console.log(`Team: ${options.teamId}`);
  if (options.teamSlug) console.log(`Team slug: ${options.teamSlug}`);
  if (options.dryRun) console.log('Dry run enabled (no changes will be made).');

  const allowlist = readAllowlist(options.allowlistPath);
  const dopplerSecrets = getDopplerSecrets();

  const entries = Object.entries(dopplerSecrets).filter(([k]) => (allowlist ? allowlist.has(k) : true));

  console.log(`Found ${entries.length} secrets to consider.`);
  for (const [key, value] of entries) {
    const type = isSensitiveKey(key) ? 'encrypted' : 'plain';
    console.log(`- ${key} = ${maskValue(key, value)} [${type}]`);
  }

  if (options.dryRun) return;

  // Pre-fetch existing env vars to cache them
  if (!options.dryRun && vercelToken) {
    console.log('Fetching existing Vercel environment variables...');
    try {
      await getExistingEnvVars();
      console.log(`Found ${existingEnvVarsCache.length} existing variables.`);
    } catch (error) {
      console.error('\n❌ Failed to access Vercel project:');
      console.error(error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('  1. Verify VERCEL_PROJECT_ID is correct:');
      console.error('     - Go to Vercel Dashboard → Project → Settings → General');
      console.error('     - Copy the "Project ID" (starts with prj_)');
      console.error('     - Update in Doppler: doppler secrets set VERCEL_PROJECT_ID="prj_..."');
      console.error('\n  2. Verify VERCEL_TOKEN has access:');
      console.error('     - Check token at: https://vercel.com/account/tokens');
      console.error('     - Ensure token has access to this project');
      console.error('     - If project is under a team, you may need VERCEL_TEAM_ID');
      console.error('\n  3. Check if project exists:');
      console.error('     - Visit: https://vercel.com/dashboard');
      console.error('     - Verify the project exists and you have access');
      process.exit(1);
    }
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const [key, value] of entries) {
    const type = isSensitiveKey(key) ? 'encrypted' : 'plain';
    try {
      const result = await upsertEnvVar({ key, value, type });
      if (result && result.skipped) {
        skipped += 1;
        process.stdout.write('s');
      } else {
        ok += 1;
        process.stdout.write('.');
      }
    } catch (e) {
      failed += 1;
      const errorMsg = String(e && e.message ? e.message : e);
      console.error(`\nFailed: ${key}`);
      
      // Provide helpful guidance for 404 errors
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.error(`   Error: ${errorMsg}`);
        if (failed === 1) {
          // Only show detailed help on first failure
          console.error('\n   💡 This usually means:');
          console.error('      - VERCEL_PROJECT_ID is incorrect');
          console.error('      - VERCEL_TOKEN doesn\'t have access to this project');
          console.error('      - Project doesn\'t exist or was deleted');
          console.error('\n   🔧 To fix:');
          console.error('      1. Verify project ID: Vercel Dashboard → Project → Settings → General');
          console.error('      2. Check token access: https://vercel.com/account/tokens');
          console.error('      3. Update in Doppler: doppler secrets set VERCEL_PROJECT_ID="correct_id"');
        }
      } else {
        console.error(`   ${errorMsg}`);
      }
    }
  }

  console.log(`\nDone. Updated ${ok} vars. Skipped ${skipped} (already up to date). Failed ${failed}.`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});
