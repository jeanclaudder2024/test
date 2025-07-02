-- ============================================
-- COMPLETE SAAS DATABASE UPDATE SCRIPT
-- Run this manually in your database
-- ============================================

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  interval TEXT NOT NULL DEFAULT 'month',
  trial_days INTEGER DEFAULT 3,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB,
  max_vessels INTEGER DEFAULT -1,
  max_ports INTEGER DEFAULT -1,
  max_refineries INTEGER DEFAULT -1,
  can_access_broker_features BOOLEAN DEFAULT false,
  can_access_analytics BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trial',
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, features, max_vessels, max_ports, max_refineries, can_access_broker_features, can_access_analytics, can_export_data)
VALUES 
  ('Free Trial', '3-day trial with basic features', '0.00', '["Basic vessel tracking", "Limited port access", "Basic reporting"]', 10, 5, 2, false, false, false),
  ('Basic Plan', 'Perfect for small operations', '29.00', '["Full vessel tracking", "Port management", "Basic analytics", "Email support"]', 50, 20, 5, false, true, false),
  ('Pro Plan', 'Advanced features for growing businesses', '79.00', '["Unlimited vessels", "Advanced analytics", "API access", "Priority support", "Data export"]', -1, -1, 10, true, true, true),
  ('Enterprise', 'Complete solution for large operations', '199.00', '["Everything in Pro", "Custom integrations", "Dedicated support", "White labeling", "Advanced security"]', -1, -1, -1, true, true, true),
  ('Broker Premium', 'Specialized for maritime brokers', '149.00', '["Broker tools", "Deal management", "Client portal", "Commission tracking", "Advanced reporting"]', -1, -1, -1, true, true, true)
ON CONFLICT (name) DO NOTHING;

-- 6. Update existing admin user to have updated_at timestamp
UPDATE users SET updated_at = NOW() WHERE email = 'admin@petrodealhub.com';

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check subscription plans
SELECT id, name, price, features FROM subscription_plans;

-- Check if admin user exists
SELECT id, email, role, stripe_customer_id, created_at FROM users WHERE role = 'admin';

-- ============================================
-- SCRIPT COMPLETED
-- ============================================