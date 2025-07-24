#!/bin/bash

# Quick deployment script for PetroDealHub
# Usage: ./quick-deploy.sh [domain]

set -e

echo "🚀 PetroDealHub Quick Deployment Script"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get domain from argument or prompt
DOMAIN=${1:-""}
if [ -z "$DOMAIN" ]; then
    read -p "Enter your domain name (e.g., petrodealhub.com): " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required${NC}"
    exit 1
fi

echo -e "${GREEN}[1/8]${NC} Installing Node.js and dependencies..."
# Install Node.js 20.x if not already installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

echo -e "${GREEN}[2/8]${NC} Installing project dependencies..."
npm install

echo -e "${GREEN}[3/8]${NC} Building the application..."
npm run build

echo -e "${GREEN}[4/8]${NC} Testing database connection..."
if ! npm run test:db; then
    echo -e "${YELLOW}Database test failed. Make sure your .env file is configured.${NC}"
    echo "Required variables: DATABASE_URL, SESSION_SECRET"
    read -p "Press Enter after fixing your .env file, or Ctrl+C to abort..."
fi

echo -e "${GREEN}[5/8]${NC} Starting application with PM2..."
pm2 delete petrodealhub 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo -e "${GREEN}[6/8]${NC} Configuring Nginx..."
sudo cp nginx.conf /tmp/petrodealhub_nginx
sudo sed -i "s/your-domain.com/$DOMAIN/g" /tmp/petrodealhub_nginx
sudo mv /tmp/petrodealhub_nginx /etc/nginx/sites-available/petrodealhub
sudo ln -sf /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/

if sudo nginx -t; then
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx configured successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration failed${NC}"
    exit 1
fi

echo -e "${GREEN}[7/8]${NC} Setting up firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
fi

echo -e "${GREEN}[8/8]${NC} Installing SSL certificate..."
read -p "Install SSL certificate with Let's Encrypt? (y/n): " INSTALL_SSL
if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    else
        echo -e "${YELLOW}Certbot not installed. Install it with: sudo apt install certbot python3-certbot-nginx${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Your PetroDealHub application is now running at:"
echo "  🌐 HTTP:  http://$DOMAIN"
echo "  🔒 HTTPS: https://$DOMAIN"
echo ""
echo "Management commands:"
echo "  📊 Check status: pm2 status"
echo "  📝 View logs:    pm2 logs petrodealhub"
echo "  🔄 Restart:      pm2 restart petrodealhub"
echo "  💻 Monitor:      pm2 monit"
echo ""
echo "Health check:"
echo "  🏥 Test endpoint: curl http://$DOMAIN/api/health"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your .env file with production API keys"
echo "2. Set up monitoring and alerts"
echo "3. Configure backups"
echo "4. Test all features thoroughly"