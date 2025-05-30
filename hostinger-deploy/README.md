# Maritime Oil Brokerage Platform - Hostinger Deployment Guide

## Prerequisites
- Hostinger VPS plan (Business VPS or higher recommended)
- SSH access to your VPS
- Domain name pointed to your VPS IP

## Deployment Steps

### 1. Upload Files
Upload all files from this package to your VPS using File Manager or SCP.

### 2. Connect to VPS via SSH
```bash
ssh root@your-server-ip
```

### 3. Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Web Server)
apt install nginx -y
```

### 4. Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE maritime_platform;
CREATE USER maritime_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE maritime_platform TO maritime_user;
\q
```

### 5. Configure Environment
1. Edit the `.env` file with your actual values
2. Update database connection details
3. Add your API keys for external services

### 6. Install Project Dependencies
```bash
cd /path/to/your/project
npm install
```

### 7. Build the Application
```bash
npm run build
```

### 8. Setup Database Schema
```bash
npm run db:push
```

### 9. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10. Configure Nginx
Replace `/etc/nginx/sites-available/default` with the provided nginx config.
```bash
nginx -t
systemctl reload nginx
```

### 11. Setup SSL (Optional but Recommended)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

## Important Notes
- Make sure to update all API keys in `.env`
- The application runs on port 3000 internally
- Nginx proxies external traffic to your app
- Database backups are recommended
- Monitor logs with: `pm2 logs`

## Troubleshooting
- Check logs: `pm2 logs`
- Restart app: `pm2 restart all`
- Check nginx: `nginx -t`
- Database issues: Check PostgreSQL status with `systemctl status postgresql`