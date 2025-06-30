-- Update refineries table to include comprehensive fields
-- Run this SQL to add missing columns to your refineries table

-- Check if columns exist and add them if missing
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
    
    -- Add products column if it doesn't exist
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

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;

-- Update any existing refineries to have default values for new fields
UPDATE refineries SET 
    city = COALESCE(city, ''),
    operator = COALESCE(operator, ''),
    owner = COALESCE(owner, ''),
    products = COALESCE(products, ''),
    email = COALESCE(email, ''),
    phone = COALESCE(phone, ''),
    website = COALESCE(website, ''),
    address = COALESCE(address, ''),
    technical_specs = COALESCE(technical_specs, ''),
    last_updated = COALESCE(last_updated, NOW())
WHERE id IS NOT NULL;

COMMIT;