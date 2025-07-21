-- Simple fix for broker_deals table column mismatch
-- Run this in your Supabase SQL editor

-- Add the deal_status column if it doesn't exist (to match references in some code)
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS deal_status VARCHAR(50) DEFAULT 'draft';

-- Copy data from status to deal_status if status column exists and has data
UPDATE broker_deals 
SET deal_status = status 
WHERE deal_status IS NULL AND status IS NOT NULL;

-- Also ensure status column exists (the main schema uses this)
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Copy data from deal_status to status if needed
UPDATE broker_deals 
SET status = deal_status 
WHERE status IS NULL AND deal_status IS NOT NULL;

-- Add other missing columns that might be referenced
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP';
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS overall_progress DECIMAL(5,2) DEFAULT 0.00;

-- Check the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'broker_deals' 
ORDER BY ordinal_position;