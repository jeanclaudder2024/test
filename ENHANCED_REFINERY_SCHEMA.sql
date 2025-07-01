-- Enhanced Refinery Schema with Comprehensive Details
-- Run this SQL script in your Supabase SQL Editor

-- Add comprehensive detailed columns to refineries table
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS crude_oil_sources TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS processing_units TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS storage_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS pipeline_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS shipping_terminals TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS rail_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_certifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS safety_record TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS workforce_size INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS annual_throughput TEXT;

-- Financial & Market Information
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS investment_cost TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS operating_costs TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS revenue TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS profit_margin TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS market_share TEXT;

-- Technical Specifications
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS distillation_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS conversion_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS hydrogen_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS sulfur_recovery TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS octane_rating TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS diesel_specifications TEXT;

-- Compliance & Regulations
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_compliance TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS regulatory_status TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS permits_licenses TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS inspection_schedule TEXT;

-- Strategic Information
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS expansion_plans TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS modernization_projects TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS technology_partnerships TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS supply_contracts TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS distribution_network TEXT;

-- Performance Metrics
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS efficiency_rating TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS energy_consumption TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS water_usage TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS emissions_data TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS downtime_statistics TEXT;

-- Geographic & Infrastructure
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS nearest_port TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS nearest_airport TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS transportation_links TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS utilities_infrastructure TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS local_suppliers TEXT;

-- Market Position
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS competitive_advantages TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS major_customers TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS export_markets TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS domestic_market_share TEXT;

-- Additional metadata
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS data_source TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS confidence_level TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_refineries_region ON refineries(region);
CREATE INDEX IF NOT EXISTS idx_refineries_status ON refineries(status);
CREATE INDEX IF NOT EXISTS idx_refineries_type ON refineries(type);
CREATE INDEX IF NOT EXISTS idx_refineries_created_at ON refineries(created_at);

-- Check the updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;