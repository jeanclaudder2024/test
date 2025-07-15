-- ===================================================
-- STEP BY STEP BROKER DEALS SCHEMA
-- ===================================================
-- Copy each step separately into Supabase SQL Editor
-- Run them ONE BY ONE in order
-- ===================================================

-- STEP 1: Create broker_deals table (run this first)
CREATE TABLE broker_deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    seller_company_id INTEGER,
    buyer_company_id INTEGER,
    vessel_id INTEGER,
    
    deal_title VARCHAR(255) NOT NULL DEFAULT 'New Deal',
    deal_description TEXT,
    cargo_type VARCHAR(100) NOT NULL DEFAULT 'Oil',
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    quantity_unit VARCHAR(20) DEFAULT 'MT',
    price_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'medium',
    commission_rate DECIMAL(5, 4) DEFAULT 0.0150,
    commission_amount DECIMAL(12, 2),
    
    origin_port VARCHAR(255),
    destination_port VARCHAR(255),
    departure_date TIMESTAMP,
    arrival_date TIMESTAMP,
    
    progress_percentage INTEGER DEFAULT 0,
    completion_date TIMESTAMP,
    current_step INTEGER DEFAULT 1,
    transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
    overall_progress DECIMAL(5, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- ===================================================
-- PAUSE HERE - Make sure the above worked before continuing
-- ===================================================