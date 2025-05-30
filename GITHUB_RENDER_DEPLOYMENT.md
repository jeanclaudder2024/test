# Deploy Oil Vessel Tracker: GitHub → Render

## Step 1: Push to GitHub

### If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "Oil vessel tracking app ready for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### If you already have the repo:
```bash
git add .
git commit -m "Ready for Render deployment"
git push
```

## Step 2: Deploy on Render

### 2.1 Sign Up & Connect
1. Go to **render.com**
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Configure deployment settings:
   - **Name**: `oil-vessel-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (perfect for testing)

### 2.3 Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Deploy & Access

1. Click **"Create Web Service"**
2. Render builds and deploys automatically (5-10 minutes)
3. Your app will be live at: `https://oil-vessel-tracker.onrender.com`

## What Will Work:
- All 5 authentic vessels from your Supabase database
- 68 ports with correct names and coordinates
- Real-time vessel tracking with WebSocket connections
- Interactive maps with vessel and port icons
- All existing functionality preserved

## Auto-Deploy:
Every time you push to GitHub, Render will automatically redeploy your app.

Your app is ready - just push to GitHub and deploy on Render!