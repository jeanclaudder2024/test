#!/bin/bash

# Maritime Platform Deployment Script for Hostinger VPS
# Run this script after uploading files to your VPS

set -e

echo "🚀 Starting Maritime Platform deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Skip PostgreSQL installation - using Supabase instead
print_status "Skipping PostgreSQL installation - using Supabase cloud database..."

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
apt install nginx -y

# Create application directory
APP_DIR="/var/www/maritime-platform"
print_status "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs

# Copy files to application directory
print_status "Setting up application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Set up environment file
if [ ! -f .env ]; then
    print_warning "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your actual credentials!"
    print_warning "Database setup is required before proceeding."
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build application
print_status "Building application..."
npm run build

# Set up PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE maritime_platform;" 2>/dev/null || print_warning "Database already exists"
sudo -u postgres psql -c "CREATE USER maritime_user WITH PASSWORD 'change_this_password';" 2>/dev/null || print_warning "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE maritime_platform TO maritime_user;" 2>/dev/null || print_status "Privileges granted"

# Set up database schema
print_status "Setting up database schema..."
npm run db:push

# Set up Nginx configuration
print_status "Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/maritime-platform
ln -sf /etc/nginx/sites-available/maritime-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    systemctl reload nginx
else
    print_error "Nginx configuration error"
    exit 1
fi

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Start application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Enable services
systemctl enable nginx
systemctl enable postgresql

print_status "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual API keys and database credentials"
echo "2. Update nginx.conf with your actual domain name"
echo "3. Set up SSL certificate with: certbot --nginx -d yourdomain.com"
echo "4. Restart services: pm2 restart all && systemctl reload nginx"
echo ""
echo "Monitor your application:"
echo "- View logs: pm2 logs"
echo "- Check status: pm2 status"
echo "- Restart app: pm2 restart maritime-platform"