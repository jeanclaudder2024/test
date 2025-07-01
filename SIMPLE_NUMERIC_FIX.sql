-- Simple fix: Convert all problematic numeric columns to TEXT
-- This is the easiest solution to avoid precision issues
-- Run this SQL script in your Supabase SQL Editor

-- Convert lat, lng, complexity, and utilization to TEXT
ALTER TABLE refineries ALTER COLUMN lat TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN lng TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN complexity TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN utilization TYPE TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
AND column_name IN ('lat', 'lng', 'complexity', 'utilization')
ORDER BY column_name;