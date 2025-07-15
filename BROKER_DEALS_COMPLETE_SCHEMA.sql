-- ===================================================
-- COMPLETE BROKER DEALS DATABASE SCHEMA FOR SUPABASE
-- ===================================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ===================================================

-- 1. CREATE BROKER_DEALS TABLE
CREATE TABLE IF NOT EXISTS broker_deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_company_id INTEGER,
    buyer_company_id INTEGER,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
    
    deal_title VARCHAR(255) NOT NULL,
    deal_description TEXT,
    cargo_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'MT',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
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

-- 2. CREATE TRANSACTION_STEPS TABLE
CREATE TABLE IF NOT EXISTS transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CREATE TRANSACTION_DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS transaction_documents (
    id SERIAL PRIMARY KEY,
    step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREATE DEAL_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    message_type VARCHAR(50) DEFAULT 'general',
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- 5. CREATE DEAL_PROGRESS_TRACKING TABLE  
CREATE TABLE IF NOT EXISTS deal_progress_tracking (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    assigned_to INTEGER REFERENCES users(id),
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. ADD INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_created_at ON broker_deals(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_progress_tracking_deal_id ON deal_progress_tracking(deal_id);

-- ===================================================
-- SCHEMA SETUP COMPLETE!
-- ===================================================
-- The tables are now ready for the broker deals system.
-- Transaction steps will be created automatically by the application.
-- 
-- 8-Step CIF-ASWP Transaction Process:
-- 1. Initial Documentation
-- 2. Letter of Intent (LOI)
-- 3. Full Corporate Offer (FCO)
-- 4. Signed Contract
-- 5. Payment Terms Setup
-- 6. Cargo Loading Documentation
-- 7. Shipping Documentation
-- 8. Final Settlement
-- ===================================================