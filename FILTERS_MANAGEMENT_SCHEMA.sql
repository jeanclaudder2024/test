-- ==========================================
-- FILTERS MANAGEMENT SYSTEM DATABASE SCHEMA
-- Oil Types and Regions Tables
-- ==========================================

-- Create oil_types table for filter management
CREATE TABLE IF NOT EXISTS oil_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    api_gravity DECIMAL(5,2),
    sulfur_content VARCHAR(50),
    viscosity VARCHAR(50),
    color VARCHAR(50),
    origin VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create regions table for filter management
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(10) NOT NULL UNIQUE,
    continent VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample oil types
INSERT INTO oil_types (name, description, api_gravity, sulfur_content, viscosity, color, origin, is_active) VALUES
('Crude Oil - Light Sweet', 'High-quality crude oil with low sulfur content and high API gravity', 35.0, 'Low (<0.5%)', 'Light', 'Light Amber', 'North Sea', true),
('Crude Oil - Heavy Sour', 'Dense crude oil with high sulfur content requiring more refining', 22.0, 'High (>2.0%)', 'Heavy', 'Dark Brown', 'Venezuela', true),
('Brent Crude', 'Benchmark crude oil from North Sea oil fields', 38.0, 'Sweet (<0.37%)', 'Light', 'Golden', 'North Sea', true),
('WTI Crude', 'West Texas Intermediate benchmark crude oil', 39.0, 'Sweet (<0.24%)', 'Light', 'Light Gold', 'Texas, USA', true),
('Diesel Fuel', 'Refined petroleum product for marine engines', 35.0, 'Ultra Low (<0.15%)', 'Medium', 'Clear to Amber', 'Refined Product', true),
('Marine Gas Oil', 'Distillate fuel for marine vessels', 32.0, 'Low (<1.5%)', 'Light', 'Clear', 'Refined Product', true),
('Heavy Fuel Oil', 'Residual fuel oil for large marine engines', 15.0, 'High (>3.5%)', 'Very Heavy', 'Dark Black', 'Refined Product', true),
('Jet Fuel', 'Aviation turbine fuel for aircraft', 42.0, 'Low (<0.3%)', 'Light', 'Clear to Straw', 'Refined Product', true),
('Gasoline', 'Motor gasoline for automotive use', 60.0, 'Ultra Low (<0.1%)', 'Very Light', 'Clear to Pale Yellow', 'Refined Product', true),
('Lubricating Oil', 'Base oils for machinery lubrication', 28.0, 'Variable', 'Heavy', 'Amber to Dark', 'Refined Product', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample regions
INSERT INTO regions (name, description, code, continent, is_active) VALUES
('Middle East', 'Major oil-producing region including Gulf states and surrounding areas', 'ME', 'Asia', true),
('North America', 'United States, Canada, and Mexico oil markets', 'NA', 'North America', true),
('Europe', 'European Union and surrounding European countries', 'EU', 'Europe', true),
('Asia-Pacific', 'East and Southeast Asian markets including China, Japan, and Australia', 'APAC', 'Asia', true),
('South America', 'Latin American countries including Brazil, Venezuela, and Argentina', 'SA', 'South America', true),
('Africa', 'African continent including North and Sub-Saharan Africa', 'AF', 'Africa', true),
('Russia & CIS', 'Russian Federation and Commonwealth of Independent States', 'RU', 'Europe/Asia', true),
('North Sea', 'Offshore oil fields in the North Sea between UK and Norway', 'NS', 'Europe', true),
('West Africa', 'West African coastal countries with significant oil production', 'WA', 'Africa', true),
('Mediterranean', 'Mediterranean Sea region including coastal countries', 'MED', 'Europe/Africa', true),
('Caribbean', 'Caribbean islands and surrounding coastal areas', 'CAR', 'North America', true),
('Central Asia', 'Kazakhstan, Uzbekistan, and other Central Asian states', 'CA', 'Asia', true)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oil_types_name ON oil_types(name);
CREATE INDEX IF NOT EXISTS idx_oil_types_active ON oil_types(is_active);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_active ON regions(is_active);

-- Add comments for documentation
COMMENT ON TABLE oil_types IS 'Filter management table for oil product types and characteristics';
COMMENT ON TABLE regions IS 'Filter management table for geographical regions and markets';
COMMENT ON COLUMN oil_types.api_gravity IS 'API gravity measurement (higher = lighter oil)';
COMMENT ON COLUMN oil_types.sulfur_content IS 'Sulfur content classification (Sweet/Sour)';
COMMENT ON COLUMN regions.code IS 'Short code identifier for the region';
COMMENT ON COLUMN regions.continent IS 'Continent where the region is located';