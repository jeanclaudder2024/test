-- QUICK DATABASE FIX for Broker Transaction Documents
-- Run this in your Supabase SQL Editor to fix the immediate issues

-- 1. Add missing columns to transaction_documents table
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE transaction_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);

-- 2. Create transaction_steps table if missing
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

-- 3. Create deal_messages table if missing
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert default 8 transaction steps for existing deals
INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, required_documents)
SELECT 
    bd.id,
    generate_series(1, 8),
    CASE generate_series(1, 8)
        WHEN 1 THEN 'Letter of Intent (LOI)'
        WHEN 2 THEN 'Freight Letter (FL)'
        WHEN 3 THEN 'Commercial Invoice'
        WHEN 4 THEN 'Bill of Lading (B/L)'
        WHEN 5 THEN 'Insurance Certificate'
        WHEN 6 THEN 'Certificate of Origin'
        WHEN 7 THEN 'Quality & Inspection'
        WHEN 8 THEN 'Final Settlement'
    END,
    CASE generate_series(1, 8)
        WHEN 1 THEN 'Submit Letter of Intent with buyer/seller details and cargo specifications'
        WHEN 2 THEN 'Submit Freight Letter with vessel details and shipping terms'
        WHEN 3 THEN 'Submit Commercial Invoice with detailed cargo and pricing information'
        WHEN 4 THEN 'Submit Bill of Lading and shipping documentation'
        WHEN 5 THEN 'Submit Marine Insurance Certificate and coverage details'
        WHEN 6 THEN 'Submit Certificate of Origin and customs documentation'
        WHEN 7 THEN 'Submit Quality Inspection Report and Analysis Certificate'
        WHEN 8 THEN 'Submit Final Settlement Documentation and Payment Confirmation'
    END,
    CASE generate_series(1, 8)
        WHEN 1 THEN ARRAY['LOI Document', 'Company Registration', 'Authorization Letter']
        WHEN 2 THEN ARRAY['Freight Letter', 'Vessel Specifications', 'Charter Party Terms']
        WHEN 3 THEN ARRAY['Commercial Invoice', 'Packing List', 'Quality Certificate']
        WHEN 4 THEN ARRAY['Bill of Lading', 'Mate Receipt', 'Shipping Instructions']
        WHEN 5 THEN ARRAY['Insurance Certificate', 'Policy Schedule', 'Premium Receipt']
        WHEN 6 THEN ARRAY['Certificate of Origin', 'Customs Declaration', 'Export License']
        WHEN 7 THEN ARRAY['Quality Report', 'Inspection Certificate', 'Lab Analysis']
        WHEN 8 THEN ARRAY['Settlement Statement', 'Payment Confirmation', 'Delivery Receipt']
    END
FROM broker_deals bd
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts WHERE ts.deal_id = bd.id
);

-- 5. Verify the fix
SELECT 'Database fixed successfully' as status;
SELECT COUNT(*) as transaction_steps_created FROM transaction_steps;
SELECT COUNT(*) as broker_deals_total FROM broker_deals;