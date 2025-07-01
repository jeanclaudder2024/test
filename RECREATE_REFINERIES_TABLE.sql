-- Completely recreate refineries table with correct structure
-- Run this SQL script in your Supabase SQL Editor

-- Drop existing table if needed (BE CAREFUL - this deletes all data)
-- DROP TABLE IF EXISTS refineries CASCADE;

-- Create new refineries table with correct data types
CREATE TABLE IF NOT EXISTS refineries_new (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    lat TEXT NOT NULL,
    lng TEXT NOT NULL,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    description TEXT,
    operator TEXT,
    owner TEXT,
    type TEXT,
    products TEXT,
    year_built INTEGER,
    last_maintenance TIMESTAMP,
    next_maintenance TIMESTAMP,
    complexity TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    technical_specs TEXT,
    photo TEXT,
    city TEXT,
    last_updated TIMESTAMP,
    utilization TEXT
);

-- Copy existing data if any (converting arrays to text)
INSERT INTO refineries_new (
    name, country, region, lat, lng, capacity, status, description,
    operator, owner, type, products, year_built, last_maintenance,
    next_maintenance, complexity, email, phone, website, address,
    technical_specs, photo, city, last_updated, utilization
)
SELECT 
    name, 
    country, 
    region, 
    CASE WHEN lat IS NULL THEN '0' ELSE lat::text END,
    CASE WHEN lng IS NULL THEN '0' ELSE lng::text END,
    capacity, 
    status, 
    CASE 
        WHEN description IS NULL THEN NULL
        WHEN description::text LIKE '{%}' THEN array_to_string(description::text[], ', ')
        ELSE description::text 
    END,
    CASE 
        WHEN operator IS NULL THEN NULL
        WHEN operator::text LIKE '{%}' THEN array_to_string(operator::text[], ', ')
        ELSE operator::text 
    END,
    CASE 
        WHEN owner IS NULL THEN NULL
        WHEN owner::text LIKE '{%}' THEN array_to_string(owner::text[], ', ')
        ELSE owner::text 
    END,
    CASE 
        WHEN type IS NULL THEN NULL
        WHEN type::text LIKE '{%}' THEN array_to_string(type::text[], ', ')
        ELSE type::text 
    END,
    CASE 
        WHEN products IS NULL THEN NULL
        WHEN products::text LIKE '{%}' THEN array_to_string(products::text[], ', ')
        ELSE products::text 
    END,
    year_built, 
    last_maintenance, 
    next_maintenance, 
    CASE 
        WHEN complexity IS NULL THEN NULL
        ELSE complexity::text 
    END,
    CASE 
        WHEN email IS NULL THEN NULL
        WHEN email::text LIKE '{%}' THEN array_to_string(email::text[], ', ')
        ELSE email::text 
    END,
    CASE 
        WHEN phone IS NULL THEN NULL
        WHEN phone::text LIKE '{%}' THEN array_to_string(phone::text[], ', ')
        ELSE phone::text 
    END,
    CASE 
        WHEN website IS NULL THEN NULL
        WHEN website::text LIKE '{%}' THEN array_to_string(website::text[], ', ')
        ELSE website::text 
    END,
    CASE 
        WHEN address IS NULL THEN NULL
        WHEN address::text LIKE '{%}' THEN array_to_string(address::text[], ', ')
        ELSE address::text 
    END,
    CASE 
        WHEN technical_specs IS NULL THEN NULL
        WHEN technical_specs::text LIKE '{%}' THEN array_to_string(technical_specs::text[], ', ')
        ELSE technical_specs::text 
    END,
    CASE 
        WHEN photo IS NULL THEN NULL
        WHEN photo::text LIKE '{%}' THEN array_to_string(photo::text[], ', ')
        ELSE photo::text 
    END,
    CASE 
        WHEN city IS NULL THEN NULL
        WHEN city::text LIKE '{%}' THEN array_to_string(city::text[], ', ')
        ELSE city::text 
    END,
    last_updated, 
    CASE 
        WHEN utilization IS NULL THEN NULL
        ELSE utilization::text 
    END
FROM refineries
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refineries');

-- Drop old table and rename new one
-- DROP TABLE IF EXISTS refineries;
-- ALTER TABLE refineries_new RENAME TO refineries;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries_new(country);
CREATE INDEX IF NOT EXISTS idx_refineries_region ON refineries_new(region);
CREATE INDEX IF NOT EXISTS idx_refineries_status ON refineries_new(status);
CREATE INDEX IF NOT EXISTS idx_refineries_type ON refineries_new(type);

-- Show final structure
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'refineries_new' 
ORDER BY ordinal_position;