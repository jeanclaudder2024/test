# Deploy Your Maritime Platform to Vercel

## Quick Steps for Client Testing

### 1. Upload to Your GitHub Repository
- Copy all files from this folder to your GitHub repository
- Commit and push the changes

### 2. Connect to Vercel (Free)
1. Go to **vercel.com** and sign up with your GitHub account
2. Click **"New Project"**
3. Select your GitHub repository
4. Click **"Import"**

### 3. Configure Environment Variables
In Vercel dashboard, add these environment variables:

**Required:**
```
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url  
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
SESSION_SECRET=any_random_string_here
```

**Optional (for full features):**
```
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for build to complete
- Get your live URL: `your-app-name.vercel.app`

### 5. Set Up Database
1. Create a Supabase account at **supabase.com**
2. Create a new project
3. Copy the database URL and API keys
4. Add them to Vercel environment variables
5. Redeploy your app

## Your App Will Have:
- Live vessel tracking maps
- Real-time port data
- Full maritime features
- Professional URL for client demos
- Automatic updates when you push code

## Troubleshooting
- If build fails: Check that all environment variables are set
- If database errors: Verify Supabase credentials
- If app is slow: This is normal for free tier, upgrades available

**Need help?** Contact me with any deployment issues.