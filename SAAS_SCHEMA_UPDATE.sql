-- Complete SaaS Database Schema Update
-- This will create the foundation for subscription-based access control

-- Step 1: Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL, -- "Free Trial", "Basic", "Pro", "Enterprise", "Broker"
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    interval TEXT NOT NULL DEFAULT 'month', -- "month", "year"
    trial_days INTEGER DEFAULT 3,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    features JSONB, -- JSON array of feature names
    max_vessels INTEGER DEFAULT -1, -- -1 = unlimited
    max_ports INTEGER DEFAULT -1,
    max_refineries INTEGER DEFAULT -1,
    can_access_broker_features BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_export_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Add Stripe fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 3: Update user_subscriptions table to support full SaaS functionality
DROP TABLE IF EXISTS user_subscriptions CASCADE;
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'trial', -- "trial", "active", "canceled", "past_due", "unpaid"
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create Payment History Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL, -- "succeeded", "failed", "pending"
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Insert Default Subscription Plans
INSERT INTO subscription_plans (name, description, price, interval, trial_days, features, max_vessels, max_ports, max_refineries, can_access_broker_features, can_access_analytics, can_export_data) VALUES
('Free Trial', '3-day free trial with limited access', 0.00, 'month', 3, '["vessel_tracking", "port_data", "basic_analytics"]', 10, 10, 5, false, false, false),
('Basic Plan', 'Essential features for small operations', 29.99, 'month', 0, '["vessel_tracking", "port_data", "basic_analytics", "document_generation"]', 50, 25, 10, false, true, false),
('Pro Plan', 'Advanced features for growing businesses', 79.99, 'month', 0, '["vessel_tracking", "port_data", "advanced_analytics", "document_generation", "real_time_updates", "api_access"]', 200, 100, 50, false, true, true),
('Enterprise', 'Full features for large organizations', 199.99, 'month', 0, '["all_features", "priority_support", "custom_integrations"]', -1, -1, -1, false, true, true),
('Broker Premium', 'Specialized broker features and tools', 149.99, 'month', 0, '["broker_dashboard", "deal_management", "client_portal", "commission_tracking", "advanced_reporting"]', -1, -1, -1, true, true, true);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Step 7: Create function to check user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id_param INTEGER)
RETURNS TABLE (
    has_active_subscription BOOLEAN,
    plan_name TEXT,
    status TEXT,
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    can_access_broker_features BOOLEAN,
    can_access_analytics BOOLEAN,
    can_export_data BOOLEAN,
    max_vessels INTEGER,
    max_ports INTEGER,
    max_refineries INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN us.status IN ('trial', 'active') AND 
                 (us.trial_end_date IS NULL OR us.trial_end_date > NOW()) AND
                 (us.current_period_end IS NULL OR us.current_period_end > NOW())
            THEN true 
            ELSE false 
        END as has_active_subscription,
        sp.name as plan_name,
        us.status,
        us.trial_end_date as trial_ends_at,
        us.current_period_end as subscription_ends_at,
        sp.can_access_broker_features,
        sp.can_access_analytics,
        sp.can_export_data,
        sp.max_vessels,
        sp.max_ports,
        sp.max_refineries
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_id_param
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Automatically assign trial subscription to existing users
INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start_date, trial_end_date)
SELECT 
    u.id,
    (SELECT id FROM subscription_plans WHERE name = 'Free Trial' LIMIT 1),
    'trial',
    NOW(),
    NOW() + INTERVAL '3 days'
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM user_subscriptions)
AND u.role != 'admin'; -- Admin users don't need subscriptions

COMMIT;