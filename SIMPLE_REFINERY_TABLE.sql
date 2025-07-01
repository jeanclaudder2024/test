-- Simple Refinery Table Creation for Supabase
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

-- Insert one simple test refinery
INSERT INTO refineries (
    name, country, region, lat, lng, capacity, status, description,
    operator, owner, type, products, year_built, complexity, email,
    phone, website, address, technical_specs, city, utilization
) VALUES (
    'Test Refinery',
    'Saudi Arabia',
    'Middle East',
    '26.6737',
    '50.1651',
    550000,
    'Operational',
    'Test refinery for system validation',
    'Test Operator',
    'Test Owner',
    'Crude Oil Refinery',
    'Gasoline, Diesel, Jet Fuel',
    1945,
    '15.2',
    'test@example.com',
    '+966-13-872-2000',
    'https://example.com',
    'Test Industrial City',
    'Standard refining units',
    'Test City',
    '92.5'
);

COMMENT ON TABLE refineries IS 'Global oil refineries with comprehensive operational data';
COMMENT ON COLUMN refineries.capacity IS 'Daily processing capacity in barrels per day';
COMMENT ON COLUMN refineries.complexity IS 'Nelson Complexity Index rating';
COMMENT ON COLUMN refineries.utilization IS 'Current utilization percentage';