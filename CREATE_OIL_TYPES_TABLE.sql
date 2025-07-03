-- Create oil_types table for vessel filtering
CREATE TABLE IF NOT EXISTS oil_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- Technical name: brent_crude, wti, etc.
  display_name TEXT NOT NULL, -- Human readable: Brent Crude Oil, West Texas Intermediate
  category TEXT NOT NULL, -- crude, refined, lng, lpg, petrochemical, other
  api_gravity DECIMAL(5,2), -- API gravity
  sulfur_content DECIMAL(5,3), -- Sulfur percentage
  viscosity DECIMAL(8,2), -- Viscosity in cSt
  density DECIMAL(8,4), -- Density in kg/m³
  flash_point INTEGER, -- Flash point in Celsius
  pour_point INTEGER, -- Pour point in Celsius
  market_price DECIMAL(10,2), -- USD per barrel/ton
  price_unit TEXT DEFAULT 'barrel', -- barrel, ton, gallon, mmbtu
  description TEXT,
  common_uses TEXT, -- JSON array of uses
  major_producers TEXT, -- JSON array of countries/companies
  trading_symbol TEXT, -- WTI, BRENT, etc.
  hs_code TEXT, -- Harmonized System code for customs
  un_class TEXT, -- UN classification for hazardous materials
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert sample oil types for testing
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