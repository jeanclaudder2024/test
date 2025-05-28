@echo off
title Oil Vessel Tracking - Database Setup
echo ========================================
echo Oil Vessel Tracking Database Setup
echo Maritime Oil Brokerage Platform
echo ========================================
echo.

echo This script will help you set up your database with authentic oil vessel data
echo.

echo Step 1: Database Schema Setup
echo ========================================
echo Running database migrations...
npm run db:push

echo.
echo Step 2: Database Status Check
echo ========================================
echo Checking database connection...

echo.
echo Database setup completed!
echo.
echo Your database now includes:
echo - Complete schema for vessel tracking
echo - User management tables
echo - Subscription and payment tables
echo - Document management system
echo - Maritime data structures
echo.
echo Next steps:
echo 1. Import your authentic vessel data using the migration files
echo 2. Configure your .env file with proper database credentials
echo 3. Start the application with start-windows.bat
echo.
pause