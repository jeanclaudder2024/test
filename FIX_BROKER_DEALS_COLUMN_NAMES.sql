-- Fix Broker Deals Column Name Mismatch
-- This script fixes the column naming mismatch between the database and schema

-- Check if the broker_deals table exists
DO $$ 
BEGIN
    -- Try to add the missing columns if they don't exist
    
    -- Add deal_status column (aliased to status)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'deal_status') THEN
        ALTER TABLE broker_deals ADD COLUMN deal_status VARCHAR(50) DEFAULT 'draft';
        
        -- Copy data from status column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'status') THEN
            UPDATE broker_deals SET deal_status = status;
        END IF;
    END IF;
    
    -- Ensure all required columns exist in broker_deals table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'status') THEN
        ALTER TABLE broker_deals ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'priority') THEN
        ALTER TABLE broker_deals ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'progress_percentage') THEN
        ALTER TABLE broker_deals ADD COLUMN progress_percentage INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'current_step') THEN
        ALTER TABLE broker_deals ADD COLUMN current_step INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'overall_progress') THEN
        ALTER TABLE broker_deals ADD COLUMN overall_progress DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'transaction_type') THEN
        ALTER TABLE broker_deals ADD COLUMN transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'quantity_unit') THEN
        ALTER TABLE broker_deals ADD COLUMN quantity_unit VARCHAR(20) DEFAULT 'MT';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'currency') THEN
        ALTER TABLE broker_deals ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'commission_rate') THEN
        ALTER TABLE broker_deals ADD COLUMN commission_rate DECIMAL(5,4) DEFAULT 0.0150;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'commission_amount') THEN
        ALTER TABLE broker_deals ADD COLUMN commission_amount DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'completion_date') THEN
        ALTER TABLE broker_deals ADD COLUMN completion_date TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'notes') THEN
        ALTER TABLE broker_deals ADD COLUMN notes TEXT;
    END IF;
    
    -- Add departure_date and arrival_date if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'departure_date') THEN
        ALTER TABLE broker_deals ADD COLUMN departure_date TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'broker_deals' AND column_name = 'arrival_date') THEN
        ALTER TABLE broker_deals ADD COLUMN arrival_date TIMESTAMP;
    END IF;
    
END $$;

-- Update any existing deal_status values to match status
UPDATE broker_deals SET deal_status = status WHERE deal_status IS NULL AND status IS NOT NULL;
UPDATE broker_deals SET status = deal_status WHERE status IS NULL AND deal_status IS NOT NULL;

-- Check the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'broker_deals'
ORDER BY ordinal_position;