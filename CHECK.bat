@echo off
echo ========================================
echo 5:20 Habit Stack - Setup Verification
echo ========================================
echo.

echo [1/6] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    exit /b 1
)

echo [2/6] Checking pnpm...
pnpm --version
if %errorlevel% neq 0 (
    echo ERROR: pnpm is not installed
    exit /b 1
)

echo [3/6] Checking dependencies...
if not exist "node_modules" (
    echo ERROR: Dependencies not installed. Run 'pnpm install'
    exit /b 1
)
echo OK: Dependencies installed

echo [4/6] Checking database...
if not exist "dev.db" (
    echo ERROR: Database not initialized. Run 'pnpm exec prisma db push'
    exit /b 1
)
echo OK: Database exists

echo [5/6] Checking environment variables...
if not exist ".env" (
    echo WARNING: .env file not found
    echo Please copy .env.example to .env and configure
) else (
    echo OK: .env file exists
)

echo [6/6] Checking Prisma Client...
if not exist "node_modules\.pnpm\@prisma+client@5.22.0_prisma@5.22.0" (
    echo ERROR: Prisma Client not generated. Run 'pnpm exec prisma generate'
    exit /b 1
)
echo OK: Prisma Client generated

echo.
echo ========================================
echo ✅ All checks passed!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env and add your ANTHROPIC_API_KEY
echo 2. Run START.bat to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see QUICKSTART.md
echo ========================================
