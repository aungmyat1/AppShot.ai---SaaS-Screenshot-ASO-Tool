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
 * - This script uses Vercel REST API (v10) with `upsert=true`.
 * - It does NOT delete/prune variables that exist in Vercel but not in Doppler.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const ENV_TO_DOPPLER_CONFIG = {
  development: 'dev',
  preview: 'staging',
  production: 'prod',
};

const TARGETS = new Set(['development', 'preview', 'production']);
if (!TARGETS.has(options.env)) {
  console.error(
    `Invalid --env value '${options.env}'. Expected one of: development | preview | production`
  );
  process.exit(1);
}

const dopplerConfig = options.dopplerConfig || ENV_TO_DOPPLER_CONFIG[options.env];

const vercelToken = process.env.VERCEL_TOKEN;
if (!vercelToken && !options.dryRun) {
  console.error('Missing VERCEL_TOKEN. Set it in your shell/CI secrets.');
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

function vercelUrl() {
  const base = `https://api.vercel.com/v10/projects/${encodeURIComponent(options.project)}/env`;
  const qp = new URLSearchParams({ upsert: 'true' });
  if (options.teamId) qp.set('teamId', options.teamId);
  if (options.teamSlug) qp.set('slug', options.teamSlug);
  return `${base}?${qp.toString()}`;
}

async function upsertEnvVar({ key, value, type }) {
  const body = {
    key,
    value,
    type,
    target: [options.env],
    comment: `Synced from Doppler config '${dopplerConfig}'`,
  };

  const res = await fetch(vercelUrl(), {
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

  let ok = 0;
  let failed = 0;

  for (const [key, value] of entries) {
    const type = isSensitiveKey(key) ? 'encrypted' : 'plain';
    try {
      await upsertEnvVar({ key, value, type });
      ok += 1;
      process.stdout.write('.');
    } catch (e) {
      failed += 1;
      console.error(`\nFailed: ${key}`);
      console.error(String(e && e.message ? e.message : e));
    }
  }

  console.log(`\nDone. Updated ${ok} vars. Failed ${failed}.`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});

