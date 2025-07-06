-- MANUAL OIL TYPES TABLE CREATION
-- Execute this SQL directly in your PostgreSQL database to create the oil_types table

-- Drop existing table if it exists (optional - only if you need to recreate)
-- DROP TABLE IF EXISTS oil_types CASCADE;

-- Create oil_types table with complete schema
CREATE TABLE IF NOT EXISTS oil_types (
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

-- Insert sample oil types data
INSERT INTO oil_types (name, display_name, category, api_gravity, sulfur_content, market_price, description, trading_symbol) VALUES
('brent_crude', 'Brent Crude Oil', 'crude', 38.06, 0.37, 85.50, 'Light sweet crude oil from North Sea', 'BRENT'),
('wti_crude', 'West Texas Intermediate', 'crude', 39.6, 0.24, 82.75, 'Light sweet crude oil benchmark', 'WTI'),
('dubai_crude', 'Dubai Crude Oil', 'crude', 31.0, 2.0, 80.25, 'Medium sour crude oil from Middle East', 'DUBAI'),
('gasoline', 'Gasoline', 'refined', 60.0, 0.001, 95.30, 'Motor gasoline for automotive use', 'RBOB'),
('diesel', 'Diesel Fuel', 'refined', 35.0, 0.005, 90.15, 'Diesel fuel for transportation and heating', 'ULSD'),
('jet_fuel', 'Jet Fuel', 'refined', 43.0, 0.003, 88.90, 'Aviation turbine fuel', 'JET'),
('fuel_oil', 'Heavy Fuel Oil', 'refined', 15.0, 3.5, 65.40, 'Heavy fuel oil for marine and power generation', 'HFO'),
('lng', 'Liquefied Natural Gas', 'lng', NULL, NULL, 12.50, 'Natural gas in liquid form for transport', 'LNG'),
('lpg', 'Liquefied Petroleum Gas', 'lpg', NULL, NULL, 85.75, 'Propane and butane mixture', 'LPG'),
('naphtha', 'Naphtha', 'petrochemical', 65.0, 0.001, 87.20, 'Light hydrocarbon mixture for petrochemicals', 'NAPHTHA')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oil_types_category ON oil_types(category);
CREATE INDEX IF NOT EXISTS idx_oil_types_active ON oil_types(is_active);
CREATE INDEX IF NOT EXISTS idx_oil_types_trading_symbol ON oil_types(trading_symbol);

-- Create or replace the trigger function for updating last_updated timestamp
CREATE OR REPLACE FUNCTION update_oil_types_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_oil_types_timestamp ON oil_types;
CREATE TRIGGER update_oil_types_timestamp
    BEFORE UPDATE ON oil_types
    FOR EACH ROW
    EXECUTE FUNCTION update_oil_types_timestamp();

-- Verify table creation and data insertion
SELECT 
    'Table verification:' as check_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT category) as categories,
    COUNT(DISTINCT trading_symbol) as trading_symbols
FROM oil_types;

-- Show sample data
SELECT 
    id, 
    name, 
    display_name, 
    category, 
    api_gravity, 
    market_price, 
    trading_symbol,
    description
FROM oil_types 
ORDER BY category, name
LIMIT 10;