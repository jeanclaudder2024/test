-- Fix column types in refineries table to match application schema
-- Run this SQL script in your Supabase SQL Editor

-- Check which columns are currently arrays
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
AND data_type = 'ARRAY';

-- Convert array columns to text columns
DO $$
BEGIN
    -- Check if products column is an array and convert it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'refineries' 
        AND column_name = 'products' 
        AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE refineries ALTER COLUMN products TYPE TEXT USING array_to_string(products, ', ');
    END IF;
    
    -- Check if technical_specs column is an array and convert it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'refineries' 
        AND column_name = 'technical_specs' 
        AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE refineries ALTER COLUMN technical_specs TYPE TEXT USING array_to_string(technical_specs, ', ');
    END IF;
    
    -- Ensure all text columns that might be arrays are converted
    -- Check each potentially problematic column
    DECLARE
        col_record RECORD;
    BEGIN
        FOR col_record IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'refineries' 
            AND data_type = 'ARRAY'
            AND column_name IN ('description', 'operator', 'owner', 'type', 'email', 'phone', 'website', 'address', 'city')
        LOOP
            EXECUTE format('ALTER TABLE refineries ALTER COLUMN %I TYPE TEXT USING array_to_string(%I, '', '')', 
                          col_record.column_name, col_record.column_name);
        END LOOP;
    END;
END $$;

-- Verify the changes
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;