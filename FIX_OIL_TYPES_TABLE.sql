-- Fix Oil Types Table Structure
-- This ensures the table matches the Drizzle schema exactly

-- Drop existing table to start fresh
DROP TABLE IF EXISTS oil_types CASCADE;

-- Create oil_types table with exact schema structure
CREATE TABLE oil_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  api_gravity DECIMAL(5,2),
  sulfur_content DECIMAL(5,3),
  viscosity DECIMAL(8,2),
  density DECIMAL(8,4),
  flash_point INTEGER,
  pour_point INTEGER,
  market_price DECIMAL(10,2),
  price_unit TEXT DEFAULT 'barrel',
  description TEXT,
  common_uses TEXT,
  major_producers TEXT,
  trading_symbol TEXT,
  hs_code TEXT,
  un_class TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert comprehensive sample data
INSERT INTO oil_types (
  name, display_name, category, api_gravity, sulfur_content, 
  market_price, price_unit, description, trading_symbol, 
  common_uses, major_producers
) VALUES 
(
  'brent_crude', 
  'Brent Crude Oil', 
  'crude', 
  38.06, 
  0.37, 
  85.50, 
  'barrel', 
  'Light sweet crude oil from North Sea offshore fields',
  'BRENT',
  '["Gasoline", "Diesel", "Jet fuel", "Heating oil"]',
  '["United Kingdom", "Norway", "Netherlands"]'
),
(
  'wti_crude', 
  'West Texas Intermediate', 
  'crude', 
  39.6, 
  0.24, 
  82.75, 
  'barrel', 
  'Light sweet crude oil benchmark from Texas',
  'WTI',
  '["Gasoline", "Diesel", "Jet fuel", "Chemical feedstock"]',
  '["United States", "Texas"]'
),
(
  'dubai_crude', 
  'Dubai Crude Oil', 
  'crude', 
  31.0, 
  2.0, 
  80.25, 
  'barrel', 
  'Medium sour crude oil from Middle East',
  'DUBAI',
  '["Heavy fuel oil", "Diesel", "Gasoline"]',
  '["UAE", "Dubai", "Middle East"]'
),
(
  'gasoline', 
  'Gasoline', 
  'refined', 
  60.0, 
  0.001, 
  95.30, 
  'gallon', 
  'Motor gasoline for automotive use',
  'RBOB',
  '["Automotive fuel", "Small engines", "Racing fuel"]',
  '["USA", "Europe", "Asia"]'
),
(
  'diesel', 
  'Diesel Fuel', 
  'refined', 
  35.0, 
  0.005, 
  90.15, 
  'gallon', 
  'Diesel fuel for transportation and heating',
  'ULSD',
  '["Trucks", "Ships", "Generators", "Heating"]',
  '["Global refineries", "USA", "Europe"]'
),
(
  'lng', 
  'Liquefied Natural Gas', 
  'lng', 
  NULL, 
  NULL, 
  12.50, 
  'mmbtu', 
  'Natural gas cooled to liquid form for transport',
  'LNG',
  '["Power generation", "Heating", "Industrial fuel"]',
  '["Qatar", "Australia", "USA", "Russia"]'
),
(
  'lpg', 
  'Liquefied Petroleum Gas', 
  'lpg', 
  NULL, 
  NULL, 
  45.20, 
  'gallon', 
  'Propane and butane mixture for various uses',
  'LPG',
  '["Heating", "Cooking", "Automotive", "Industrial"]',
  '["USA", "Saudi Arabia", "Russia"]'
),
(
  'heavy_fuel_oil', 
  'Heavy Fuel Oil', 
  'refined', 
  15.0, 
  3.5, 
  65.80, 
  'ton', 
  'Residual fuel oil for marine and power generation',
  'HFO',
  '["Ship fuel", "Power plants", "Industrial heating"]',
  '["Singapore", "Rotterdam", "Middle East"]'
),
(
  'marine_gas_oil', 
  'Marine Gas Oil', 
  'refined', 
  35.0, 
  0.1, 
  88.90, 
  'ton', 
  'Distillate fuel for marine engines',
  'MGO',
  '["Ship fuel", "Marine engines", "Auxiliary power"]',
  '["Global marine suppliers", "Singapore", "Rotterdam"]'
),
(
  'naphtha', 
  'Naphtha', 
  'petrochemical', 
  55.0, 
  0.02, 
  72.40, 
  'ton', 
  'Light hydrocarbon mixture for petrochemical feedstock',
  'NAPHTHA',
  '["Petrochemicals", "Gasoline blending", "Solvents"]',
  '["Middle East", "Asia", "USA"]'
);

-- Create indexes for better performance
CREATE INDEX idx_oil_types_category ON oil_types(category);
CREATE INDEX idx_oil_types_active ON oil_types(is_active);
CREATE INDEX idx_oil_types_trading_symbol ON oil_types(trading_symbol);

-- Update last_updated trigger function
CREATE OR REPLACE FUNCTION update_oil_types_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_oil_types_timestamp
    BEFORE UPDATE ON oil_types
    FOR EACH ROW
    EXECUTE FUNCTION update_oil_types_timestamp();

-- Verify data insertion
SELECT 
    id, 
    name, 
    display_name, 
    category, 
    api_gravity, 
    market_price, 
    trading_symbol 
FROM oil_types 
ORDER BY category, name;