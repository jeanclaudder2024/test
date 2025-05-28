@echo off
title Oil Vessel Tracking - Simple Direct MySQL Connection
echo ================================================================
echo Oil Vessel Tracking Application - Direct MySQL Connection
echo Maritime Oil Brokerage Platform
echo ================================================================
echo.
echo This version connects directly to your MySQL database with:
echo - 2,500+ authentic oil vessels
echo - 111 global refineries  
echo - 29 authentic oil terminals
echo - 172 vessel documents
echo - 40 oil shipping companies
echo.
echo No complex database layers - just simple, reliable MySQL connection!
echo ================================================================
echo.

echo Installing dependencies...
npm install

echo.
echo Starting simple server with direct MySQL connection...
echo.
echo Your application will be available at:
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
echo Testing database connection to your authentic maritime data...
echo.

node server/simple-server.js

pause