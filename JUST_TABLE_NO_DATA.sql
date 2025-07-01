-- Create only the refinery table structure (no sample data)
-- Run this SQL script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS refineries (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_refineries_region ON refineries(region);
CREATE INDEX IF NOT EXISTS idx_refineries_status ON refineries(status);
CREATE INDEX IF NOT EXISTS idx_refineries_type ON refineries(type);

-- Table created successfully - you can now add refineries through the admin panel