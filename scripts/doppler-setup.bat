@echo off
setlocal EnableDelayedExpansion

echo Setting up Doppler for getappshots project...

REM Check if Doppler CLI is installed
doppler --version >nul 2>&1
if errorlevel 1 (
    echo Error: Doppler CLI is not installed.
    echo Please install Doppler CLI first:
    echo   Using Winget: winget install doppler
    echo   Using Chocolatey: choco install doppler
    echo   Manual installation: https://docs.doppler.com/docs/enclave-installation
    exit /b 1
)

echo Doppler CLI is installed.

REM Setup the Doppler project
echo Setting up Doppler project...
doppler setup --project getappshots

REM Create configurations for different environments
echo Creating Doppler configurations...

echo Creating dev configuration...
doppler configs create dev

echo Creating staging configuration...
doppler configs create staging

echo Creating prod configuration...
doppler configs create prod

echo.
echo Doppler setup completed successfully!
echo.
echo Next steps:
echo 1. Add your environment variables to each config:
echo    doppler secrets set SECRET_KEY=value --config dev
echo    doppler secrets set SECRET_KEY=value --config staging
echo    doppler secrets set SECRET_KEY=value --config prod
echo.
echo 2. Run your application with Doppler:
echo    doppler run -- node app.js
echo    doppler run -- python -m uvicorn app.main:app --reload
echo.
echo 3. To use in development:
echo    doppler run -- npm run dev
echo.
echo For more information, visit: https://docs.doppler.com/docs/enclave-overview.html