#!/bin/bash

# PetroDealHub Deployment Script for Ubuntu VPS
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting PetroDealHub deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    print_error "This script is designed for Ubuntu. Please check the manual deployment guide."
    exit 1
fi

print_status "Checking system requirements..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Please install Node.js 20.x first."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed."; exit 1; }
command -v nginx >/dev/null 2>&1 || { print_error "Nginx is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { print_error "PostgreSQL client is required but not installed."; exit 1; }

print_status "Installing dependencies..."
npm install

print_status "Building the application..."
npm run build

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your production settings before continuing!"
        read -p "Press Enter after you've updated the .env file..."
    else
        print_error ".env.example file not found. Please create .env manually."
        exit 1
    fi
fi

print_status "Checking environment variables..."
source .env

# Check required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env file"
        exit 1
    fi
done

print_status "Testing database connection..."
if ! npm run test:db 2>/dev/null; then
    print_warning "Database connection test failed. Attempting to initialize database..."
    npm run db:push || {
        print_error "Database initialization failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
        exit 1
    }
fi

print_status "Installing PM2 globally (requires sudo)..."
sudo npm install -g pm2

print_status "Setting up PM2 application..."
pm2 delete petrodealhub 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js --env production

print_status "Saving PM2 configuration..."
pm2 save

print_status "Setting up PM2 startup script..."
sudo env PATH=$PATH:/usr/bin $(which pm2) startup systemd -u $USER --hp $HOME

print_status "Creating log directory..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

print_status "Configuring Nginx..."
read -p "Enter your domain name (e.g., petrodealhub.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Create Nginx configuration
sudo sed "s/your-domain.com/$DOMAIN_NAME/g" nginx.conf > /tmp/petrodealhub_nginx
sudo mv /tmp/petrodealhub_nginx /etc/nginx/sites-available/petrodealhub

# Enable site
sudo ln -sf /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Restarting Nginx..."
    sudo systemctl restart nginx
else
    print_error "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

print_status "Setting up SSL certificate..."
read -p "Do you want to install SSL certificate with Let's Encrypt? (y/n): " INSTALL_SSL

if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
    if command -v certbot >/dev/null 2>&1; then
        sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME
    else
        print_warning "Certbot not installed. Please install it manually and run: sudo certbot --nginx -d $DOMAIN_NAME"
    fi
fi

print_status "Setting up firewall..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
else
    print_warning "UFW firewall not available. Please configure firewall manually."
fi

print_status "Creating backup script..."
sudo tee /usr/local/bin/backup-petrodealhub.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/petrodealhub"
mkdir -p \$BACKUP_DIR

# Database backup
pg_dump \$DATABASE_URL > \$BACKUP_DIR/db_backup_\$DATE.sql

# Application backup
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz -C /var/www petrodealhub

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-petrodealhub.sh

print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-petrodealhub.sh") | crontab -

print_status "Deployment completed successfully! 🎉"
echo ""
echo "Your PetroDealHub application is now running on:"
echo "  HTTP:  http://$DOMAIN_NAME"
echo "  HTTPS: https://$DOMAIN_NAME (if SSL was configured)"
echo ""
echo "Application management commands:"
echo "  Check status:  pm2 status"
echo "  View logs:     pm2 logs petrodealhub"
echo "  Restart app:   pm2 restart petrodealhub"
echo "  Monitor:       pm2 monit"
echo ""
echo "System status:"
echo "  Nginx status:  sudo systemctl status nginx"
echo "  DB status:     sudo systemctl status postgresql"
echo ""
echo "Backup information:"
echo "  Backups are stored in: /backups/petrodealhub"
echo "  Daily backups run at 2:00 AM"
echo ""
print_warning "Don't forget to:"
print_warning "1. Update your .env file with production values"
print_warning "2. Test the application thoroughly"
print_warning "3. Set up monitoring and alerts"
print_warning "4. Review and harden security settings"