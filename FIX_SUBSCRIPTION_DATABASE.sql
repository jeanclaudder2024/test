-- FIX SUBSCRIPTION DATABASE - Run this in Supabase SQL Editor
-- This will fix the foreign key constraint error you're seeing

-- Step 1: Remove old broken subscription data
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- Step 2: Create the correct subscription plans table with the right IDs
DROP TABLE IF EXISTS subscription_plans CASCADE;
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    interval VARCHAR(20) DEFAULT 'month',
    trial_days INTEGER DEFAULT 0,
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]',
    max_vessels INTEGER DEFAULT 50,
    max_ports INTEGER DEFAULT 100,
    max_refineries INTEGER DEFAULT 20,
    can_access_broker_features BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_export_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Insert the correct subscription plans with IDs 1, 2, 3
INSERT INTO subscription_plans (id, name, description, price, interval, trial_days, features, max_vessels, max_ports, max_refineries, can_access_broker_features, can_access_analytics, can_export_data) VALUES
(1, 'Basic Plan', 'Perfect for independent brokers starting in petroleum markets', 69.00, 'month', 5, '["Access to 2 major maritime zones", "Basic vessel tracking with verified activity", "Access to 5 regional ports", "Basic documentation: LOI, SPA", "Email support"]', 50, 5, 10, false, false, false),
(2, 'Professional Plan', 'Professional brokers and medium-scale petroleum trading companies', 150.00, 'month', 5, '["Access to 6 major maritime zones", "Enhanced tracking with real-time updates", "Access to 20+ strategic ports", "Enhanced documentation: LOI, B/L, SPA, ICPO", "Basic broker features + deal participation", "Priority email support"]', 100, 20, 25, true, true, false),
(3, 'Enterprise Plan', 'Full-scale solution for large petroleum trading corporations', 399.00, 'month', 5, '["Access to 9 major global maritime zones", "Full live tracking with verified activity", "Access to 100+ strategic global ports", "Full set: SGS, SDS, Q88, ATB, customs", "International Broker ID included", "Legal recognition and dispute protection", "24/7 premium support + account manager"]', -1, -1, -1, true, true, true);

-- Step 4: Create the correct user_subscriptions table
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Reset the sequence to start from 4 for future plans
SELECT setval('subscription_plans_id_seq', 3, true);

-- Step 6: Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- Verification - Check if everything worked
SELECT 'SUCCESS: Subscription plans created' as status;
SELECT id, name, price, features FROM subscription_plans ORDER BY id;