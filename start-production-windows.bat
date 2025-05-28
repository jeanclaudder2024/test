@echo off
title Oil Vessel Tracking - Production Server
echo ========================================
echo Oil Vessel Tracking Application
echo Production Server (Windows)
echo ========================================
echo.

echo Checking if build exists...
if not exist "dist" (
    echo ERROR: No production build found
    echo Please run build-windows.bat first
    pause
    exit /b 1
)

echo.
echo Starting production server...
echo Your oil vessel tracking platform will be available at:
echo Application: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

set NODE_ENV=production
npm start

pause