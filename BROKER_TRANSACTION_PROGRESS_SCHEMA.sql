-- CIF-ASWP Transaction Progress System Database Schema
-- Run this in your Supabase SQL editor

-- Create transaction steps table
CREATE TABLE IF NOT EXISTS transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, refused, cancelled, completed
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction documents table
CREATE TABLE IF NOT EXISTS transaction_documents (
    id SERIAL PRIMARY KEY,
    step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- ICPO, passport_copy, bank_instrument, etc.
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deal messages table for admin-broker communication
CREATE TABLE IF NOT EXISTS deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deal message attachments table
CREATE TABLE IF NOT EXISTS deal_message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES deal_messages(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update broker_deals table to include transaction progress
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP';
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS overall_progress DECIMAL(5,2) DEFAULT 0.00;

-- Insert default transaction steps for CIF-ASWP
INSERT INTO transaction_steps (deal_id, step_number, step_name, step_description, status) 
SELECT 
    bd.id,
    steps.step_number,
    steps.step_name,
    steps.step_description,
    'pending'
FROM broker_deals bd
CROSS JOIN (
    VALUES 
    (1, 'Buyer Issues PO', 'Purchase Order issuance by buyer'),
    (2, 'ICPO', 'Irrevocable Corporate Purchase Order submission'),
    (3, 'Contract Under Review', 'Contract review and validation process'),
    (4, 'PPOP Sent', 'Past Performance of Product documentation'),
    (5, 'Buyer Issues Bank Instrument', 'Bank instrument issuance by buyer'),
    (6, 'Waiting for Bank Instrument', 'Awaiting bank instrument confirmation'),
    (7, 'POP + 2% PB', 'Proof of Product with 2% Performance Bond'),
    (8, 'Commission', 'Commission payment and transaction completion')
) AS steps(step_number, step_name, step_description)
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_steps ts 
    WHERE ts.deal_id = bd.id AND ts.step_number = steps.step_number
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_sender_receiver ON deal_messages(sender_id, receiver_id);