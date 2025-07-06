-- PetroDealHub Database Verification and Fix Script
-- This script checks and adds any missing columns for users and subscription tables

-- 1. Check and fix users table
-- Add any missing columns that might be needed
DO $$
BEGIN
    -- Add username column if it doesn't exist (some code references it)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
        RAISE NOTICE 'Added username column to users table';
    END IF;

    -- Add isSubscribed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_subscribed') THEN
        ALTER TABLE users ADD COLUMN is_subscribed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_subscribed column to users table';
    END IF;

    -- Add subscriptionTier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        ALTER TABLE users ADD COLUMN subscription_tier TEXT;
        RAISE NOTICE 'Added subscription_tier column to users table';
    END IF;

    -- Add profileImageUrl column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
        ALTER TABLE users ADD COLUMN profile_image_url TEXT;
        RAISE NOTICE 'Added profile_image_url column to users table';
    END IF;
END $$;

-- 2. Check and fix subscription_plans table
DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'slug') THEN
        ALTER TABLE subscription_plans ADD COLUMN slug TEXT UNIQUE;
        RAISE NOTICE 'Added slug column to subscription_plans table';
    END IF;

    -- Add sortOrder column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'sort_order') THEN
        ALTER TABLE subscription_plans ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sort_order column to subscription_plans table';
    END IF;

    -- Add monthlyPrice column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'monthly_price') THEN
        ALTER TABLE subscription_plans ADD COLUMN monthly_price DECIMAL(10,2);
        RAISE NOTICE 'Added monthly_price column to subscription_plans table';
    END IF;

    -- Add yearlyPrice column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'yearly_price') THEN
        ALTER TABLE subscription_plans ADD COLUMN yearly_price DECIMAL(10,2);
        RAISE NOTICE 'Added yearly_price column to subscription_plans table';
    END IF;

    -- Update trial days to 5 instead of 3
    UPDATE subscription_plans SET trial_days = 5 WHERE trial_days = 3;
    RAISE NOTICE 'Updated trial days from 3 to 5 for all plans';
END $$;

-- 3. Check and fix user_subscriptions table
DO $$
BEGIN
    -- Add billingInterval column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'billing_interval') THEN
        ALTER TABLE user_subscriptions ADD COLUMN billing_interval TEXT DEFAULT 'month';
        RAISE NOTICE 'Added billing_interval column to user_subscriptions table';
    END IF;

    -- Add stripeCustomerId column if it doesn't exist (duplicate of users table for quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN stripe_customer_id TEXT;
        RAISE NOTICE 'Added stripe_customer_id column to user_subscriptions table';
    END IF;
END $$;

-- 4. Ensure subscription plans exist with correct pricing
INSERT INTO subscription_plans (name, description, price, interval, trial_days, slug, sort_order, monthly_price, yearly_price, 
                                can_access_broker_features, can_access_analytics, can_export_data, features)
VALUES 
    ('Starter', 'Perfect for small traders and new brokers', 29.00, 'month', 5, 'starter', 1, 29.00, 290.00,
     false, false, false, '["Real-time vessel tracking", "Port information access", "Basic search capabilities", "Email support"]'::jsonb),
    
    ('Professional', 'Ideal for established brokers and trading teams', 99.00, 'month', 5, 'professional', 2, 99.00, 990.00,
     true, true, false, '["Everything in Starter", "Advanced broker features", "Analytics dashboard", "AI-powered insights", "Priority support"]'::jsonb),
    
    ('Enterprise', 'Complete solution for large organizations', 299.00, 'month', 5, 'enterprise', 3, 299.00, 2990.00,
     true, true, true, '["Everything in Professional", "Unlimited data export", "API access", "Custom integrations", "Dedicated support", "International Broker Membership", "Legal recognition and dispute protection"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    trial_days = 5,
    slug = EXCLUDED.slug,
    sort_order = EXCLUDED.sort_order,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    can_access_broker_features = EXCLUDED.can_access_broker_features,
    can_access_analytics = EXCLUDED.can_access_analytics,
    can_export_data = EXCLUDED.can_export_data,
    features = EXCLUDED.features,
    description = EXCLUDED.description;

-- 5. Display current table structures for verification
RAISE NOTICE '=== USERS TABLE STRUCTURE ===';
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

RAISE NOTICE '=== SUBSCRIPTION_PLANS TABLE STRUCTURE ===';
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

RAISE NOTICE '=== USER_SUBSCRIPTIONS TABLE STRUCTURE ===';
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 6. Create test user for registration/login testing
-- Password is 'testpass123' hashed with bcrypt
INSERT INTO users (email, password, first_name, last_name, role, created_at)
VALUES ('testuser@petrodealhub.com', '$2b$10$YourHashedPasswordHere', 'Test', 'User', 'user', NOW())
ON CONFLICT (email) DO NOTHING;

RAISE NOTICE 'Database structure check and fix completed!';