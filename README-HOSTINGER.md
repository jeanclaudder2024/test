# Oil Vessel Tracking Platform - Hostinger Deployment Guide

## Quick Setup for Hostinger

Your project has been cleaned up and optimized for Hostinger hosting. All unnecessary files have been removed, and the system now uses only Supabase database.

### What Was Cleaned Up

✅ Removed unnecessary deployment files  
✅ Removed MySQL database connections  
✅ Removed complex admin pages  
✅ Removed Replit-specific configurations  
✅ Simplified to Supabase-only database  
✅ Removed unused AI optimization features  
✅ Cleaned up routing and page structure  

### Files You Need for Hostinger

1. **All project files** (upload everything to your hosting)
2. **Environment variables** (create .env file)
3. **Supabase database** (setup required)

### Deployment Steps

1. **Setup Supabase Database**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Get your PostgreSQL connection string

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual Supabase credentials
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Build the Application**
   ```bash
   npm run build
   ```

5. **Upload to Hostinger**
   - Upload all files to your hosting directory
   - Set up Node.js application in Hostinger control panel
   - Point startup file to: `dist/index.js`
   - Set environment variables in Hostinger panel

6. **Database Migration**
   ```bash
   npm run db:push
   ```

### Environment Variables for Hostinger

Set these in your Hostinger control panel:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000
```

### Simple Core Features

Your cleaned up platform includes:
- Vessel tracking and management
- Port and refinery data
- Document management
- Company and broker information
- Interactive map visualization
- Simple admin panel

All complex features and unnecessary dependencies have been removed for easier hosting.