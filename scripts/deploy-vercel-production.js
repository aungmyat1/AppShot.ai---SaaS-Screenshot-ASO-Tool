/**
 * Script to deploy the AppShot application to Vercel
 * This script handles the production deployment to make your custom domains work
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Starting Vercel production deployment...');

try {
  // Check if we're in the right directory
  if (!existsSync('./package.json')) {
    throw new Error('No package.json found in current directory');
  }

  console.log('\n📋 Checking Vercel CLI installation...');
  try {
    execSync('npx vercel --version', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  console.log('\n🔐 Attempting to log in to Vercel...');
  execSync('npx vercel login', { stdio: 'inherit' });

  console.log('\n🌐 Ensuring we are in the correct project...');
  execSync('npx vercel link', { stdio: 'inherit' });

  console.log('\n📦 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n🚀 Deploying to Vercel production...');
  execSync('npx vercel --prod --force', { stdio: 'inherit' });

  console.log('\n✅ Application deployed successfully!');
  console.log('Your domains should now point to the production deployment.');
  console.log('- https://getappshots.com');
  console.log('- https://www.getappshots.com');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  
  if (error.stdout) {
    console.error('STDOUT:', error.stdout.toString());
  }
  
  if (error.stderr) {
    console.error('STDERR:', error.stderr.toString());
  }
  
  process.exit(1);
}