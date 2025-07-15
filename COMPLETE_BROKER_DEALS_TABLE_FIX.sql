-- Complete broker_deals table creation with all necessary columns
-- Run this in your Supabase SQL editor to ensure all columns exist

-- Drop the table if it exists and recreate it properly
DROP TABLE IF EXISTS broker_deals CASCADE;

-- Create the complete broker_deals table with all required columns
CREATE TABLE broker_deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_company_id INTEGER,
    buyer_company_id INTEGER,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
    
    -- Deal basic information
    deal_title VARCHAR(255) NOT NULL,
    deal_description TEXT,
    cargo_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'MT',
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Deal status and timeline
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    commission_rate DECIMAL(5,4) DEFAULT 0.0150,
    commission_amount DECIMAL(12,2),
    
    -- Location information
    origin_port VARCHAR(255),
    destination_port VARCHAR(255),
    departure_date TIMESTAMP,
    arrival_date TIMESTAMP,
    
    -- Deal progress tracking
    progress_percentage INTEGER DEFAULT 0,
    completion_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_vessel_id ON broker_deals(vessel_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_created_at ON broker_deals(created_at);

-- Insert a test record to verify the table works
INSERT INTO broker_deals (
    broker_id, 
    deal_title, 
    deal_description, 
    cargo_type, 
    quantity, 
    price_per_unit, 
    total_value, 
    status, 
    origin_port, 
    destination_port,
    departure_date,
    arrival_date,
    notes
) VALUES (
    33, -- Replace with your broker user ID
    'Test Deal - Crude Oil',
    'Test maritime deal for oil transport',
    'Crude Oil',
    50000.00,
    75.00,
    3750000.00,
    'pending',
    'Port of Houston',
    'Port of Rotterdam',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    'Test deal created to verify table structure'
);

-- Check if the record was inserted successfully
SELECT * FROM broker_deals ORDER BY created_at DESC LIMIT 1;