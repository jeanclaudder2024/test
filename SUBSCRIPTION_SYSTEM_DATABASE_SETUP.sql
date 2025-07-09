-- =====================================================
-- SUBSCRIPTION SYSTEM DATABASE SETUP
-- Complete setup for subscription management system
-- =====================================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    interval TEXT NOT NULL DEFAULT 'month',
    trial_days INTEGER DEFAULT 5,
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

-- Create user_subscriptions table (using the correct schema from shared/schema.ts)
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

-- Create subscriptions table (the one currently used in the code)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    billing_interval TEXT NOT NULL DEFAULT 'month',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
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

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    stripe_payment_method_id TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    last4 TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, interval, trial_days, features, max_vessels, max_ports, max_refineries, can_access_broker_features, can_access_analytics, can_export_data) VALUES
('Basic', 'Access to 2 marine zones with essential vessel tracking', 69.00, 'month', 5, '["Real-time vessel tracking", "Port monitoring", "Basic analytics", "Email support"]', 50, 5, 10, false, false, false),
('Professional', 'Professional trading features with expanded access', 150.00, 'month', 5, '["Real-time vessel tracking", "Port monitoring", "Advanced analytics", "Broker features", "Document generation", "6 marine zones", "20+ ports", "Priority support"]', 100, 20, 25, true, true, false),
('Enterprise', 'Full global access with premium features', 399.00, 'month', 5, '["Real-time vessel tracking", "All marine zones", "100+ ports", "Unlimited refineries", "Broker features", "Advanced analytics", "Data export", "Legal protection", "Direct seller access", "International Broker ID", "24/7 support"]', -1, -1, -1, true, true, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    interval = EXCLUDED.interval,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features,
    max_vessels = EXCLUDED.max_vessels,
    max_ports = EXCLUDED.max_ports,
    max_refineries = EXCLUDED.max_refineries,
    can_access_broker_features = EXCLUDED.can_access_broker_features,
    can_access_analytics = EXCLUDED.can_access_analytics,
    can_export_data = EXCLUDED.can_export_data,
    updated_at = NOW();

-- Add subscription-related columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Update users with trial subscriptions
UPDATE users SET 
    is_subscribed = true,
    subscription_tier = 'Professional',
    trial_start_date = created_at,
    trial_end_date = created_at + INTERVAL '5 days',
    subscription_status = 'trial'
WHERE role = 'user' AND is_subscribed = false;

-- Create default trial subscriptions for existing users
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, billing_interval)
SELECT 
    u.id,
    2, -- Professional plan ID
    'trial',
    u.created_at,
    u.created_at + INTERVAL '5 days',
    'month'
FROM users u
WHERE u.role = 'user' 
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);

-- Grant admin users Enterprise access
UPDATE users SET 
    is_subscribed = true,
    subscription_tier = 'Enterprise',
    subscription_status = 'active'
WHERE role = 'admin';

INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, billing_interval)
SELECT 
    u.id,
    3, -- Enterprise plan ID
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    'year'
FROM users u
WHERE u.role = 'admin' 
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);

-- Display setup results
SELECT 'Subscription plans created:' as info, COUNT(*) as count FROM subscription_plans;
SELECT 'Active subscriptions:' as info, COUNT(*) as count FROM subscriptions;
SELECT 'Users with subscriptions:' as info, COUNT(*) as count FROM users WHERE is_subscribed = true;