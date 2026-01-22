@echo off
setlocal EnableDelayedExpansion

echo Setting up Doppler for getappshots project...
echo.

REM Check if Doppler CLI is installed
doppler --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Doppler CLI is not installed.
    echo.
    echo Please install Doppler CLI first:
    echo   Using Winget: winget install doppler
    echo   Using Chocolatey: choco install doppler
    echo   Manual installation: https://docs.doppler.com/docs/enclave-installation
    echo.
    exit /b 1
)

echo [OK] Doppler CLI is installed.

REM Check if user is logged in
doppler me >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Not logged in to Doppler.
    echo.
    echo Please login to Doppler first:
    echo   Run: doppler login
    echo   This will open your browser to authenticate.
    echo.
    exit /b 1
)

echo [OK] Logged in to Doppler.

REM Setup the Doppler project
echo.
echo Setting up Doppler project...
echo Project: getappshots
echo.
doppler setup --project getappshots

REM Create configurations for different environments
echo.
echo Creating Doppler configurations...
echo.

echo Creating dev configuration (environment: dev)...
doppler configs create dev --environment dev >nul 2>&1
if errorlevel 1 (
    echo [WARNING] dev configuration may already exist, continuing...
) else (
    echo [OK] dev configuration created.
)

echo Creating staging configuration (environment: preview)...
doppler configs create staging --environment preview >nul 2>&1
if errorlevel 1 (
    echo [WARNING] staging configuration may already exist, continuing...
) else (
    echo [OK] staging configuration created.
)

echo Creating prod configuration (environment: prd)...
doppler configs create prod --environment prd >nul 2>&1
if errorlevel 1 (
    echo [WARNING] prod configuration may already exist, continuing...
) else (
    echo [OK] prod configuration created.
)

echo.
echo [OK] Doppler setup completed successfully!
echo.
echo Next steps:
echo 1. Add your environment variables to each config:
echo    doppler secrets set SECRET_KEY=value --config dev
echo    doppler secrets set SECRET_KEY=value --config staging
echo    doppler secrets set SECRET_KEY=value --config prod
echo.
echo 2. Set up Vercel integration (see docs/DOPPLER_VERCEL_INTEGRATION.md)
echo.
echo 3. Run your application with Doppler:
echo    npm run dev:doppler
echo    doppler run -- npm run dev
echo.
echo For more information:
echo   - Integration guide: docs/DOPPLER_VERCEL_INTEGRATION.md
echo   - Doppler docs: https://docs.doppler.com/docs/enclave-overview.html
echo.