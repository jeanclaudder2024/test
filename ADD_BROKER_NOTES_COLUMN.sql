-- Add broker notes column to transaction_steps table
-- Run this in your Supabase SQL editor

ALTER TABLE transaction_steps ADD COLUMN IF NOT EXISTS broker_notes TEXT;

-- Update the schema to support broker submissions
-- This allows brokers to add notes when submitting documents for each step

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transaction_steps' 
AND column_name = 'broker_notes';