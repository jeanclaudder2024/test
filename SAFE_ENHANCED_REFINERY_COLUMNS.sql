-- Safe Enhanced Refinery Management Database Columns
-- This script adds only missing columns to avoid "already exists" errors

-- Enhanced Operational Details (check and add only if missing)
DO $$ 
BEGIN
    -- Enhanced Operational Details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='crude_oil_sources') THEN
        ALTER TABLE refineries ADD COLUMN crude_oil_sources TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='processing_units') THEN
        ALTER TABLE refineries ADD COLUMN processing_units TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='storage_capacity') THEN
        ALTER TABLE refineries ADD COLUMN storage_capacity TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='pipeline_connections') THEN
        ALTER TABLE refineries ADD COLUMN pipeline_connections TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='shipping_terminals') THEN
        ALTER TABLE refineries ADD COLUMN shipping_terminals TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='rail_connections') THEN
        ALTER TABLE refineries ADD COLUMN rail_connections TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='environmental_certifications') THEN
        ALTER TABLE refineries ADD COLUMN environmental_certifications TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='safety_record') THEN
        ALTER TABLE refineries ADD COLUMN safety_record TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='workforce_size') THEN
        ALTER TABLE refineries ADD COLUMN workforce_size INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='annual_throughput') THEN
        ALTER TABLE refineries ADD COLUMN annual_throughput TEXT;
    END IF;

    -- Financial & Market Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='investment_cost') THEN
        ALTER TABLE refineries ADD COLUMN investment_cost TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='operating_costs') THEN
        ALTER TABLE refineries ADD COLUMN operating_costs TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='revenue') THEN
        ALTER TABLE refineries ADD COLUMN revenue TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='profit_margin') THEN
        ALTER TABLE refineries ADD COLUMN profit_margin TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='market_share') THEN
        ALTER TABLE refineries ADD COLUMN market_share TEXT;
    END IF;

    -- Technical Specifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='distillation_capacity') THEN
        ALTER TABLE refineries ADD COLUMN distillation_capacity TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='conversion_capacity') THEN
        ALTER TABLE refineries ADD COLUMN conversion_capacity TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='hydrogen_capacity') THEN
        ALTER TABLE refineries ADD COLUMN hydrogen_capacity TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='sulfur_recovery') THEN
        ALTER TABLE refineries ADD COLUMN sulfur_recovery TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='octane_rating') THEN
        ALTER TABLE refineries ADD COLUMN octane_rating TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='diesel_specifications') THEN
        ALTER TABLE refineries ADD COLUMN diesel_specifications TEXT;
    END IF;

    -- Compliance & Regulations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='environmental_compliance') THEN
        ALTER TABLE refineries ADD COLUMN environmental_compliance TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='regulatory_status') THEN
        ALTER TABLE refineries ADD COLUMN regulatory_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='permits_licenses') THEN
        ALTER TABLE refineries ADD COLUMN permits_licenses TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='inspection_schedule') THEN
        ALTER TABLE refineries ADD COLUMN inspection_schedule TEXT;
    END IF;

    -- Strategic Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='expansion_plans') THEN
        ALTER TABLE refineries ADD COLUMN expansion_plans TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='modernization_projects') THEN
        ALTER TABLE refineries ADD COLUMN modernization_projects TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='technology_partnerships') THEN
        ALTER TABLE refineries ADD COLUMN technology_partnerships TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='supply_contracts') THEN
        ALTER TABLE refineries ADD COLUMN supply_contracts TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='distribution_network') THEN
        ALTER TABLE refineries ADD COLUMN distribution_network TEXT;
    END IF;

    -- Performance Metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='efficiency_rating') THEN
        ALTER TABLE refineries ADD COLUMN efficiency_rating TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='energy_consumption') THEN
        ALTER TABLE refineries ADD COLUMN energy_consumption TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='water_usage') THEN
        ALTER TABLE refineries ADD COLUMN water_usage TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='emissions_data') THEN
        ALTER TABLE refineries ADD COLUMN emissions_data TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='downtime_statistics') THEN
        ALTER TABLE refineries ADD COLUMN downtime_statistics TEXT;
    END IF;

    -- Geographic & Infrastructure
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='nearest_port') THEN
        ALTER TABLE refineries ADD COLUMN nearest_port TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='nearest_airport') THEN
        ALTER TABLE refineries ADD COLUMN nearest_airport TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='transportation_links') THEN
        ALTER TABLE refineries ADD COLUMN transportation_links TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='utilities_infrastructure') THEN
        ALTER TABLE refineries ADD COLUMN utilities_infrastructure TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='local_suppliers') THEN
        ALTER TABLE refineries ADD COLUMN local_suppliers TEXT;
    END IF;

    -- Market Position
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='competitive_advantages') THEN
        ALTER TABLE refineries ADD COLUMN competitive_advantages TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='major_customers') THEN
        ALTER TABLE refineries ADD COLUMN major_customers TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='export_markets') THEN
        ALTER TABLE refineries ADD COLUMN export_markets TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='domestic_market_share') THEN
        ALTER TABLE refineries ADD COLUMN domestic_market_share TEXT;
    END IF;

    -- Additional metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='data_source') THEN
        ALTER TABLE refineries ADD COLUMN data_source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='last_verified') THEN
        ALTER TABLE refineries ADD COLUMN last_verified TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='confidence_level') THEN
        ALTER TABLE refineries ADD COLUMN confidence_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='notes') THEN
        ALTER TABLE refineries ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refineries' AND column_name='created_at') THEN
        ALTER TABLE refineries ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

END $$;

-- Add indexes for better performance (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_status') THEN
        CREATE INDEX idx_refineries_status ON refineries(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_region') THEN
        CREATE INDEX idx_refineries_region ON refineries(region);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_capacity') THEN
        CREATE INDEX idx_refineries_capacity ON refineries(capacity);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_country') THEN
        CREATE INDEX idx_refineries_country ON refineries(country);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_last_updated') THEN
        CREATE INDEX idx_refineries_last_updated ON refineries(last_updated);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refineries_created_at') THEN
        CREATE INDEX idx_refineries_created_at ON refineries(created_at);
    END IF;
END $$;

-- Update existing refineries with default values where appropriate
UPDATE refineries SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;