-- Complete Enhanced Refinery Schema for Advanced Dashboard Features
-- Run this SQL script in your Supabase SQL Editor to add all missing enhanced fields

-- Technical Specifications
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS distillation_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS conversion_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS hydrogen_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS sulfur_recovery TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS processing_units TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS storage_capacity TEXT;

-- Financial Information
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS investment_cost TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS operating_costs TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS revenue TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS profit_margin TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS market_share TEXT;

-- Compliance & Regulations
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_certifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS safety_record TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS workforce_size INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS annual_throughput TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS crude_oil_sources TEXT;

-- Strategic Information
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS pipeline_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS shipping_terminals TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS rail_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS nearest_port TEXT;

-- Additional Comprehensive Fields
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS fuel_types TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS refinery_complexity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS daily_throughput INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS annual_revenue TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS employees_count INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS parent_company TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS safety_rating TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_rating TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS production_capacity INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS maintenance_schedule TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS compliance_status TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS market_position TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS strategic_partnerships TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS expansion_plans TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS technology_upgrades TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS operational_efficiency TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS supply_chain_partners TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS distribution_network TEXT;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_refineries_workforce_size ON refineries(workforce_size);
CREATE INDEX IF NOT EXISTS idx_refineries_established_year ON refineries(established_year);
CREATE INDEX IF NOT EXISTS idx_refineries_parent_company ON refineries(parent_company);
CREATE INDEX IF NOT EXISTS idx_refineries_safety_rating ON refineries(safety_rating);
CREATE INDEX IF NOT EXISTS idx_refineries_environmental_rating ON refineries(environmental_rating);

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;