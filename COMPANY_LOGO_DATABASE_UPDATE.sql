-- Company Logo Database Update Commands
-- Run these commands manually in your database to add logo support

-- Check if logo column already exists in real_companies table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'real_companies' 
        AND column_name = 'logo'
    ) THEN
        -- Add logo column to real_companies table
        ALTER TABLE real_companies 
        ADD COLUMN logo TEXT DEFAULT '';
        
        RAISE NOTICE 'Logo column added to real_companies table';
    ELSE
        RAISE NOTICE 'Logo column already exists in real_companies table';
    END IF;
END $$;

-- Add some sample logo URLs for testing (optional)
-- You can run these to test the logo functionality

-- Update ExxonMobil logo
UPDATE real_companies 
SET logo = 'https://logos-world.net/wp-content/uploads/2020/04/ExxonMobil-Logo.png'
WHERE name ILIKE '%exxon%' OR name ILIKE '%exxonmobil%';

-- Update Shell logo  
UPDATE real_companies 
SET logo = 'https://logos-world.net/wp-content/uploads/2020/04/Shell-Logo.png'
WHERE name ILIKE '%shell%';

-- Update BP logo
UPDATE real_companies 
SET logo = 'https://logos-world.net/wp-content/uploads/2020/04/BP-Logo.png'
WHERE name ILIKE '%bp%' OR name ILIKE '%british petroleum%';

-- Update Chevron logo
UPDATE real_companies 
SET logo = 'https://logos-world.net/wp-content/uploads/2020/04/Chevron-Logo.png'
WHERE name ILIKE '%chevron%';

-- Update Total logo
UPDATE real_companies 
SET logo = 'https://logos-world.net/wp-content/uploads/2020/04/Total-Logo.png'
WHERE name ILIKE '%total%';

-- Verify the changes
SELECT id, name, logo 
FROM real_companies 
WHERE logo IS NOT NULL AND logo != ''
ORDER BY name;

-- Create index for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_real_companies_logo 
ON real_companies(logo) 
WHERE logo IS NOT NULL AND logo != '';

COMMIT;