# Supabase Database Setup Guide

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: maritime-platform
   - Database Password: (choose a strong password)
   - Region: (select closest to your server location)

## Step 2: Get Your Connection Details
After project creation, go to Settings → Database:

1. **DATABASE_URL**: Copy the "Connection string" under "Connection parameters"
   - It looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

2. **SUPABASE_URL**: Copy from Settings → API → Project URL
   - It looks like: `https://[project-ref].supabase.co`

3. **SUPABASE_ANON_KEY**: Copy from Settings → API → Project API keys → anon public
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **SUPABASE_SERVICE_ROLE_KEY**: Copy from Settings → API → Project API keys → service_role secret
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment Variables
Edit your `.env` file with the actual values:

```env
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Database Schema Setup
Your application will automatically create the necessary tables when you run:
```bash
npm run db:push
```

This will create all the required tables for:
- Vessels
- Ports
- Refineries
- Brokers
- Users
- Subscriptions
- And other maritime data

## Important Notes
- Supabase automatically handles backups
- You get 500MB storage on the free tier
- Database connection pooling is included
- Real-time subscriptions are available
- Row Level Security (RLS) can be enabled for additional security

## Troubleshooting
If you get connection errors:
1. Check that your DATABASE_URL is correct
2. Ensure your Supabase project is active
3. Verify your password in the connection string
4. Make sure you're using the pooler URL (port 6543) not direct connection (port 5432)