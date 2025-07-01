-- Quick fix for array column issues
-- Run this in Supabase SQL Editor

-- Convert products column from array to text
ALTER TABLE refineries ALTER COLUMN products TYPE TEXT;

-- Convert other potentially problematic columns
ALTER TABLE refineries ALTER COLUMN description TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN operator TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN owner TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN type TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN technical_specs TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN email TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN phone TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN website TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN address TYPE TEXT;
ALTER TABLE refineries ALTER COLUMN city TYPE TEXT;

-- Check the results
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;