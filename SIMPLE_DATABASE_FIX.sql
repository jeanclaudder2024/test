-- SIMPLE DATABASE FIX - Works with existing schema
-- Run this in your Supabase SQL Editor

-- 1. Add missing columns to transaction_documents table
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);

-- 2. Create transaction_steps table without required_documents column
CREATE TABLE IF NOT EXISTS transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    step_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    admin_notes TEXT,
    admin_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create deal_messages table
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert 8 transaction steps for existing deals (without required_documents)
INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    1,
    'Letter of Intent (LOI)',
    'Submit Letter of Intent with buyer/seller details and cargo specifications'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 1);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    2,
    'Freight Letter (FL)',
    'Submit Freight Letter with vessel details and shipping terms'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 2);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    3,
    'Commercial Invoice',
    'Submit Commercial Invoice with detailed cargo and pricing information'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 3);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    4,
    'Bill of Lading (B/L)',
    'Submit Bill of Lading and shipping documentation'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 4);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    5,
    'Insurance Certificate',
    'Submit Marine Insurance Certificate and coverage details'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 5);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    6,
    'Certificate of Origin',
    'Submit Certificate of Origin and customs documentation'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 6);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    7,
    'Quality & Inspection',
    'Submit Quality Inspection Report and Analysis Certificate'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 7);

INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description)
SELECT 
    bd.id,
    8,
    'Final Settlement',
    'Submit Final Settlement Documentation and Payment Confirmation'
FROM broker_deals bd
WHERE NOT EXISTS (SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id AND ts.step_number = 8);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);

-- 6. Verify the setup
SELECT 'Database setup complete' as status;
SELECT COUNT(*) as total_steps_created FROM transaction_steps;
SELECT COUNT(*) as total_deals FROM broker_deals;
SELECT COUNT(*) as total_messages FROM deal_messages;
SELECT COUNT(*) as total_documents FROM transaction_documents;