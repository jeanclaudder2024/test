-- Fixed SQL script to update refineries table safely
-- This script handles both TEXT and ARRAY column types correctly

DO $$ 
BEGIN
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'city') THEN
        ALTER TABLE refineries ADD COLUMN city TEXT;
    END IF;
    
    -- Add operator column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'operator') THEN
        ALTER TABLE refineries ADD COLUMN operator TEXT;
    END IF;
    
    -- Add owner column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'owner') THEN
        ALTER TABLE refineries ADD COLUMN owner TEXT;
    END IF;
    
    -- Add products column as TEXT (not array) if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'products') THEN
        ALTER TABLE refineries ADD COLUMN products TEXT;
    END IF;
    
    -- Add year_built column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'year_built') THEN
        ALTER TABLE refineries ADD COLUMN year_built INTEGER;
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'email') THEN
        ALTER TABLE refineries ADD COLUMN email TEXT;
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'phone') THEN
        ALTER TABLE refineries ADD COLUMN phone TEXT;
    END IF;
    
    -- Add website column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'website') THEN
        ALTER TABLE refineries ADD COLUMN website TEXT;
    END IF;
    
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'address') THEN
        ALTER TABLE refineries ADD COLUMN address TEXT;
    END IF;
    
    -- Add technical_specs column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'technical_specs') THEN
        ALTER TABLE refineries ADD COLUMN technical_specs TEXT;
    END IF;
    
    -- Add utilization column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'utilization') THEN
        ALTER TABLE refineries ADD COLUMN utilization DECIMAL(10,2);
    END IF;
    
    -- Add complexity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'complexity') THEN
        ALTER TABLE refineries ADD COLUMN complexity DECIMAL(10,2);
    END IF;
    
    -- Add last_maintenance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'last_maintenance') THEN
        ALTER TABLE refineries ADD COLUMN last_maintenance TIMESTAMP;
    END IF;
    
    -- Add next_maintenance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'next_maintenance') THEN
        ALTER TABLE refineries ADD COLUMN next_maintenance TIMESTAMP;
    END IF;
    
    -- Add photo column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'photo') THEN
        ALTER TABLE refineries ADD COLUMN photo TEXT;
    END IF;
    
    -- Add last_updated column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refineries' AND column_name = 'last_updated') THEN
        ALTER TABLE refineries ADD COLUMN last_updated TIMESTAMP;
    END IF;

END $$;

-- Check if products column is an array type and convert if needed
DO $$
DECLARE
    col_type TEXT;
BEGIN
    -- Get the data type of the products column
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'refineries' AND column_name = 'products';
    
    -- If it's an array type, we need to handle it differently
    IF col_type = 'ARRAY' THEN
        -- For array columns, set empty arrays instead of empty strings
        UPDATE refineries SET products = NULL WHERE products IS NULL;
    END IF;
END $$;

-- Update existing refineries with safe default values
UPDATE refineries SET 
    city = COALESCE(city, ''),
    operator = COALESCE(operator, ''),
    owner = COALESCE(owner, ''),
    email = COALESCE(email, ''),
    phone = COALESCE(phone, ''),
    website = COALESCE(website, ''),
    address = COALESCE(address, ''),
    technical_specs = COALESCE(technical_specs, ''),
    last_updated = COALESCE(last_updated, NOW())
WHERE id IS NOT NULL;

-- Handle products column separately (in case it's an array)
UPDATE refineries SET 
    products = COALESCE(products, '')
WHERE id IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'refineries' 
        AND column_name = 'products' 
        AND data_type = 'text'
    );

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;

COMMIT;