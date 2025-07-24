#!/bin/bash

# Hostinger VPS Deployment Script for PetroDealHub
# Optimized for Hostinger VPS Ubuntu environment

set -e

echo "🚀 PetroDealHub Hostinger VPS Deployment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get domain from user
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required${NC}"
    exit 1
fi

echo -e "${BLUE}Deploying PetroDealHub to Hostinger VPS for domain: $DOMAIN${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}This script should be run as root. Switching to root...${NC}"
    sudo "$0" "$@"
    exit $?
fi

echo -e "${GREEN}[1/12]${NC} Updating system packages..."
apt update && apt upgrade -y

echo -e "${GREEN}[2/12]${NC} Installing essential packages..."
apt install curl wget git nano htop unzip software-properties-common -y

echo -e "${GREEN}[3/12]${NC} Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}[4/12]${NC} Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo -e "${GREEN}[5/12]${NC} Installing and configuring PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install postgresql postgresql-contrib -y
    systemctl start postgresql
    systemctl enable postgresql
fi

echo -e "${GREEN}[6/12]${NC} Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
fi

echo -e "${GREEN}[7/12]${NC} Installing SSL certificate tools..."
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
fi

echo -e "${GREEN}[8/12]${NC} Setting up PostgreSQL database..."
# Generate a secure password for database
DB_PASSWORD=$(openssl rand -base64 32)
echo "Database password: $DB_PASSWORD" > /root/petrodealhub_db_password.txt
chmod 600 /root/petrodealhub_db_password.txt

sudo -u postgres psql << EOF
CREATE DATABASE petrodealhub;
CREATE USER petrodealhub_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE petrodealhub TO petrodealhub_user;
\q
EOF

echo -e "${GREEN}[9/12]${NC} Creating project directory..."
mkdir -p /var/www/petrodealhub
cd /var/www/petrodealhub

echo -e "${GREEN}[10/12]${NC} Creating environment configuration..."
cat > .env << EOF
# Database Connection
DATABASE_URL=postgresql://petrodealhub_user:$DB_PASSWORD@localhost:5432/petrodealhub

# Security
SESSION_SECRET=$(openssl rand -base64 32)

# Production Settings
NODE_ENV=production
PORT=5000
DOMAIN=$DOMAIN

# Stripe Payment Processing
# IMPORTANT: Add your Stripe keys after deployment
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key_here

# Optional: AI Features
# OPENAI_API_KEY=your_openai_api_key_here
EOF

echo -e "${GREEN}[11/12]${NC} Configuring Nginx..."
cat > /etc/nginx/sites-available/petrodealhub << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; frame-src 'self' https://js.stripe.com; connect-src 'self' https://api.stripe.com" always;

    # Main application proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:5000/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security
    server_tokens off;
}
EOF

# Enable site and remove default
ln -sf /etc/nginx/sites-available/petrodealhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
if nginx -t; then
    systemctl restart nginx
    echo -e "${GREEN}✅ Nginx configured successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration failed${NC}"
    exit 1
fi

echo -e "${GREEN}[12/12]${NC} Setting up firewall..."
if command -v ufw &> /dev/null; then
    ufw --force reset
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Hostinger VPS setup completed!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Upload your PetroDealHub project files to: /var/www/petrodealhub"
echo "2. Update your Stripe API keys in: /var/www/petrodealhub/.env"
echo "3. Run the project setup commands:"
echo ""
echo -e "${BLUE}cd /var/www/petrodealhub${NC}"
echo -e "${BLUE}npm install${NC}"
echo -e "${BLUE}npm run build${NC}"
echo -e "${BLUE}node test-db.js${NC}"
echo -e "${BLUE}pm2 start ecosystem.config.js --env production${NC}"
echo -e "${BLUE}pm2 save${NC}"
echo -e "${BLUE}pm2 startup${NC}"
echo ""
echo "4. Configure DNS in Hostinger control panel:"
echo "   - A record: @ -> $(curl -s ifconfig.me)"
echo "   - A record: www -> $(curl -s ifconfig.me)"
echo ""
echo "5. Install SSL certificate:"
echo -e "${BLUE}certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo "Database credentials saved to: /root/petrodealhub_db_password.txt"
echo ""
echo -e "${GREEN}Your server IP: $(curl -s ifconfig.me)${NC}"
echo -e "${GREEN}Point your domain to this IP in Hostinger DNS settings${NC}"