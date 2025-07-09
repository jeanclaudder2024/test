-- Fix Missing Columns Error - Run this in Supabase SQL Editor
-- This adds the missing trial_start_date and trial_end_date columns

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;

-- Update the table to match the schema exactly
UPDATE user_subscriptions SET 
    trial_start_date = created_at,
    trial_end_date = created_at + INTERVAL '5 days'
WHERE trial_start_date IS NULL;

-- Verify the fix worked
SELECT 'SUCCESS: Missing columns added' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND column_name LIKE '%trial%';