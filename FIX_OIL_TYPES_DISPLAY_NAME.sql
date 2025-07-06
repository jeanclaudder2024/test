-- Fix oil_types table by adding missing display_name column
-- This script should be run manually in the database

-- First, check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'oil_types' AND column_name = 'display_name') THEN
        -- Add the missing display_name column
        ALTER TABLE oil_types ADD COLUMN display_name TEXT;
        
        -- Update existing records to have display_name same as name initially
        UPDATE oil_types SET display_name = name WHERE display_name IS NULL;
        
        RAISE NOTICE 'Added display_name column to oil_types table';
    ELSE
        RAISE NOTICE 'display_name column already exists in oil_types table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'oil_types' 
ORDER BY ordinal_position;