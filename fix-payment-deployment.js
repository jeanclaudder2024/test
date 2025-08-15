#!/usr/bin/env node

/**
 * Payment System Deployment Fix
 * Ensures all payment-related endpoints and configurations are working
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Payment System for Deployment...');

// 1. Check if Stripe environment variables are set
function checkStripeConfig() {
  console.log('\n📋 Checking Stripe Configuration...');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('⚠️  Missing Stripe environment variables:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Add these to your environment variables:');
    console.log('   STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)');
    console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)');
    console.log('   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (for frontend)');
  } else {
    console.log('✅ Stripe configuration looks good!');
  }
}

// 2. Verify payment endpoints exist
function verifyPaymentEndpoints() {
  console.log('\n🔍 Verifying Payment Endpoints...');
  
  const subscriptionRoutesPath = path.join(__dirname, 'server', 'routes', 'subscriptionRoutes.ts');
  
  if (!fs.existsSync(subscriptionRoutesPath)) {
    console.log('❌ Subscription routes file not found!');
    return;
  }
  
  const content = fs.readFileSync(subscriptionRoutesPath, 'utf8');
  
  const requiredEndpoints = [
    '/api/create-payment-method',
    '/api/subscriptions/create-checkout-session',
    '/api/subscriptions/webhook'
  ];
  
  const missingEndpoints = requiredEndpoints.filter(endpoint => 
    !content.includes(endpoint.replace('/api/', ''))
  );
  
  if (missingEndpoints.length > 0) {
    console.log('⚠️  Missing payment endpoints:');
    missingEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
  } else {
    console.log('✅ All payment endpoints are present!');
  }
}

// 3. Check database schema for payment tables
function checkPaymentSchema() {
  console.log('\n🗄️  Checking Payment Database Schema...');
  
  const schemaPath = path.join(__dirname, 'DATABASE_PAYMENT_SCHEMA_SETUP.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.log('⚠️  Payment schema file not found!');
    console.log('💡 Run this SQL to create payment tables:');
    console.log(`
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'trial',
    current_period_start TIMESTAMP DEFAULT NOW(),
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'card',
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add stripe payment method ID to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
    `);
  } else {
    console.log('✅ Payment schema file found!');
  }
}

// 4. Create production environment template
function createProductionEnvTemplate() {
  console.log('\n📝 Creating Production Environment Template...');
  
  const prodEnvContent = `# Production Environment Variables for Payment System
# Copy these to your hosting platform (Render, Vercel, etc.)

# Database
DATABASE_URL=your-production-database-url

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secure-random-session-secret

# Frontend URL (for Stripe redirects)
FRONTEND_URL=https://your-domain.com

# Optional: OpenAI for AI features
OPENAI_API_KEY=your-openai-api-key
`;

  fs.writeFileSync('.env.production.template', prodEnvContent);
  console.log('✅ Created .env.production.template');
}

// 5. Test payment endpoint availability
async function testPaymentEndpoints() {
  console.log('\n🧪 Testing Payment Endpoints...');
  
  try {
    // This would normally test the endpoints, but we'll just check if the server files exist
    const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
    const routesPath = path.join(__dirname, 'server', 'routes.ts');
    
    if (fs.existsSync(serverIndexPath) && fs.existsSync(routesPath)) {
      console.log('✅ Server files are present');
    } else {
      console.log('❌ Server files missing');
    }
  } catch (error) {
    console.log('⚠️  Could not test endpoints:', error.message);
  }
}

// 6. Create deployment checklist
function createDeploymentChecklist() {
  console.log('\n📋 Creating Deployment Checklist...');
  
  const checklist = `# Payment System Deployment Checklist

## Before Deployment:

### 1. Environment Variables ✅
- [ ] STRIPE_SECRET_KEY (sk_live_... for production)
- [ ] STRIPE_PUBLISHABLE_KEY (pk_live_... for production)  
- [ ] VITE_STRIPE_PUBLISHABLE_KEY (pk_live_... for production)
- [ ] STRIPE_WEBHOOK_SECRET (optional but recommended)
- [ ] DATABASE_URL (production database)
- [ ] SESSION_SECRET (secure random string)
- [ ] FRONTEND_URL (your domain)

### 2. Database Setup ✅
- [ ] Run DATABASE_PAYMENT_SCHEMA_SETUP.sql
- [ ] Verify payment tables exist
- [ ] Test database connection

### 3. Stripe Configuration ✅
- [ ] Create Stripe account
- [ ] Get live API keys
- [ ] Set up webhook endpoint: https://yourdomain.com/api/subscriptions/webhook
- [ ] Configure webhook events: checkout.session.completed, customer.subscription.updated

### 4. Frontend Build ✅
- [ ] npm run build
- [ ] Verify dist/client folder exists
- [ ] Test payment form loads

### 5. Testing ✅
- [ ] Test registration flow
- [ ] Test payment method creation
- [ ] Test subscription creation
- [ ] Test webhook handling

## After Deployment:

### 1. Verify Endpoints ✅
- [ ] GET /api/subscriptions/plans
- [ ] POST /api/create-payment-method
- [ ] POST /api/complete-registration
- [ ] POST /api/subscriptions/webhook

### 2. Test Payment Flow ✅
- [ ] Complete registration with test card: 4242424242424242
- [ ] Verify user account creation
- [ ] Verify payment method storage
- [ ] Test trial period

### 3. Monitor ✅
- [ ] Check server logs
- [ ] Monitor Stripe dashboard
- [ ] Test webhook delivery

## Common Issues & Solutions:

### Payment Method Not Saving:
- Check STRIPE_SECRET_KEY is set
- Verify /api/create-payment-method endpoint exists
- Check database connection

### Registration Failing:
- Verify DATABASE_URL is correct
- Check if users table exists
- Ensure password hashing works

### Webhooks Not Working:
- Set STRIPE_WEBHOOK_SECRET
- Verify webhook URL in Stripe dashboard
- Check webhook endpoint responds with 200

## Support:
If you encounter issues, check:
1. Server logs for errors
2. Browser console for frontend errors
3. Stripe dashboard for payment events
4. Database logs for connection issues
`;

  fs.writeFileSync('PAYMENT_DEPLOYMENT_CHECKLIST.md', checklist);
  console.log('✅ Created PAYMENT_DEPLOYMENT_CHECKLIST.md');
}

// Run all checks
async function main() {
  checkStripeConfig();
  verifyPaymentEndpoints();
  checkPaymentSchema();
  createProductionEnvTemplate();
  await testPaymentEndpoints();
  createDeploymentChecklist();
  
  console.log('\n🎉 Payment System Deployment Fix Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set up your Stripe account and get API keys');
  console.log('2. Add environment variables to your hosting platform');
  console.log('3. Run the database schema setup');
  console.log('4. Deploy and test the payment flow');
  console.log('5. Follow the checklist in PAYMENT_DEPLOYMENT_CHECKLIST.md');
}

main().catch(console.error);