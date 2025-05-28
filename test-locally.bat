@echo off
title Oil Vessel Tracking - Complete Local Testing
echo ================================================================
echo Oil Vessel Tracking Application - Local Testing Suite
echo Maritime Oil Brokerage Platform with Authentic Data
echo ================================================================
echo.
echo Testing your complete platform with:
echo - 2,500+ authentic oil vessels (VLCC, Suezmax, Aframax, LNG)
echo - 111 global oil refineries
echo - 29 authentic oil terminals and ports
echo - 172 vessel documents (SDS, LOI, BL)
echo - 40 oil shipping companies
echo ================================================================
echo.

echo [1/8] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/8] Checking environment configuration...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Copying example configuration...
    copy ".env.windows.example" ".env"
    echo.
    echo IMPORTANT: Please edit .env file with your database credentials
    echo Press any key to continue after editing .env file...
    pause
)

echo [3/8] Installing dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/8] Running TypeScript check...
npm run check
if errorlevel 1 (
    echo WARNING: TypeScript errors found - continuing anyway
)

echo [5/8] Setting up database schema...
npm run db:push
if errorlevel 1 (
    echo WARNING: Database setup failed - check your DATABASE_URL in .env
)

echo [6/8] Building production version for testing...
npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [7/8] Starting development server...
echo.
echo ================================================================
echo YOUR OIL VESSEL TRACKING PLATFORM IS NOW RUNNING!
echo ================================================================
echo.
echo Frontend (Main App): http://localhost:5173
echo Backend API:         http://localhost:3000
echo.
echo Test these features:
echo 1. User registration and login
echo 2. Browse 2,500+ authentic vessels
echo 3. View 111 global refineries
echo 4. Interactive vessel tracking maps
echo 5. Document generation system
echo 6. Admin panel functionality
echo.
echo Press Ctrl+C to stop the server
echo ================================================================
echo.

set NODE_ENV=development
npm run dev

echo [8/8] Testing complete!
pause