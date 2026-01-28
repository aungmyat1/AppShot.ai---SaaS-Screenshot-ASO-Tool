#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify required environment variables are present.
 *
 * Default behavior:
 * - Loads .env, .env.local, .env.[env], .env.[env].local (so vars from .env.local are seen)
 * - Reads keys from `.env.example` and `apps/web/.env.example` (if they exist)
 * - Checks process.env for those keys
 *
 * Usage:
 *   node scripts/verify-env.js
 *   node scripts/verify-env.js --env=production
 *   node scripts/verify-env.js --from=.env.example
 *   node scripts/verify-env.js --ignore=KEY1,KEY2
 *   node scripts/verify-env.js --no-load-env   (skip loading .env files; use only shell env)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgValue(prefix) {
  const arg = args.find((a) => a.startsWith(prefix));
  if (!arg) return undefined;
  return arg.slice(prefix.length);
}

const env =
  parseArgValue('--env=') ||
  process.env.VERCEL_ENV ||
  process.env.NODE_ENV ||
  'development';

const fromArg = parseArgValue('--from=');
const ignoreArg = parseArgValue('--ignore=');
const noLoadEnv = args.includes('--no-load-env');

const ignore = new Set(
  (ignoreArg ? ignoreArg.split(',') : [])
    .map((s) => s.trim())
    .filter(Boolean)
);

const cwd = process.cwd();

/**
 * Parse a .env-style file and set process.env. Does not overwrite existing process.env
 * unless the file value is non-empty (so .env.local can override .env).
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
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

/** Load .env, .env.local, .env.[env], .env.[env].local (Next.js order). */
function loadEnvFiles() {
  if (noLoadEnv) return;
  const files = [
    path.join(cwd, '.env'),
    path.join(cwd, '.env.local'),
    path.join(cwd, `.env.${env}`),
    path.join(cwd, `.env.${env}.local`),
  ];
  for (const f of files) loadEnvFile(f);
}

loadEnvFiles();

function readKeysFromEnvExample(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];

  for (const line of content.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;

    // Support `export KEY=...` (common in some templates)
    const normalized = trimmed.startsWith('export ') ? trimmed.slice('export '.length) : trimmed;

    const m = normalized.match(/^([A-Z0-9_]+)\s*=/);
    if (!m) continue;
    keys.push(m[1]);
  }

  return keys;
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function main() {
  const candidates = [];

  if (fromArg) {
    candidates.push(path.isAbsolute(fromArg) ? fromArg : path.join(process.cwd(), fromArg));
  } else {
    // Single source of truth: root .env.example (matches config/env.config.ts ENV_KEYS)
    candidates.push(path.join(process.cwd(), '.env.example'));
  }

  const keys = unique(candidates.flatMap(readKeysFromEnvExample))
    .filter((k) => !k.startsWith('DOPPLER_'))
    .filter((k) => !ignore.has(k));

  if (keys.length === 0) {
    console.error(
      'No keys found. Pass --from=path/to/.env.example or ensure `.env.example` exists.'
    );
    process.exit(1);
  }

  const missing = [];
  for (const k of keys) {
    if (process.env[k] === undefined || process.env[k] === '') missing.push(k);
  }

  if (missing.length === 0) {
    console.log(`OK: ${keys.length} env vars present for ${env}.`);
    return;
  }

  console.error(`Missing ${missing.length} env vars for ${env}:`);
  for (const k of missing) console.error(`- ${k}`);

  console.error('\nTip: for Doppler-based local dev, run via:');
  console.error('  doppler run -- npm run dev');
  console.error('\nTip: to sync Doppler -> Vercel via API, run:');
  console.error(`  npm run env:sync:${env === 'production' ? 'prod' : env === 'preview' ? 'preview' : 'dev'}`);

  process.exit(1);
}

main();

