# Maritime Platform - Production Deployment Guide

## Quick Start

1. **Extract files** to your Hostinger VPS
2. **Set up Supabase database** (see instructions below)
3. **Run deployment script**: `sudo bash deploy.sh`
4. **Configure your domain** in nginx
5. **Add SSL certificate**

## Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to https://supabase.com and create account
2. Create new project
3. Choose region closest to your server
4. Set a strong database password

### Step 2: Get Connection Details
From your Supabase dashboard:

**Settings → Database:**
- Copy "Connection string" for DATABASE_URL

**Settings → API:**
- Copy "Project URL" for SUPABASE_URL
- Copy "anon public" key for SUPABASE_ANON_KEY
- Copy "service_role secret" for SUPABASE_SERVICE_ROLE_KEY

### Step 3: Update Environment Variables
Edit the `.env` file with your actual Supabase credentials:

```env
DATABASE_URL=postgresql://postgres.[your-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[your-ref].supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key
OPENAI_API_KEY=your_openai_key
```

## Deployment Commands

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (as root)
sudo bash deploy.sh

# Check application status
pm2 status

# View logs
pm2 logs maritime-platform

# Restart if needed
pm2 restart maritime-platform
```

## Nginx Configuration

1. Update domain in nginx config file
2. Test configuration: `nginx -t`
3. Reload nginx: `systemctl reload nginx`

## SSL Certificate Setup

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

## Troubleshooting

**Database Connection Issues:**
- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure you're using the pooler connection string

**Application Won't Start:**
- Check logs: `pm2 logs`
- Verify all dependencies installed: `npm install`
- Ensure build completed: `npm run build`

**Nginx Issues:**
- Test config: `nginx -t`
- Check nginx logs: `tail -f /var/log/nginx/error.log`

## Production Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables updated with real values
- [ ] Application deployed and running
- [ ] Domain configured in nginx
- [ ] SSL certificate installed
- [ ] Database schema pushed successfully
- [ ] Application accessible via domain

Your maritime platform will be running at your domain with Supabase handling the database in the cloud.