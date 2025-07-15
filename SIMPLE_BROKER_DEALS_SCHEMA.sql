-- ===================================================
-- SIMPLE BROKER DEALS SCHEMA FOR SUPABASE
-- ===================================================
-- Copy and paste this step by step into Supabase SQL Editor
-- ===================================================

-- STEP 1: Create broker_deals table first (without foreign keys that might not exist)
CREATE TABLE IF NOT EXISTS broker_deals (
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

-- STEP 2: Create transaction_steps table
CREATE TABLE IF NOT EXISTS transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 3: Create transaction_documents table
CREATE TABLE IF NOT EXISTS transaction_documents (
    id SERIAL PRIMARY KEY,
    step_id INTEGER NOT NULL,
    deal_id INTEGER NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- STEP 4: Create deal_messages table
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER,
    message_type VARCHAR(50) DEFAULT 'general',
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- STEP 5: Create deal_progress_tracking table
CREATE TABLE IF NOT EXISTS deal_progress_tracking (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    assigned_to INTEGER,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_created_at ON broker_deals(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_progress_tracking_deal_id ON deal_progress_tracking(deal_id);

-- ===================================================
-- TABLES CREATED SUCCESSFULLY!
-- ===================================================
-- All broker deals tables are now ready.
-- The foreign key constraints are handled by the application.
-- You can now test creating broker deals.
-- ===================================================