#!/usr/bin/env node

/**
 * Check Vercel Git integration & auto-deploy on push to main
 *
 * Verifies that:
 * 1. Project is connected to a Git repository (GitHub/GitLab/Bitbucket)
 * 2. Production branch is set (typically main)
 * 3. Git deployments are enabled (push → new deployment)
 * 4. Project is not paused
 *
 * Usage:
 *   node scripts/check-vercel-git-deploy.js
 *   VERCEL_TOKEN=... VERCEL_PROJECT_ID=... node scripts/check-vercel-git-deploy.js
 *
 * Env:
 *   VERCEL_TOKEN   - Required. https://vercel.com/account/tokens
 *   VERCEL_PROJECT_ID - Required. From Vercel → Project → Settings → General.
 *   VERCEL_TEAM_ID - Optional. For team projects.
 */

const VERCEL_API = 'https://api.vercel.com';

async function getProject() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID is required. Get it from Vercel → Project → Settings → General');
  }

  let url = `${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}`;
  if (teamId) url += `?teamId=${encodeURIComponent(teamId)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${text}`);
  }

  return res.json();
}

function main() {
  console.log('🔍 Checking Vercel Git integration & auto-deploy on push to main/origin\n');
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token) {
    console.error('❌ VERCEL_TOKEN is required. Get it from https://vercel.com/account/tokens');
    process.exit(1);
  }
  if (!projectId) {
    console.error('❌ VERCEL_PROJECT_ID is required. Get it from Vercel → Project → Settings → General');
    process.exit(1);
  }

  getProject()
    .then((p) => {
      const link = p.link;
      const gpo = p.gitProviderOptions || {};
      const createDeployments = gpo.createDeployments;
      const productionBranch = link?.productionBranch;
      const repo = link?.repo;
      const type = link?.type;
      const paused = p.paused === true;

      let ok = true;

      // Git connected
      if (!link || !type) {
        console.log('❌ Git not connected');
        console.log('   → Vercel project is not linked to a Git repository.');
        console.log('   → Fix: Vercel Dashboard → Project → Settings → Git → Connect Git Repository.\n');
        ok = false;
      } else {
        console.log(`✅ Git connected (${type})`);
        if (repo) console.log(`   Repo: ${repo}`);
      }

      // Production branch
      if (!productionBranch) {
        console.log('❌ Production branch not set');
        console.log('   → Set Production Branch in Vercel → Settings → Git (e.g. main).\n');
        ok = false;
      } else {
        const mainOk = /^main$|^master$/i.test(productionBranch);
        console.log(`✅ Production branch: ${productionBranch}${mainOk ? '' : ' (custom)'}`);
        if (!mainOk) {
          console.log('   ⚠️  Typical production branch is "main". Ensure you push to this branch for production deploys.');
        }
      }

      // Create deployments on push
      if (createDeployments === 'disabled') {
        console.log('❌ Deployments on push are disabled');
        console.log('   → Enable in Vercel → Settings → Git → "Create Deployments" (or gitProviderOptions.createDeployments).\n');
        ok = false;
      } else if (createDeployments === 'enabled') {
        console.log('✅ Deployments on push: enabled');
      } else {
        console.log('⚠️  createDeployments: ' + (createDeployments || 'unknown') + ' (expected "enabled")');
      }

      // Paused
      if (paused) {
        console.log('❌ Project is paused – deployments are disabled.');
        console.log('   → Unpause in Vercel Dashboard if you want new deployments.\n');
        ok = false;
      } else {
        console.log('✅ Project not paused');
      }

      console.log('');
      if (ok) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Auto-deploy on push to main/origin is configured correctly.');
        console.log('   Push to your production branch to trigger a new Vercel deployment.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(0);
      } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Some checks failed. Fix the items above, then run this script again.');
        console.log('   Dashboard: https://vercel.com/dashboard → your project → Settings → Git');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

main();
