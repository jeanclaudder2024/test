@echo off
title Oil Vessel Tracking - Pure MySQL Implementation
echo ================================================================
echo Oil Vessel Tracking Application - MySQL Only Version
echo Maritime Oil Brokerage Platform
echo ================================================================
echo.
echo PURE MYSQL IMPLEMENTATION - No PostgreSQL Dependencies!
echo.
echo Your authentic maritime data from MySQL:
echo - 2,500+ authentic oil vessels (VLCC, Suezmax, Aframax, LNG)
echo - 111 global refineries with operational details
echo - 29 authentic oil terminals and ports
echo - 172 vessel documents (SDS, LOI, BL certificates)
echo - 40 oil shipping companies with fleet information
echo.
echo Database: sql301.infinityfree.com
echo All PostgreSQL connections removed!
echo ================================================================
echo.

echo Installing required dependencies...
npm install

echo.
echo Starting MySQL-only server...
echo.
echo Your oil vessel tracking platform will be available at:
echo Application: http://localhost:3000
echo.
echo Direct connection to your authentic MySQL data!
echo Press Ctrl+C to stop the server
echo.

node server/mysql-only-server.js

pause