# Deploy to Render - Complete Guide

## Your oil vessel tracking platform is ready for deployment!

### Step 1: Prepare New GitHub Repository

1. **Create a new GitHub repository**
2. **Clone your new repository locally**
3. **Copy all project files to your new repository**
4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit - Oil vessel tracking platform"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login to Render.com**
2. **Connect GitHub account**
3. **Create new Web Service:**
   - Choose your repository
   - Render will auto-detect the configuration

### Step 3: Configure Environment Variables

In Render dashboard, add these environment variables:

**Required:**
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional (for enhanced features):**
```
OPENAI_API_KEY=your_openai_key
MYSHIPTRACKING_API_KEY=your_tracking_key
MARINE_TRAFFIC_API_KEY=your_marine_key
```

### Step 4: Database Setup

**Option A: Use Render PostgreSQL (Recommended)**
- Create PostgreSQL database in Render
- Copy connection string to DATABASE_URL

**Option B: Use existing Supabase**
- Use your Supabase connection string

### Files Ready for Deployment:

✅ `render.yaml` - Service configuration
✅ `Dockerfile` - Container setup
✅ `.dockerignore` - Build optimization
✅ `.gitignore` - Git exclusions
✅ `package.json` - Dependencies
✅ Production-ready code structure

### Build Configuration:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Node Version:** 18

### Post-Deployment:
- App automatically seeds initial data
- Real-time vessel tracking active
- Admin panel available at `/admin`
- Port name resolution working properly

Your platform is clean, optimized, and ready for production deployment!