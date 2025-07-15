-- Complete Database Schema Fix for Broker Transaction Documents System
-- This script will create and update all necessary tables for the broker document tracking system

-- 1. Create transaction_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS transaction_documents (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add missing columns to transaction_documents table
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);

-- 3. Create transaction_steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    step_description TEXT,
    required_documents TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    admin_notes TEXT,
    admin_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_step_number ON transaction_steps(step_number);

-- 5. Create deal_messages table if it doesn't exist (for messaging system)
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create broker_documents table if it doesn't exist (for general broker documents)
CREATE TABLE IF NOT EXISTS broker_documents (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Insert default transaction steps for CIF-ASWP process if they don't exist
INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    1,
    'Letter of Intent (LOI)',
    'Submit Letter of Intent with buyer/seller details and cargo specifications',
    ARRAY['LOI Document', 'Company Registration', 'Authorization Letter']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 1
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    2,
    'Freight Letter (FL)',
    'Submit Freight Letter with vessel details and shipping terms',
    ARRAY['Freight Letter', 'Vessel Specifications', 'Charter Party Terms']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 2
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    3,
    'Commercial Invoice',
    'Submit Commercial Invoice with detailed cargo and pricing information',
    ARRAY['Commercial Invoice', 'Packing List', 'Quality Certificate']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 3
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    4,
    'Bill of Lading (B/L)',
    'Submit Bill of Lading and shipping documentation',
    ARRAY['Bill of Lading', 'Mate Receipt', 'Shipping Instructions']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 4
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    5,
    'Insurance Certificate',
    'Submit Marine Insurance Certificate and coverage details',
    ARRAY['Insurance Certificate', 'Policy Schedule', 'Premium Receipt']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 5
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    6,
    'Certificate of Origin',
    'Submit Certificate of Origin and customs documentation',
    ARRAY['Certificate of Origin', 'Customs Declaration', 'Export License']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 6
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    7,
    'Quality & Inspection',
    'Submit Quality Inspection Report and Analysis Certificate',
    ARRAY['Quality Report', 'Inspection Certificate', 'Lab Analysis']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 7
);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    8,
    'Final Settlement',
    'Submit Final Settlement Documentation and Payment Confirmation',
    ARRAY['Settlement Statement', 'Payment Confirmation', 'Delivery Receipt']
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 8
);

-- 8. Create indexes for messaging system
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_sender_id ON deal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_receiver_id ON deal_messages(receiver_id);

-- 9. Create indexes for broker documents
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);

-- 10. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transaction_documents_updated_at BEFORE UPDATE ON transaction_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_steps_updated_at BEFORE UPDATE ON transaction_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_broker_documents_updated_at BEFORE UPDATE ON broker_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification queries to check if everything is working
SELECT 'transaction_documents table created' as status;
SELECT 'transaction_steps table created' as status;
SELECT 'deal_messages table created' as status;
SELECT 'broker_documents table created' as status;
SELECT 'All indexes created' as status;
SELECT 'Default transaction steps inserted' as status;

-- Show counts
SELECT COUNT(*) as transaction_steps_count FROM transaction_steps;
SELECT COUNT(*) as broker_deals_count FROM broker_deals;
SELECT COUNT(*) as deal_messages_count FROM deal_messages;
SELECT COUNT(*) as transaction_documents_count FROM transaction_documents;