-- Enhanced Refinery Management Database Columns
-- Add these columns to the refineries table to support advanced dashboard features

-- Enhanced Operational Details
ALTER TABLE refineries ADD COLUMN crude_oil_sources TEXT;
ALTER TABLE refineries ADD COLUMN processing_units TEXT;
ALTER TABLE refineries ADD COLUMN storage_capacity TEXT;
ALTER TABLE refineries ADD COLUMN pipeline_connections TEXT;
ALTER TABLE refineries ADD COLUMN shipping_terminals TEXT;
ALTER TABLE refineries ADD COLUMN rail_connections TEXT;
ALTER TABLE refineries ADD COLUMN environmental_certifications TEXT;
ALTER TABLE refineries ADD COLUMN safety_record TEXT;
ALTER TABLE refineries ADD COLUMN workforce_size INTEGER;
ALTER TABLE refineries ADD COLUMN annual_throughput TEXT;

-- Financial & Market Information
ALTER TABLE refineries ADD COLUMN investment_cost TEXT;
ALTER TABLE refineries ADD COLUMN operating_costs TEXT;
ALTER TABLE refineries ADD COLUMN revenue TEXT;
ALTER TABLE refineries ADD COLUMN profit_margin TEXT;
ALTER TABLE refineries ADD COLUMN market_share TEXT;

-- Technical Specifications
ALTER TABLE refineries ADD COLUMN distillation_capacity TEXT;
ALTER TABLE refineries ADD COLUMN conversion_capacity TEXT;
ALTER TABLE refineries ADD COLUMN hydrogen_capacity TEXT;
ALTER TABLE refineries ADD COLUMN sulfur_recovery TEXT;
ALTER TABLE refineries ADD COLUMN octane_rating TEXT;
ALTER TABLE refineries ADD COLUMN diesel_specifications TEXT;

-- Compliance & Regulations
ALTER TABLE refineries ADD COLUMN environmental_compliance TEXT;
ALTER TABLE refineries ADD COLUMN regulatory_status TEXT;
ALTER TABLE refineries ADD COLUMN permits_licenses TEXT;
ALTER TABLE refineries ADD COLUMN inspection_schedule TEXT;

-- Strategic Information
ALTER TABLE refineries ADD COLUMN expansion_plans TEXT;
ALTER TABLE refineries ADD COLUMN modernization_projects TEXT;
ALTER TABLE refineries ADD COLUMN technology_partnerships TEXT;
ALTER TABLE refineries ADD COLUMN supply_contracts TEXT;
ALTER TABLE refineries ADD COLUMN distribution_network TEXT;

-- Performance Metrics
ALTER TABLE refineries ADD COLUMN efficiency_rating TEXT;
ALTER TABLE refineries ADD COLUMN energy_consumption TEXT;
ALTER TABLE refineries ADD COLUMN water_usage TEXT;
ALTER TABLE refineries ADD COLUMN emissions_data TEXT;
ALTER TABLE refineries ADD COLUMN downtime_statistics TEXT;

-- Geographic & Infrastructure
ALTER TABLE refineries ADD COLUMN nearest_port TEXT;
ALTER TABLE refineries ADD COLUMN nearest_airport TEXT;
ALTER TABLE refineries ADD COLUMN transportation_links TEXT;
ALTER TABLE refineries ADD COLUMN utilities_infrastructure TEXT;
ALTER TABLE refineries ADD COLUMN local_suppliers TEXT;

-- Market Position
ALTER TABLE refineries ADD COLUMN competitive_advantages TEXT;
ALTER TABLE refineries ADD COLUMN major_customers TEXT;
ALTER TABLE refineries ADD COLUMN export_markets TEXT;
ALTER TABLE refineries ADD COLUMN domestic_market_share TEXT;

-- Additional metadata
ALTER TABLE refineries ADD COLUMN data_source TEXT;
ALTER TABLE refineries ADD COLUMN last_verified TIMESTAMP;
ALTER TABLE refineries ADD COLUMN confidence_level TEXT;
ALTER TABLE refineries ADD COLUMN notes TEXT;
ALTER TABLE refineries ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX idx_refineries_status ON refineries(status);
CREATE INDEX idx_refineries_region ON refineries(region);
CREATE INDEX idx_refineries_capacity ON refineries(capacity);
CREATE INDEX idx_refineries_country ON refineries(country);
CREATE INDEX idx_refineries_last_updated ON refineries(last_updated);
CREATE INDEX idx_refineries_created_at ON refineries(created_at);

-- Update existing refineries with default values where appropriate
UPDATE refineries SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;