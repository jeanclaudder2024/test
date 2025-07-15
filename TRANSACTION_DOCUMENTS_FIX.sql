-- Transaction Documents Table Fix
-- This will ensure the transaction_documents table has all required columns

-- Add missing columns to transaction_documents table
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);

-- Verify structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transaction_documents' 
ORDER BY ordinal_position;