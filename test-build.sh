#!/bin/bash
# Test script to verify Vercel build will work

echo "======================================"
echo "Testing Vercel Build Configuration"
echo "======================================"
echo ""

# Step 1: Clean install (matching Vercel config)
echo "Step 1: Testing npm install --workspaces..."
npm install --workspaces
if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi
echo "✅ npm install succeeded"
echo ""

# Step 2: Verify workspace structure
echo "Step 2: Verifying workspace structure..."
if [ -d "apps/web" ]; then
  echo "✅ apps/web exists"
else
  echo "❌ apps/web not found"
  exit 1
fi

if [ -f "apps/web/package.json" ]; then
  echo "✅ apps/web/package.json exists"
else
  echo "❌ apps/web/package.json not found"
  exit 1
fi
echo ""

# Step 3: Test turbo build command
echo "Step 3: Testing turbo build command..."
echo "Running: npx turbo run build --filter=getappshots"
npx turbo run build --filter=getappshots
if [ $? -ne 0 ]; then
  echo "❌ Turbo build failed"
  exit 1
fi
echo "✅ Turbo build succeeded"
echo ""

echo "======================================"
echo "✅ All tests passed!"
echo "Your Vercel deployment should work now."
echo "======================================"
