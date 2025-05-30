#!/bin/bash

# Hostinger Deployment Script for Oil Vessel Tracking Platform
echo "🚀 Building Oil Vessel Tracking Platform for Hostinger..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Create logs directory
mkdir -p logs

# Create production environment file template
cat > .env.production.template << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# API Keys (Get these from your service providers)
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Settings
NODE_ENV=production
PORT=3000

# Optional: External APIs
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
EOF

echo "✅ Build completed!"
echo "📁 Files ready for upload to Hostinger:"
echo "   - dist/ (backend)"
echo "   - client/dist/ (frontend)" 
echo "   - package.json"
echo "   - ecosystem.config.js"
echo "   - .env.production.template"
echo ""
echo "📖 Next steps:"
echo "1. Upload files to your Hostinger server"
echo "2. Rename .env.production.template to .env and fill in your credentials"
echo "3. Run: npm install --production"
echo "4. Run: npm install -g pm2"
echo "5. Run: pm2 start ecosystem.config.js"
echo ""
echo "🔗 See deployment-guide.md for detailed instructions"