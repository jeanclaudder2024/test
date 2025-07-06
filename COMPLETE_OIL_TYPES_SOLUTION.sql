-- Complete Oil Types Solution
-- Run this script after fixing the DATABASE_URL connection

-- Step 1: Ensure display_name column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'oil_types' AND column_name = 'display_name') THEN
        ALTER TABLE oil_types ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to oil_types table';
    END IF;
END $$;

-- Step 2: Clear existing data and reset sequence
TRUNCATE TABLE oil_types RESTART IDENTITY CASCADE;

-- Step 3: Insert comprehensive oil types with all fields
INSERT INTO oil_types (
    name, display_name, category, api_gravity, sulfur_content, viscosity, 
    density, flash_point, pour_point, market_price, price_unit, description,
    common_uses, major_producers, trading_symbol, hs_code, un_class, is_active
) VALUES 
-- Light Crude Oils
('wti', 'West Texas Intermediate (WTI)', 'Light Crude', 39.6, 0.24, 32.0, 0.827, 35, -30, 75.50, 'USD/barrel', 
 'Premium light sweet crude oil benchmark for North American markets with low sulfur content and excellent refining characteristics',
 'Gasoline, diesel fuel, jet fuel, petrochemicals', 'United States (Texas, North Dakota)', 'CL', '2709.00', 'UN1267', true),

('brent', 'Brent Crude', 'Light Crude', 38.3, 0.37, 35.0, 0.835, 40, -25, 74.80, 'USD/barrel',
 'International benchmark crude oil from North Sea with good refining properties and global market significance',
 'Gasoline, heating oil, jet fuel, petrochemicals', 'United Kingdom, Norway, Netherlands', 'CO', '2709.00', 'UN1267', true),

('dubai_crude', 'Dubai Crude', 'Medium Crude', 31.0, 2.0, 85.0, 0.871, 45, -15, 72.30, 'USD/barrel',
 'Middle Eastern medium sour crude oil benchmark for Asian markets with higher sulfur content',
 'Fuel oil, diesel, gasoline after processing', 'United Arab Emirates', 'DU', '2709.00', 'UN1267', true),

-- Heavy Crude Oils  
('maya_crude', 'Maya Crude', 'Heavy Crude', 22.0, 3.3, 450.0, 0.920, 55, 5, 68.90, 'USD/barrel',
 'Heavy sour crude oil from Mexico requiring specialized refining processes for optimal yields',
 'Heavy fuel oil, asphalt, petrochemicals', 'Mexico', 'MY', '2709.00', 'UN1267', true),

('heavy_canadian', 'Canadian Heavy Oil', 'Heavy Crude', 20.5, 2.8, 800.0, 0.935, 60, 15, 65.20, 'USD/barrel',
 'Extra heavy crude oil from Canadian oil sands requiring extensive upgrading and processing',
 'Upgraded synthetic crude, bitumen products', 'Canada (Alberta)', 'WCS', '2709.00', 'UN1267', true),

-- Refined Products
('gasoline_regular', 'Regular Gasoline', 'Refined Product', 60.0, 0.003, 0.5, 0.740, -43, -60, 2.85, 'USD/gallon',
 'Standard automotive fuel with 87 octane rating for passenger vehicles and light trucks',
 'Automotive fuel, small engines, equipment', 'Global refineries', 'RB', '2710.12', 'UN1203', true),

('diesel_fuel', 'Diesel Fuel', 'Refined Product', 35.0, 0.05, 2.5, 0.832, 65, -20, 3.10, 'USD/gallon',
 'Middle distillate fuel for compression ignition engines and heating applications',
 'Trucks, buses, marine engines, heating', 'Global refineries', 'HO', '2710.19', 'UN1202', true),

('jet_fuel', 'Jet Fuel (Jet A-1)', 'Refined Product', 42.0, 0.25, 1.2, 0.810, 38, -60, 3.45, 'USD/gallon',
 'Aviation turbine fuel meeting international specifications for commercial and military aircraft',
 'Commercial aviation, military aircraft', 'Global refineries', 'JF', '2710.19', 'UN1863', true),

-- Specialty Products
('heating_oil', 'Heating Oil', 'Refined Product', 36.0, 0.2, 2.8, 0.845, 55, -15, 2.95, 'USD/gallon',
 'Distillate fuel oil for residential and commercial heating systems',
 'Home heating, commercial boilers', 'Regional refineries', 'HO2', '2710.19', 'UN1202', true),

('marine_fuel', 'Marine Gas Oil (MGO)', 'Marine Fuel', 38.0, 0.1, 4.5, 0.850, 60, -10, 580.00, 'USD/metric ton',
 'Clean marine fuel compliant with IMO 2020 sulfur regulations for ocean vessels',
 'Ship engines, marine transportation', 'Marine fuel suppliers', 'MGO', '2710.19', 'UN1202', true),

('bunker_fuel', 'Marine Fuel Oil (IFO 380)', 'Marine Fuel', 15.0, 3.5, 380.0, 0.991, 65, 30, 420.00, 'USD/metric ton',
 'Heavy marine fuel oil for large ocean-going vessels and cargo ships',
 'Large ship engines, cargo vessels', 'Marine fuel suppliers', 'IFO', '2710.19', 'UN1202', true),

-- Natural Gas Products
('lng', 'Liquefied Natural Gas (LNG)', 'Natural Gas', 65.0, 0.001, 0.1, 0.430, -188, -162, 12.50, 'USD/MMBtu',
 'Cryogenic liquid form of natural gas for efficient transport and storage',
 'Power generation, heating, marine fuel', 'Qatar, Australia, USA, Russia', 'LNG', '2711.11', 'UN1972', true),

('lpg', 'Liquefied Petroleum Gas (LPG)', 'Natural Gas', 110.0, 0.002, 0.15, 0.510, -104, -189, 45.00, 'USD/metric ton',
 'Propane and butane mixture used for heating, cooking, and industrial applications',
 'Residential heating, cooking, petrochemicals', 'Global gas processors', 'LPG', '2711.12', 'UN1011', true);

-- Verify insertion
SELECT COUNT(*) as total_oil_types FROM oil_types;
SELECT name, display_name, category, is_active FROM oil_types ORDER BY category, name;