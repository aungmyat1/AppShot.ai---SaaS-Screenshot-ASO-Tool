#!/usr/bin/env node
/**
 * Trigger Vercel deployment via Deploy Hook URL (no secrets in repo).
 * Set VERCEL_DEPLOY_HOOK_PREVIEW and/or VERCEL_DEPLOY_HOOK_PRODUCTION in env or GitHub Secrets.
 *
 * Usage: node scripts/deploy-hook.js [preview|production]
 *   npm run deploy:hook:preview
 *   npm run deploy:hook:prod
 */

const target = process.argv[2] || '';

let url;
if (target === 'preview') {
  url = process.env.VERCEL_DEPLOY_HOOK_PREVIEW;
} else if (target === 'production' || target === 'prod') {
  url = process.env.VERCEL_DEPLOY_HOOK_PRODUCTION;
} else {
  console.error('Usage: node scripts/deploy-hook.js preview|production');
  console.error('  preview     - uses VERCEL_DEPLOY_HOOK_PREVIEW');
  console.error('  production  - uses VERCEL_DEPLOY_HOOK_PRODUCTION');
  console.error('Never commit hook URLs; use Vercel env vars or GitHub Secrets.');
  process.exit(1);
}

if (!url) {
  const varName = target === 'preview' ? 'VERCEL_DEPLOY_HOOK_PREVIEW' : 'VERCEL_DEPLOY_HOOK_PRODUCTION';
  console.error(`❌ ${varName} is not set. Create a Deploy Hook in Vercel → Settings → Git → Deploy Hooks.`);
  process.exit(1);
}

async function main() {
  const label = target === 'preview' ? 'Preview' : 'Production';
  console.log(`Triggering ${label.toLowerCase()} deployment...`);
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    console.error(`❌ Deploy hook failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  console.log('✅ Deploy hook sent.');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
