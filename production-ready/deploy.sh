#!/bin/bash

# Maritime Platform Deployment Script for Hostinger VPS
set -e

echo "🚀 Starting Maritime Platform deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
apt install nginx -y

# Create application directory
APP_DIR="/var/www/maritime-platform"
print_status "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR/logs

# Copy files to application directory
print_status "Setting up application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Set up environment file
if [ ! -f .env ]; then
    print_warning "Please edit .env file with your actual Supabase credentials!"
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build application
print_status "Building application..."
npm run build

# Set up database schema
print_status "Setting up database schema with Supabase..."
npm run db:push

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Enable services
systemctl enable nginx

print_status "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Supabase credentials"
echo "2. Configure nginx with your domain"
echo "3. Set up SSL certificate"
echo ""
echo "Monitor your application:"
echo "- View logs: pm2 logs"
echo "- Check status: pm2 status"
echo "- Restart app: pm2 restart maritime-platform"