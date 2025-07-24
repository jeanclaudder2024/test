# PetroDealHub - Ubuntu VPS Deployment Guide

## Prerequisites

### 1. Ubuntu Server Requirements
- Ubuntu 20.04 LTS or 22.04 LTS
- Minimum 2GB RAM (4GB recommended)
- 20GB+ storage space
- Root or sudo access

### 2. Domain Setup
- Point your domain DNS to your VPS IP address
- Example: petrodealhub.com → YOUR_VPS_IP

## Step 1: Server Preparation

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Software
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Git
sudo apt install git -y

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Database Setup

### Create PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE petrodealhub;
CREATE USER petrodealhub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE petrodealhub TO petrodealhub_user;
\q
```

## Step 3: Project Deployment

### Clone and Setup Project
```bash
# Navigate to web directory
cd /var/www

# Clone your project
sudo git clone https://github.com/yourusername/petrodealhub.git
sudo chown -R $USER:$USER /var/www/petrodealhub
cd petrodealhub

# Install dependencies
npm install

# Build the project
npm run build
```

### Environment Configuration
```bash
# Create production environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```
# Database
DATABASE_URL=postgresql://petrodealhub_user:your_secure_password@localhost:5432/petrodealhub

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# Session Secret
SESSION_SECRET=your_very_secure_session_secret

# Production Settings
NODE_ENV=production
PORT=5000
```

## Step 4: Database Migration

### Run Database Initialization
```bash
# Initialize database tables
npm run db:push

# Or manually run the initialization
node -e "
const { initializeDatabase } = require('./server/database-init.js');
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
  process.exit(0);
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
"
```

## Step 5: PM2 Process Management

### Create PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'petrodealhub',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## Step 6: Nginx Configuration

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/petrodealhub
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
    }

    # Static files
    location /assets {
        alias /var/www/petrodealhub/dist/client/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 7: SSL Certificate

### Install SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Firewall Configuration

### Setup UFW Firewall
```bash
# Enable firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000

# Check status
sudo ufw status
```

## Step 9: Monitoring and Maintenance

### PM2 Monitoring
```bash
# Check application status
pm2 status

# View logs
pm2 logs petrodealhub

# Monitor resources
pm2 monit

# Restart application
pm2 restart petrodealhub

# Update application
cd /var/www/petrodealhub
git pull
npm install
npm run build
pm2 restart petrodealhub
```

### System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check PostgreSQL status
sudo systemctl status postgresql
```

## Step 10: Backup Strategy

### Database Backup
```bash
# Create backup script
sudo nano /usr/local/bin/backup-petrodealhub.sh
```

Backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/petrodealhub"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U petrodealhub_user -d petrodealhub > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www petrodealhub

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Setup Automated Backups
```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-petrodealhub.sh

# Add to crontab (daily backup at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-petrodealhub.sh
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs petrodealhub
   
   # Check if port is available
   sudo netstat -tulpn | grep :5000
   ```

2. **Database connection errors**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test database connection
   psql -h localhost -U petrodealhub_user -d petrodealhub
   ```

3. **Nginx errors**
   ```bash
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   
   # Test configuration
   sudo nginx -t
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

## Security Best Practices

1. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

2. **Strong Passwords**
   - Use strong database passwords
   - Secure session secrets
   - Secure API keys

3. **Backup Verification**
   - Regularly test backups
   - Store offsite backups

4. **Monitor Logs**
   - Check application logs regularly
   - Monitor system logs
   - Set up log rotation

## Performance Optimization

1. **PM2 Cluster Mode**
   - Use all CPU cores
   - Automatic load balancing

2. **Nginx Caching**
   - Cache static assets
   - Enable gzip compression

3. **Database Optimization**
   - Regular VACUUM operations
   - Index optimization

Your PetroDealHub application should now be running successfully on your Ubuntu VPS!