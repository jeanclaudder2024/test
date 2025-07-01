-- Fix numeric precision issues in refineries table
-- Run this SQL script in your Supabase SQL Editor

-- Change lat and lng columns to handle larger values
ALTER TABLE refineries ALTER COLUMN lat TYPE NUMERIC(12, 6);
ALTER TABLE refineries ALTER COLUMN lng TYPE NUMERIC(12, 6);

-- Change complexity and utilization to handle percentage values properly
ALTER TABLE refineries ALTER COLUMN complexity TYPE NUMERIC(8, 2);
ALTER TABLE refineries ALTER COLUMN utilization TYPE NUMERIC(8, 2);

-- Alternatively, convert all problematic numeric fields to TEXT for simplicity
-- ALTER TABLE refineries ALTER COLUMN lat TYPE TEXT;
-- ALTER TABLE refineries ALTER COLUMN lng TYPE TEXT;
-- ALTER TABLE refineries ALTER COLUMN complexity TYPE TEXT;
-- ALTER TABLE refineries ALTER COLUMN utilization TYPE TEXT;

-- Check the updated column types
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
AND column_name IN ('lat', 'lng', 'complexity', 'utilization')
ORDER BY ordinal_position;