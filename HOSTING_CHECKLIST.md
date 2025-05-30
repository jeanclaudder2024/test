# Oil Vessel Tracking App - Hostinger Hosting Checklist

## Current Build Status
✅ Frontend built in `dist/client/` 
✅ Backend built as `dist/index.js`
✅ All SVG icons and assets included
✅ Database configured for Supabase only

## Essential Files for Hosting

### 1. Built Application Files (Required)
```
dist/
├── client/                    # Frontend static files
│   ├── index.html            # Main HTML file
│   ├── assets/               # CSS, JS, and image assets
│   │   ├── index-*.css       # Compiled CSS
│   │   ├── index-*.js        # Compiled JavaScript
│   │   └── *.svg/*.png       # All icons and images
│   └── petrodeal-logo.png    # Logo file
└── index.js                  # Backend server (714KB)
```

### 2. Configuration Files (Required)
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (DATABASE_URL, SUPABASE_*)
- `node_modules/` - All dependencies (install with npm install)

### 3. Database Requirements
✅ **Supabase Database Tables:**
- `vessels` - Ship data (5 authentic vessels)
- `ports` - Port information (68 ports) 
- `refineries` - Refinery locations
- All tables properly connected and functional

### 4. Environment Variables Needed
```
DATABASE_URL=postgresql://[supabase-connection-string]
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
NODE_ENV=production
```

### 5. Server Requirements
- **Node.js** version 18 or higher
- **NPM** for package management
- **Port 5000** (configurable)
- **PostgreSQL** connection to Supabase

## Deployment Steps for Hostinger

### Step 1: Upload Files
Upload these essential directories to your hosting:
- `dist/` (complete folder)
- `package.json`
- `package-lock.json`
- `.env` (with your database credentials)

### Step 2: Install Dependencies
```bash
npm install --production
```

### Step 3: Set Environment Variables
Configure in Hostinger control panel or .env file:
- DATABASE_URL (your Supabase connection string)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- NODE_ENV=production

### Step 4: Start Application
```bash
npm start
```
This runs: `node dist/index.js`

## Features Confirmed Working
✅ Vessel tracking with authentic data (5 vessels)
✅ Port and refinery display (68 ports)
✅ Real-time WebSocket connections
✅ Interactive maps with proper icons
✅ Vessel detail pages with port name resolution
✅ Database queries returning authentic data
✅ No synthetic/mock data generation

## Files NOT Needed for Hosting
❌ `client/src/` - Source files (already compiled)
❌ `server/` - Source files (already compiled)
❌ `shared/` - Source files (already compiled)
❌ `node_modules/@replit/` - Replit-specific plugins
❌ Development configuration files
❌ Any MySQL references (removed)

## Missing Files Check
⚠️ **Critical**: Ensure these exist in your upload:
1. `dist/index.js` (backend server - 714KB)
2. `dist/client/index.html` (frontend entry)
3. `dist/client/assets/` (all CSS/JS/images)
4. `package.json` (dependencies)
5. `.env` (your database credentials)

## Application Architecture
- **Frontend**: React app served from `dist/client/`
- **Backend**: Express server at `dist/index.js`
- **Database**: Supabase PostgreSQL (no local database)
- **Real-time**: WebSocket connections for live vessel tracking
- **Maps**: Leaflet with authentic vessel/port data

## Port Configuration
Default: Port 5000
Configurable via environment variable: `PORT=3000`

The application is ready for hosting with all essential files in the `dist/` folder and authentic vessel data from your Supabase database.