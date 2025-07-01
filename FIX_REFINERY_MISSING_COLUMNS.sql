-- Fix Missing Refinery Columns in Supabase
-- Run this SQL script in your Supabase SQL Editor to add missing columns

-- Add all missing columns to the refineries table
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS crude_oil_sources TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS processing_units TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS storage_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS pipeline_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS shipping_terminals TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS rail_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_certifications TEXT;

-- Add more comprehensive columns for detailed refinery information
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS fuel_types TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS refinery_complexity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS daily_throughput INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS annual_revenue BIGINT;
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
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS financial_performance TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS investment_plans TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS sustainability_initiatives TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS regulatory_compliance TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS quality_standards TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS innovation_projects TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS market_trends TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS competitive_analysis TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS future_outlook TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refineries_crude_oil_sources ON refineries(crude_oil_sources);
CREATE INDEX IF NOT EXISTS idx_refineries_processing_units ON refineries(processing_units);
CREATE INDEX IF NOT EXISTS idx_refineries_parent_company ON refineries(parent_company);
CREATE INDEX IF NOT EXISTS idx_refineries_safety_rating ON refineries(safety_rating);
CREATE INDEX IF NOT EXISTS idx_refineries_environmental_rating ON refineries(environmental_rating);
CREATE INDEX IF NOT EXISTS idx_refineries_created_at ON refineries(created_at);
CREATE INDEX IF NOT EXISTS idx_refineries_updated_at ON refineries(updated_at);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'refineries' 
ORDER BY ordinal_position;