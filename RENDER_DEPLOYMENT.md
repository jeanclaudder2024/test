# Deploy Oil Vessel Tracker to Render

## Step 1: Prepare Your Code for Render

### Create GitHub Repository
1. Go to GitHub.com and create a new repository
2. Upload these files to your repository:
   - All project files (package.json, server/, client/, shared/, etc.)
   - The render.yaml file I created
   - Your .env file (rename to .env.example and remove actual secrets)

### Required Files for Render:
- `package.json` with build and start scripts
- `render.yaml` for configuration
- Your Supabase database already set up

## Step 2: Deploy on Render

### 2.1 Sign Up and Connect GitHub
1. Go to render.com
2. Sign up with your GitHub account
3. Connect your repository

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: oil-vessel-tracker
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier (sufficient for testing)

### 2.3 Set Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=10000
```

## Step 3: Database Configuration

Since you're already using Supabase:
- Your existing Supabase database will work perfectly
- No additional database setup needed on Render
- Just provide the connection string in environment variables

## Step 4: Build Process

Render will automatically:
1. Install dependencies with `npm install`
2. Build the frontend with `vite build`
3. Build the backend with `esbuild`
4. Start the server with `node dist/index.js`

## Step 5: Access Your App

After deployment:
- Your app will be available at: `https://oil-vessel-tracker.onrender.com`
- SSL certificate automatically provided
- Custom domain can be added later

## Features That Will Work:
- All 5 authentic vessels from your Supabase database
- 68 ports and refineries
- Real-time vessel tracking
- Interactive maps
- WebSocket connections
- Port name resolution

## Troubleshooting:
- If build fails, check the logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify Supabase connection string is correct
- Check that port 10000 is used (Render's default)

## Cost:
- Free tier: 750 hours/month (sufficient for personal use)
- App will sleep after 15 minutes of inactivity
- Paid plans available for always-on services

Your app is ready for Render deployment with authentic vessel data!