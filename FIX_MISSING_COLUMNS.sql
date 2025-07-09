-- Fix Missing Columns Error - Run this in Supabase SQL Editor
-- This adds ALL missing columns to user_subscriptions table

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Update the table to match the schema exactly
UPDATE user_subscriptions SET 
    trial_start_date = created_at,
    trial_end_date = created_at + INTERVAL '5 days',
    cancel_at_period_end = false
WHERE trial_start_date IS NULL;

-- Verify the fix worked
SELECT 'SUCCESS: All missing columns added' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
ORDER BY column_name;