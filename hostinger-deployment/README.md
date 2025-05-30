# Hostinger Deployment Guide

## Files to Upload to Hostinger

This folder contains everything you need to deploy your maritime oil brokerage platform on Hostinger.

## Required Setup Steps

### 1. Upload Files
Upload these files to your Hostinger hosting directory:
- All server files
- package.json
- Built frontend files (after running build)

### 2. Environment Configuration
Create a `.env` file in your hosting root with:
```
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
PORT=5000
```

### 3. Database Requirements
Your application requires:
- PostgreSQL database (provided by Supabase)
- All tables created and migrated
- Authentic vessel, port, and refinery data loaded

### 4. Build Process
Before uploading, complete the production build:
```bash
npm run build
```

This creates optimized files for hosting.

## Important Notes
- Ensure Hostinger supports Node.js applications
- Your app serves both frontend and API from the same server
- Database connections use Supabase PostgreSQL
- All data sources are authentic maritime industry data