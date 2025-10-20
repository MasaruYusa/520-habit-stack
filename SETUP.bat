@echo off
echo ========================================
echo 5:20 Habit Stack - Initial Setup
echo ========================================
echo.
echo This script will set up the project for development.
echo.

echo [1/5] Installing dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

echo.
echo [2/5] Generating Prisma Client...
pnpm exec prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma Client
    exit /b 1
)

echo.
echo [3/5] Initializing database...
pnpm exec prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database
    exit /b 1
)

echo.
echo [4/5] Checking environment file...
if not exist ".env" (
    echo Creating .env from sample...
    copy .env.example .env
    echo.
    echo ⚠️ IMPORTANT: Edit .env and add your API keys!
)

echo.
echo [5/5] Initializing Git repository...
git init
git add .
git commit -m "Initial commit: 5:20 Habit Stack MVP"

echo.
echo ========================================
echo ✅ Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env and add your ANTHROPIC_API_KEY
echo    Get it from: https://console.anthropic.com/
echo.
echo 2. (Optional) Set up email provider in .env
echo    For testing, use: https://ethereal.email/
echo.
echo 3. Run START.bat to start the development server
echo.
echo For detailed instructions, see QUICKSTART.md
echo ========================================
pause
