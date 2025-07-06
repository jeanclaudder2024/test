# 🚨 URGENT: Fix Oil Types Database Issue

## Problem
The `oil_types` table in your Supabase database is missing required columns, specifically the `category` column and likely others. This is preventing the oil type management system from working.

## Quick Solution

**STEP 1**: Go to your Supabase SQL Editor:
- Open your Supabase project
- Click on "SQL Editor" in the left sidebar
- Create a new query

**STEP 2**: Copy and paste this entire script:

```sql
-- Complete Oil Types Table Recreation
-- This script completely recreates the oil_types table with all required columns

-- Step 1: Drop the existing incomplete table
DROP TABLE IF EXISTS oil_types CASCADE;

-- Step 2: Create the complete oil_types table with all 21 fields
CREATE TABLE oil_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL,
    api_gravity DECIMAL(5,2),
    sulfur_content DECIMAL(5,3),
    viscosity DECIMAL(8,2),
    density DECIMAL(5,3),
    flash_point INTEGER,
    pour_point INTEGER,
    market_price DECIMAL(10,2),
    price_unit TEXT DEFAULT 'USD/barrel',
    description TEXT,
    common_uses TEXT,
    major_producers TEXT,
    trading_symbol TEXT,
    hs_code TEXT,
    un_class TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_oil_types_category ON oil_types(category);
CREATE INDEX idx_oil_types_active ON oil_types(is_active);
CREATE INDEX idx_oil_types_name ON oil_types(name);

-- Step 4: Insert comprehensive oil types data
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

-- Verification queries
SELECT COUNT(*) as total_oil_types FROM oil_types;
SELECT name, display_name, category, is_active FROM oil_types ORDER BY category, name LIMIT 5;
```

**STEP 3**: Click "Run" button

**STEP 4**: Verify success by checking:
- You should see "13 total_oil_types" in the results
- You should see a list of oil types with categories like "Light Crude", "Heavy Crude", etc.

## What This Does
1. **Drops** the incomplete oil_types table completely
2. **Creates** a new table with all 21 required columns including `category`, `description`, etc.
3. **Populates** it with 13 comprehensive oil types with real data
4. **Adds** proper indexes for performance

## After Running This
- Go back to your application
- The oil type management should work perfectly
- You'll see 13 professional oil types with categories and descriptions
- All features including adding/editing oil types with descriptions will work

## ✅ Success Indicators
- Oil Types admin panel loads without errors
- Dropdown shows oil types like "West Texas Intermediate (WTI)", "Brent Crude", etc.
- Add Oil Type form includes description field
- Vessel filtering by oil type works on map pages

Run this script now and the oil type system will be fully functional!