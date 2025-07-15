-- Add missing columns to broker_deals table
ALTER TABLE broker_deals 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8),
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
ADD COLUMN IF NOT EXISTS buyer_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS contract_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS transaction_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'medium';

-- Add comments for clarity
COMMENT ON COLUMN broker_deals.current_step IS 'Current step in the 8-step CIF-ASWP transaction process (1-8)';
COMMENT ON COLUMN broker_deals.transaction_type IS 'Type of transaction (CIF-ASWP, FOB, etc.)';
COMMENT ON COLUMN broker_deals.contract_value IS 'Total contract value in USD';
COMMENT ON COLUMN broker_deals.commission_rate IS 'Commission rate percentage';

-- Update existing deals to have default values
UPDATE broker_deals 
SET current_step = 1,
    transaction_type = 'CIF-ASWP',
    transaction_status = 'pending',
    priority_level = 'medium',
    commission_rate = 2.00
WHERE current_step IS NULL;