@echo off
title Oil Vessel Tracking - Development Server
echo ========================================
echo Oil Vessel Tracking Application
echo Maritime Oil Brokerage Platform
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install

echo.
echo Starting development server...
echo Your oil vessel tracking platform will be available at:
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

set NODE_ENV=development
npm run dev

pause