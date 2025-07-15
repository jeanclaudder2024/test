-- FINAL DATABASE FIX for Broker Transaction System
-- This will ensure all columns exist and work correctly

-- 1. Ensure transaction_documents table has all required columns
ALTER TABLE transaction_documents 
ADD COLUMN IF NOT EXISTS document_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Ensure transaction_steps table has notes column
ALTER TABLE transaction_steps 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Update existing transaction_steps to ensure all deals have steps
INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 1, 'Letter of Intent (LOI)', 'Submit Letter of Intent with buyer/seller details', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 1);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 2, 'Freight Letter (FL)', 'Submit Freight Letter with vessel details', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 2);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 3, 'Commercial Invoice', 'Submit Commercial Invoice with cargo details', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 3);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 4, 'Bill of Lading (B/L)', 'Submit Bill of Lading documentation', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 4);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 5, 'Insurance Certificate', 'Submit Marine Insurance Certificate', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 5);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 6, 'Certificate of Origin', 'Submit Certificate of Origin', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 6);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 7, 'Quality & Inspection', 'Submit Quality Inspection Report', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 7);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status)
SELECT bd.id, 8, 'Final Settlement', 'Submit Final Settlement Documentation', 'pending'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 8);

-- 4. Create sample transaction documents to test (Optional - for testing)
-- INSERT INTO transaction_documents (step_id, document_name, file_path, file_type, uploaded_by, created_at)
-- SELECT ts.id, 'Sample Document', '/uploads/sample.pdf', 'application/pdf', 33, CURRENT_TIMESTAMP
-- FROM transaction_steps ts 
-- WHERE ts.step_number = 1 
-- LIMIT 1;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_step_number ON transaction_steps(step_number);

-- 6. Verification - Check what we have
SELECT 'Transaction Steps Created' as status, COUNT(*) as count FROM transaction_steps;
SELECT 'Transaction Documents' as status, COUNT(*) as count FROM transaction_documents;
SELECT 'Broker Deals' as status, COUNT(*) as count FROM broker_deals;

-- 7. Show table structure
SELECT 'transaction_documents columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transaction_documents';

SELECT 'transaction_steps columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transaction_steps';