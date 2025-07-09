-- Fix Missing Subscriptions Table - Run this in Supabase SQL Editor
-- This creates the missing "subscriptions" table that admin panel needs

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

-- Copy data from user_subscriptions to subscriptions table
INSERT INTO subscriptions (user_id, plan_id, status, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
SELECT 
    user_id, 
    plan_id, 
    status, 
    stripe_subscription_id, 
    current_period_start, 
    current_period_end, 
    cancel_at_period_end, 
    created_at, 
    updated_at
FROM user_subscriptions
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

SELECT 'SUCCESS: Subscriptions table created and populated' as status;