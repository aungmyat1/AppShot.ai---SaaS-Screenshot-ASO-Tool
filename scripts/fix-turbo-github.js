#!/usr/bin/env node

// Quick fix: Update turbo.json on GitHub to add globalEnv
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found');
  console.log('\n📝 Manual fix (recommended):');
  console.log('1. Go to: https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/edit/main/turbo.json');
  console.log('2. Add these lines after "$schema" line:');
  console.log('\n  "globalEnv": [');
  console.log('    "CLERK_SECRET_KEY",');
  console.log('    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",');
  console.log('    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",');
  console.log('    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",');
  console.log('    "VERCEL",');
  console.log('    "VERCEL_ENV",');
  console.log('    "VERCEL_URL"');
  console.log('  ],');
  console.log('\n3. Commit: "Add globalEnv to expose Clerk keys to Turborepo"');
  console.log('4. Wait 2-3 minutes for Vercel to redeploy');
  console.log('5. Test: https://getappshots.vercel.app\n');
  process.exit(0);
}

console.log('🔧 Updating turbo.json on GitHub via API...\n');
console.log('This will add globalEnv to expose Clerk environment variables.\n');
