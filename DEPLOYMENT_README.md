# PetroDealHub - Ubuntu VPS Deployment

## Quick Start

For fast deployment on a fresh Ubuntu server:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd petrodealhub

# 2. Run the quick deployment script
chmod +x quick-deploy.sh
./quick-deploy.sh your-domain.com
```

## Manual Step-by-Step Deployment

### Prerequisites
- Ubuntu 20.04 LTS or 22.04 LTS
- Domain pointing to your server IP
- Root or sudo access

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt install nginx postgresql postgresql-contrib git certbot python3-certbot-nginx -y

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Setup PostgreSQL
sudo -u postgres psql
```

In PostgreSQL:
```sql
CREATE DATABASE petrodealhub;
CREATE USER petrodealhub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE petrodealhub TO petrodealhub_user;
\q
```

### 3. Application Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
```

Required environment variables:
```env
DATABASE_URL=postgresql://petrodealhub_user:your_secure_password@localhost:5432/petrodealhub
SESSION_SECRET=your_very_secure_session_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
NODE_ENV=production
PORT=5000
```

```bash
# Build the application
npm run build

# Test database connection
node test-db.js

# Initialize database
npm run db:push
```

### 4. Process Management

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Web Server Setup

```bash
# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/petrodealhub
sudo sed -i 's/your-domain.com/yourdomain.com/g' /etc/nginx/sites-available/petrodealhub
sudo ln -s /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate

```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Firewall

```bash
# Setup firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## File Structure

```
petrodealhub/
├── UBUNTU_VPS_DEPLOYMENT.md    # Comprehensive deployment guide
├── DEPLOYMENT_README.md        # This quick reference
├── deploy.sh                   # Full automated deployment script
├── quick-deploy.sh            # Quick deployment script
├── start-production.sh        # Production startup script
├── ecosystem.config.js        # PM2 configuration
├── nginx.conf                 # Nginx configuration template
├── test-db.js                 # Database connectivity test
├── .env.example              # Environment variables template
└── dist/                     # Built application files
```

## Management Commands

### Application Management
```bash
# Check status
pm2 status

# View logs
pm2 logs petrodealhub

# Restart application
pm2 restart petrodealhub

# Monitor resources
pm2 monit

# Stop application
pm2 stop petrodealhub
```

### System Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check PostgreSQL status
sudo systemctl status postgresql

# View system resources
htop
```

### Health Checks
```bash
# Application health
curl http://localhost:5000/api/health

# Full health check with verbose output
curl -v http://yourdomain.com/api/health
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs petrodealhub

# Check if port is in use
sudo netstat -tulpn | grep :5000

# Restart from scratch
pm2 delete petrodealhub
pm2 start ecosystem.config.js --env production
```

### Database Connection Issues
```bash
# Test database connection
node test-db.js

# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database manually
psql $DATABASE_URL
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
```

## Updates and Maintenance

### Update Application
```bash
cd /var/www/petrodealhub
git pull
npm install
npm run build
pm2 restart petrodealhub
```

### Backup Database
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

### Log Rotation
```bash
# PM2 logs
pm2 install pm2-logrotate

# System logs are handled by logrotate automatically
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
   - Keep API keys secure

3. **Firewall Configuration**
   - Only allow necessary ports
   - Use fail2ban for SSH protection

4. **SSL/TLS**
   - Always use HTTPS in production
   - Set up automatic certificate renewal

## Performance Optimization

1. **PM2 Cluster Mode**
   - Uses all CPU cores
   - Automatic load balancing

2. **Nginx Optimization**
   - Gzip compression enabled
   - Static file caching
   - Proper headers

3. **Database Optimization**
   - Regular VACUUM operations
   - Index optimization
   - Connection pooling

## Support

If you encounter issues:

1. Check the logs: `pm2 logs petrodealhub`
2. Verify environment variables are set correctly
3. Test database connectivity: `node test-db.js`
4. Check health endpoint: `curl http://localhost:5000/api/health`

For additional help, refer to the comprehensive `UBUNTU_VPS_DEPLOYMENT.md` guide.