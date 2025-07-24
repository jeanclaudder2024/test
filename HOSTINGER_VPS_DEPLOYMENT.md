# PetroDealHub - Hostinger VPS Ubuntu Deployment Guide

## Complete Step-by-Step Deployment for Hostinger VPS

### Prerequisites
- Hostinger VPS with Ubuntu 20.04/22.04
- Domain name (can be purchased through Hostinger)
- Root access to your VPS
- Your PetroDealHub project files

### Step 1: Access Your Hostinger VPS

```bash
# Connect to your VPS via SSH
ssh root@your-server-ip

# Or if you have a non-root user:
ssh username@your-server-ip
```

### Step 2: System Preparation

```bash
# Update the system
apt update && apt upgrade -y

# Install essential packages
apt install curl wget git nano htop unzip -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 for process management
npm install -g pm2

# Install Nginx web server
apt install nginx -y

# Install PostgreSQL database
apt install postgresql postgresql-contrib -y

# Install SSL certificate tools
apt install certbot python3-certbot-nginx -y
```

### Step 3: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run these commands in PostgreSQL)
CREATE DATABASE petrodealhub;
CREATE USER petrodealhub_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE petrodealhub TO petrodealhub_user;
\q

# Test database connection
psql postgresql://petrodealhub_user:your_secure_password_here@localhost:5432/petrodealhub
\q
```

### Step 4: Upload Your Project Files

**Option A: Using Git (Recommended)**
```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/petrodealhub.git
cd petrodealhub
```

**Option B: Upload via SCP/FTP**
```bash
# Create project directory
mkdir -p /var/www/petrodealhub
cd /var/www/petrodealhub

# Upload your files using Hostinger File Manager or SCP
# scp -r ./petrodealhub/* root@your-server-ip:/var/www/petrodealhub/
```

### Step 5: Configure Environment Variables

```bash
# Navigate to project directory
cd /var/www/petrodealhub

# Create .env file
nano .env
```

Add these environment variables:
```env
# Database Connection
DATABASE_URL=postgresql://petrodealhub_user:your_secure_password_here@localhost:5432/petrodealhub

# Security
SESSION_SECRET=your_very_secure_session_secret_minimum_32_characters

# Stripe Payment Processing (use your live keys for production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

# Production Settings
NODE_ENV=production
PORT=5000

# Optional: AI Features
OPENAI_API_KEY=your_openai_api_key_if_you_have_one

# Hostinger Specific
DOMAIN=yourdomain.com
```

### Step 6: Install Dependencies and Build

```bash
# Install project dependencies
npm install

# Build the application
npm run build

# Test database connection
node test-db.js
```

### Step 7: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/petrodealhub
```

Add this configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Static files (if you have any)
    location /static/ {
        alias /var/www/petrodealhub/dist/client/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/

# Remove default Nginx site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

### Step 8: Start the Application with PM2

```bash
# Navigate to project directory
cd /var/www/petrodealhub

# Start the application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown by the command above
```

### Step 9: Configure Firewall

```bash
# Install and configure UFW firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Check firewall status
ufw status
```

### Step 10: Setup SSL Certificate

```bash
# Install SSL certificate for your domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
certbot renew --dry-run
```

### Step 11: Verify Deployment

```bash
# Check application status
pm2 status

# Check application logs
pm2 logs petrodealhub

# Test health endpoint
curl http://localhost:5000/api/health

# Test your domain
curl https://yourdomain.com/api/health
```

## Hostinger-Specific Configuration

### Domain Configuration
1. Log into your Hostinger control panel
2. Go to DNS settings for your domain
3. Add/update these DNS records:
   ```
   Type: A
   Name: @
   Value: your-vps-ip-address
   
   Type: A  
   Name: www
   Value: your-vps-ip-address
   ```

### Hostinger VPS Management
- Access VPS management through Hostinger control panel
- Monitor resources (CPU, RAM, storage)
- Set up automated backups through Hostinger

## Post-Deployment Tasks

### 1. Setup Automated Backups
```bash
# Create backup script
nano /usr/local/bin/backup-petrodealhub.sh
```

Add this backup script:
```bash
#!/bin/bash
BACKUP_DIR="/backups/petrodealhub"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/petrodealhub

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable
chmod +x /usr/local/bin/backup-petrodealhub.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add this line:
# 0 2 * * * /usr/local/bin/backup-petrodealhub.sh
```

### 2. Monitor Application
```bash
# View real-time logs
pm2 logs petrodealhub --lines 100

# Monitor system resources
pm2 monit

# Check system status
htop
```

### 3. Update Application
```bash
cd /var/www/petrodealhub
git pull
npm install
npm run build
pm2 restart petrodealhub
```

## Troubleshooting Common Issues

### Application Won't Start
```bash
# Check logs
pm2 logs petrodealhub

# Check if port is available
netstat -tulpn | grep :5000

# Restart application
pm2 restart petrodealhub
```

### Database Connection Issues
```bash
# Test database connection
node test-db.js

# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql
```

### Domain Not Working
1. Check DNS propagation: https://dnschecker.org/
2. Verify Nginx configuration: `nginx -t`
3. Check SSL certificate: `certbot certificates`

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew

# Check Nginx SSL configuration
nginx -t
```

## Performance Optimization

### 1. Enable PM2 Cluster Mode
Your `ecosystem.config.js` already uses cluster mode with all CPU cores.

### 2. Database Optimization
```bash
# Connect to PostgreSQL
sudo -u postgres psql petrodealhub

# Run maintenance commands
VACUUM ANALYZE;
REINDEX DATABASE petrodealhub;
```

### 3. Monitor Performance
```bash
# Monitor with PM2
pm2 monit

# System monitoring
htop
iotop
```

## Security Best Practices

1. **Regular Updates**
   ```bash
   apt update && apt upgrade -y
   npm audit fix
   ```

2. **Strong Passwords**
   - Use strong database passwords
   - Secure SSH with key-based authentication
   - Keep API keys secure

3. **Backup Strategy**
   - Daily automated backups
   - Store backups in multiple locations
   - Test backup restoration regularly

## Success Checklist

- ✅ VPS accessible via SSH
- ✅ Node.js and dependencies installed
- ✅ Database created and accessible
- ✅ Application built successfully
- ✅ PM2 running the application
- ✅ Nginx configured and running
- ✅ Domain pointing to VPS
- ✅ SSL certificate installed
- ✅ Health endpoint responding
- ✅ Stripe payments working
- ✅ Backups configured

Your PetroDealHub platform is now live on Hostinger VPS and ready to generate revenue!

## Support

If you encounter issues:
1. Check application logs: `pm2 logs petrodealhub`
2. Test health endpoint: `curl https://yourdomain.com/api/health`
3. Verify all services are running: `pm2 status`
4. Contact Hostinger support for VPS-specific issues