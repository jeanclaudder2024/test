#!/bin/bash

# Production startup script for PetroDealHub
# This script handles the production startup sequence with proper error handling

set -e

echo "🚀 Starting PetroDealHub in Production Mode"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo "Setting NODE_ENV=production"
    export NODE_ENV=production
fi

# Verify required files exist
echo -e "${GREEN}[1/7]${NC} Checking required files..."
required_files=(".env" "dist/index.js" "ecosystem.config.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done
echo "✅ All required files present"

# Load environment variables
echo -e "${GREEN}[2/7]${NC} Loading environment variables..."
source .env

# Check required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable missing: $var${NC}"
        exit 1
    fi
done
echo "✅ Environment variables loaded"

# Test database connection
echo -e "${GREEN}[3/7]${NC} Testing database connection..."
if node test-db.js; then
    echo "✅ Database connection successful"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Stop existing PM2 processes
echo -e "${GREEN}[4/7]${NC} Stopping existing processes..."
pm2 delete petrodealhub 2>/dev/null || echo "No existing process found"

# Start with PM2
echo -e "${GREEN}[5/7]${NC} Starting with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo -e "${GREEN}[6/7]${NC} Saving PM2 configuration..."
pm2 save

# Health check
echo -e "${GREEN}[7/7]${NC} Performing health check..."
sleep 5  # Wait for app to start

if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo -e "${YELLOW}⚠️  Health check failed - app may still be starting${NC}"
fi

echo ""
echo -e "${GREEN}🎉 PetroDealHub started successfully!${NC}"
echo ""
echo "Process status:"
pm2 status

echo ""
echo "View logs with:"
echo "  pm2 logs petrodealhub"
echo ""
echo "Monitor application:"
echo "  pm2 monit"
echo ""
echo "Application URLs:"
echo "  Health: http://localhost:5000/api/health"
echo "  Main:   http://localhost:5000"