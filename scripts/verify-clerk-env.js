#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify Clerk environment variables are set correctly in Vercel.
 * 
 * This script checks for:
 * - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 * - CLERK_SECRET_KEY
 * 
 * And validates:
 * - No extra spaces
 * - No quotes
 * - Correct format (pk_/sk_ prefix)
 */

const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

const optionalVars = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
];

function checkVariable(name, value) {
  const issues = [];
  
  if (!value || value.trim() === '') {
    issues.push('❌ Variable is empty or not set');
    return { name, value, issues, valid: false };
  }
  
  // Check for extra spaces
  if (value !== value.trim()) {
    issues.push('⚠️  Contains leading/trailing spaces');
  }
  
  // Check for quotes
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    issues.push('⚠️  Contains quotes (remove quotes in Vercel)');
  }
  
  // Validate format
  if (name === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
    if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
      issues.push('⚠️  Should start with pk_test_ or pk_live_');
    }
  }
  
  if (name === 'CLERK_SECRET_KEY') {
    if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
      issues.push('⚠️  Should start with sk_test_ or sk_live_');
    }
  }
  
  const valid = issues.length === 0;
  return { name, value: value.substring(0, 20) + '...', issues, valid };
}

function main() {
  console.log('🔍 Checking Clerk Environment Variables...\n');
  
  let allValid = true;
  const results = [];
  
  // Check required variables
  console.log('📋 Required Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const check = checkVariable(varName, value);
    results.push(check);
    
    if (check.valid) {
      console.log(`  ✅ ${varName}`);
      console.log(`     Value: ${check.value}`);
    } else {
      console.log(`  ❌ ${varName}`);
      check.issues.forEach(issue => console.log(`     ${issue}`));
      allValid = false;
    }
    console.log();
  }
  
  // Check optional variables
  console.log('📋 Optional Variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      const check = checkVariable(varName, value);
      if (check.valid) {
        console.log(`  ✅ ${varName} = ${value}`);
      } else {
        console.log(`  ⚠️  ${varName}`);
        check.issues.forEach(issue => console.log(`     ${issue}`));
      }
    } else {
      console.log(`  ⚪ ${varName} (not set, optional)`);
    }
    console.log();
  }
  
  // Summary
  console.log('📝 Summary:');
  if (allValid) {
    console.log('  ✅ All required Clerk variables are set correctly!');
    console.log('\n💡 Next steps:');
    console.log('  1. Verify in Vercel Dashboard → Project → Settings → Environment Variables');
    console.log('  2. Ensure variables are set for Production + Preview environments');
    console.log('  3. Clear Turbo cache: rm -rf .turbo && npm run build');
    console.log('  4. Redeploy on Vercel');
  } else {
    console.log('  ❌ Some required variables are missing or invalid!');
    console.log('\n🔧 Fix in Vercel:');
    console.log('  1. Go to Vercel → Project → Settings → Environment Variables');
    console.log('  2. Add/Edit these variables:');
    requiredVars.forEach(v => {
      if (!process.env[v] || process.env[v].trim() === '') {
        console.log(`     - ${v} (REQUIRED)`);
      }
    });
    console.log('  3. Make sure:');
    console.log('     - No extra spaces');
    console.log('     - No quotes around values');
    console.log('     - Set for Production + Preview');
    process.exit(1);
  }
}

main();
