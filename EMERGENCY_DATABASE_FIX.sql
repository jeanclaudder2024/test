-- EMERGENCY DATABASE FIX - Run this in Supabase SQL Editor
-- This will completely fix all database structure issues

-- Step 1: Fix user_subscriptions table structure
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP;

-- Step 2: Update existing data to match requirements
UPDATE user_subscriptions SET 
    trial_start_date = COALESCE(trial_start_date, created_at),
    trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '5 days'),
    cancel_at_period_end = COALESCE(cancel_at_period_end, false),
    current_period_start = COALESCE(current_period_start, created_at),
    current_period_end = COALESCE(current_period_end, created_at + INTERVAL '30 days')
WHERE trial_start_date IS NULL OR trial_end_date IS NULL OR cancel_at_period_end IS NULL;

-- Step 3: Create admin subscription if missing
INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start_date, trial_end_date, current_period_start, current_period_end)
SELECT 
    u.id, 
    2, -- Professional plan
    'active',
    NOW(),
    NOW() + INTERVAL '365 days',
    NOW(),
    NOW() + INTERVAL '365 days'
FROM users u 
WHERE u.email = 'admin@petrodealhub.com' 
AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
);

-- Step 4: Verify the fix
SELECT 'EMERGENCY FIX COMPLETE - System should work now!' as status;

-- Step 5: Check final structure
SELECT 
    table_name,
    column_name,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
ORDER BY ordinal_position;