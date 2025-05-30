# Hostinger Deployment Guide for Oil Vessel Tracking Platform

## Prerequisites
- Hostinger VPS or Business hosting account
- Node.js 18+ support
- PostgreSQL database
- Domain name configured

## Step 1: Prepare Files for Upload
1. Run build command: `npm run build`
2. Upload these files/folders to your Hostinger hosting:
   - `dist/` (built server)
   - `client/dist/` (built frontend)
   - `package.json`
   - `ecosystem.config.js`
   - `node_modules/` or run `npm install` on server

## Step 2: Database Setup
1. Create PostgreSQL database on Hostinger
2. Update environment variables with your database credentials:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   PORT=3000
   ```

## Step 3: Environment Variables
Create `.env` file on your server with:
```
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=production
PORT=3000
```

## Step 4: Start Application
1. Install PM2: `npm install -g pm2`
2. Start app: `pm2 start ecosystem.config.js`
3. Save PM2 config: `pm2 save`
4. Setup auto-restart: `pm2 startup`

## Step 5: Configure Web Server
Configure your web server (Apache/Nginx) to:
- Serve static files from `client/dist/`
- Proxy API requests to `http://localhost:3000`

## Nginx Configuration Example:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/your/client/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```