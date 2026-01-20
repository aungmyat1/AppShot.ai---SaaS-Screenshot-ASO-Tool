# PowerShell Test script to verify Vercel build will work

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Testing Vercel Build Configuration" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean install (matching Vercel config)
Write-Host "Step 1: Testing npm install --workspaces..." -ForegroundColor Yellow
npm install --workspaces
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm install succeeded" -ForegroundColor Green
Write-Host ""

# Step 2: Verify workspace structure
Write-Host "Step 2: Verifying workspace structure..." -ForegroundColor Yellow
if (Test-Path "apps\web") {
    Write-Host "✅ apps\web exists" -ForegroundColor Green
} else {
    Write-Host "❌ apps\web not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "apps\web\package.json") {
    Write-Host "✅ apps\web\package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ apps\web\package.json not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Test turbo build command
Write-Host "Step 3: Testing turbo build command..." -ForegroundColor Yellow
Write-Host "Running: npx turbo run build --filter=getappshots" -ForegroundColor Gray
npx turbo run build --filter=getappshots
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Turbo build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Turbo build succeeded" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "Your Vercel deployment should work now." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
