-- COMPLETE BROKER DOCUMENTS DATABASE FIX
-- This will create all missing tables and columns for the broker dashboard

-- 1. CREATE BROKER DOCUMENTS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS broker_documents (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    deal_id INTEGER,
    
    -- Document information
    document_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    original_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500),
    
    -- Document metadata
    description TEXT,
    uploaded_by INTEGER,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADD MISSING COLUMNS TO BROKER DOCUMENTS (if they don't exist)
DO $$ 
BEGIN
    -- Add document_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'document_name') THEN
        ALTER TABLE broker_documents ADD COLUMN document_name VARCHAR(255) NOT NULL DEFAULT 'Document';
    END IF;
    
    -- Add file_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'file_name') THEN
        ALTER TABLE broker_documents ADD COLUMN file_name VARCHAR(255);
    END IF;
    
    -- Add original_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'original_name') THEN
        ALTER TABLE broker_documents ADD COLUMN original_name VARCHAR(255);
    END IF;
    
    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'file_type') THEN
        ALTER TABLE broker_documents ADD COLUMN file_type VARCHAR(100);
    END IF;
    
    -- Add file_size column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'file_size') THEN
        ALTER TABLE broker_documents ADD COLUMN file_size INTEGER;
    END IF;
    
    -- Add file_path column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'file_path') THEN
        ALTER TABLE broker_documents ADD COLUMN file_path VARCHAR(500);
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'description') THEN
        ALTER TABLE broker_documents ADD COLUMN description TEXT;
    END IF;
    
    -- Add uploaded_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'uploaded_by') THEN
        ALTER TABLE broker_documents ADD COLUMN uploaded_by INTEGER;
    END IF;
    
    -- Add download_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'download_count') THEN
        ALTER TABLE broker_documents ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'is_public') THEN
        ALTER TABLE broker_documents ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broker_documents' AND column_name = 'tags') THEN
        ALTER TABLE broker_documents ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- 3. ENSURE TRANSACTION DOCUMENTS TABLE HAS ALL REQUIRED COLUMNS
CREATE TABLE IF NOT EXISTS transaction_documents (
    id SERIAL PRIMARY KEY,
    step_id INTEGER,
    deal_id INTEGER,
    document_name VARCHAR(255),
    file_name VARCHAR(255),
    original_name VARCHAR(255), 
    original_filename VARCHAR(255),
    stored_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    document_type VARCHAR(100),
    uploaded_by INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ADD MISSING COLUMNS TO TRANSACTION DOCUMENTS
DO $$ 
BEGIN
    -- Add document_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'document_name') THEN
        ALTER TABLE transaction_documents ADD COLUMN document_name VARCHAR(255);
    END IF;
    
    -- Add file_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'file_name') THEN
        ALTER TABLE transaction_documents ADD COLUMN file_name VARCHAR(255);
    END IF;
    
    -- Add original_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'original_name') THEN
        ALTER TABLE transaction_documents ADD COLUMN original_name VARCHAR(255);
    END IF;
    
    -- Add original_filename column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'original_filename') THEN
        ALTER TABLE transaction_documents ADD COLUMN original_filename VARCHAR(255);
    END IF;
    
    -- Add stored_filename column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'stored_filename') THEN
        ALTER TABLE transaction_documents ADD COLUMN stored_filename VARCHAR(255);
    END IF;
    
    -- Add document_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'document_type') THEN
        ALTER TABLE transaction_documents ADD COLUMN document_type VARCHAR(100);
    END IF;
    
    -- Add mime_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'mime_type') THEN
        ALTER TABLE transaction_documents ADD COLUMN mime_type VARCHAR(100);
    END IF;
    
    -- Add uploaded_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_documents' AND column_name = 'uploaded_at') THEN
        ALTER TABLE transaction_documents ADD COLUMN uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);

-- 6. INSERT SAMPLE DATA TO ENSURE TABLES WORK
INSERT INTO broker_documents (broker_id, deal_id, document_name, file_name, original_name, file_type, file_size, file_path, description)
VALUES 
(33, 1, 'Sample Contract Document', 'contract_001.pdf', 'Original_Contract.pdf', 'application/pdf', 2048000, '/uploads/contracts/contract_001.pdf', 'Sample contract document for testing')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Broker documents database schema fixed successfully!' as message;