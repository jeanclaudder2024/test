# Hostinger Deployment Package

## Overview
Your maritime oil brokerage platform is ready for deployment on Hostinger. Below are the steps and files needed for hosting.

## Required Files for Hostinger

### 1. Frontend Build (Client Files)
You need to build the React frontend first. Run this command:
```bash
npm run build
```

This will create a `dist` folder containing:
- `index.html` - Main HTML file
- `assets/` - CSS, JavaScript, and other static assets
- All compiled React components

### 2. Backend Server Files
Your Node.js backend needs these files:
- `server/` - Complete server directory
- `package.json` - Dependencies
- `node_modules/` - All installed packages
- `.env` - Environment variables

## Deployment Steps for Hostinger

### Step 1: Prepare Your Files
1. Complete the build process: `npm run build`
2. Upload the entire project folder to Hostinger
3. Set up environment variables

### Step 2: Required Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MYSHIPTRACKING_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
PORT=5000
```

### Step 3: Database Setup
Your app uses PostgreSQL with Supabase. Ensure:
- Supabase project is configured
- Database tables are created
- Connection string is correct

### Step 4: Hostinger Configuration
1. Upload all files to your hosting directory
2. Install Node.js dependencies: `npm install`
3. Start the application: `npm start`

## Important Files Structure
```
your-app/
├── dist/                 # Built frontend (after npm run build)
├── server/              # Backend server
├── package.json         # Dependencies
├── .env                 # Environment variables
└── node_modules/        # Installed packages
```

## Notes
- Your app runs on port 5000 by default
- Make sure Hostinger supports Node.js hosting
- The app serves both frontend and backend from the same server