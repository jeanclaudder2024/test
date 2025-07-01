-- Create refineries table for Supabase
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

-- Insert sample refinery data
INSERT INTO refineries (
    name, country, region, lat, lng, capacity, status, description,
    operator, owner, type, products, year_built, complexity, email,
    phone, website, address, technical_specs, city, utilization
) VALUES 
(
    'Saudi Aramco Ras Tanura Refinery',
    'Saudi Arabia',
    'Middle East',
    '26.6737',
    '50.1651',
    550000,
    'Operational',
    'One of the largest oil refineries in the world, processing crude oil from the Ghawar field',
    'Saudi Aramco',
    'Saudi Aramco',
    'Crude Oil Refinery',
    'Gasoline, Diesel, Jet Fuel, Heavy Fuel Oil',
    1945,
    '15.2',
    'info@aramco.com',
    '+966-13-872-2000',
    'https://www.aramco.com',
    'Ras Tanura Industrial City, Eastern Province',
    'Advanced hydrocracking, catalytic reforming, and fluid catalytic cracking units',
    'Ras Tanura',
    '92.5'
),
(
    'Reliance Jamnagar Refinery Complex',
    'India',
    'Asia',
    '22.3510',
    '70.0664',
    1240000,
    'Operational',
    'World''s largest refinery complex with integrated petrochemical facilities',
    'Reliance Industries',
    'Reliance Industries Limited',
    'Integrated Refinery Complex',
    'Gasoline, Diesel, Petrochemicals, Polymers',
    1999,
    '18.7',
    'contact@ril.com',
    '+91-22-3555-5000',
    'https://www.ril.com',
    'Jamnagar, Gujarat',
    'Advanced process units including delayed coker, hydrotreater, and aromatics complex',
    'Jamnagar',
    '95.1'
),
(
    'ExxonMobil Baytown Refinery',
    'United States',
    'North America',
    '29.7355',
    '-94.9733',
    584000,
    'Operational',
    'Major integrated refining and petrochemical complex on the Houston Ship Channel',
    'ExxonMobil',
    'ExxonMobil Corporation',
    'Integrated Refinery',
    'Gasoline, Diesel, Jet Fuel, Petrochemicals',
    1920,
    '14.8',
    'info@exxonmobil.com',
    '+1-972-444-1000',
    'https://corporate.exxonmobil.com',
    '5000 Bayway Dr, Baytown, TX 77520',
    'Fluid catalytic cracking, hydrocracking, and advanced process control systems',
    'Baytown',
    '88.3'
),
(
    'Shell Pernis Refinery',
    'Netherlands',
    'Europe',
    '51.8897',
    '4.3875',
    416000,
    'Operational',
    'Europe\'s largest refinery with advanced biofuels production capabilities',
    'Shell',
    'Royal Dutch Shell',
    'Advanced Refinery',
    'Gasoline, Diesel, Biofuels, Base Oils',
    1902,
    '16.3',
    'info@shell.com',
    '+31-70-377-9111',
    'https://www.shell.com',
    'Vondelingenweg 601, 3196 KK Rotterdam',
    'Hydrocracking, catalytic dewaxing, and renewable fuel production units',
    'Rotterdam',
    '91.7'
);

-- Grant necessary permissions (adjust as needed for your setup)
-- ALTER TABLE refineries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE refineries IS 'Global oil refineries with comprehensive operational data';
COMMENT ON COLUMN refineries.capacity IS 'Daily processing capacity in barrels per day';
COMMENT ON COLUMN refineries.complexity IS 'Nelson Complexity Index rating';
COMMENT ON COLUMN refineries.utilization IS 'Current utilization percentage';