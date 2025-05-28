@echo off
title Oil Vessel Tracking - Production Build
echo ========================================
echo Oil Vessel Tracking Application
echo Building for Production (Windows)
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
echo Installing dependencies...
npm install

echo.
echo Running TypeScript check...
npm run check

echo.
echo Building application for production...
npm run build

echo.
echo Build completed successfully!
echo.
echo To start the production server, run:
echo   start-production-windows.bat
echo.
pause