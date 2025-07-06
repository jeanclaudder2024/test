-- Fix oil_types table by adding missing display_name column
-- This script adds the display_name column that's required by the frontend form

-- Check if the display_name column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'oil_types' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE oil_types ADD COLUMN display_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Update existing records to have display_name same as name if they're empty
UPDATE oil_types SET display_name = name WHERE display_name IS NULL OR display_name = '';