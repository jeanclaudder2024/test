-- COMPLETE BROKER DEALS TABLE SCHEMA FIX
-- This script adds ALL missing columns to make broker deals work properly

-- Add ALL missing columns to broker_deals table
ALTER TABLE broker_deals 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8),
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
ADD COLUMN IF NOT EXISTS buyer_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS contract_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS transaction_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS overall_progress INTEGER DEFAULT 0 CHECK (overall_progress BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low',
ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(30) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS assigned_admin_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS deal_source VARCHAR(50) DEFAULT 'broker_portal',
ADD COLUMN IF NOT EXISTS geographic_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS vessel_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS cargo_specifications TEXT,
ADD COLUMN IF NOT EXISTS delivery_terms VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_details TEXT,
ADD COLUMN IF NOT EXISTS special_conditions TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS client_communication_log TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_current_step ON broker_deals(current_step);
CREATE INDEX IF NOT EXISTS idx_broker_deals_transaction_status ON broker_deals(transaction_status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_priority_level ON broker_deals(priority_level);
CREATE INDEX IF NOT EXISTS idx_broker_deals_assigned_admin ON broker_deals(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_last_activity ON broker_deals(last_activity_date);

-- Add comments for clarity
COMMENT ON COLUMN broker_deals.current_step IS 'Current step in the 8-step CIF-ASWP transaction process (1-8)';
COMMENT ON COLUMN broker_deals.transaction_type IS 'Type of transaction (CIF-ASWP, FOB, etc.)';
COMMENT ON COLUMN broker_deals.contract_value IS 'Total contract value in USD';
COMMENT ON COLUMN broker_deals.commission_rate IS 'Commission rate percentage';
COMMENT ON COLUMN broker_deals.overall_progress IS 'Overall deal progress percentage (0-100)';
COMMENT ON COLUMN broker_deals.risk_level IS 'Risk assessment level (low, medium, high)';
COMMENT ON COLUMN broker_deals.compliance_status IS 'Regulatory compliance status';

-- Update existing deals to have default values
UPDATE broker_deals 
SET current_step = COALESCE(current_step, 1),
    transaction_type = COALESCE(transaction_type, 'CIF-ASWP'),
    transaction_status = COALESCE(transaction_status, 'pending'),
    priority_level = COALESCE(priority_level, 'medium'),
    commission_rate = COALESCE(commission_rate, 2.00),
    overall_progress = COALESCE(overall_progress, 0),
    risk_level = COALESCE(risk_level, 'low'),
    compliance_status = COALESCE(compliance_status, 'pending'),
    document_count = COALESCE(document_count, 0),
    last_activity_date = COALESCE(last_activity_date, CURRENT_TIMESTAMP),
    deal_source = COALESCE(deal_source, 'broker_portal')
WHERE current_step IS NULL OR transaction_type IS NULL OR overall_progress IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'broker_deals' 
ORDER BY ordinal_position;