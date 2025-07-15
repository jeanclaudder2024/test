-- ===================================================
-- STEP 4: Create deal_messages table
-- ===================================================
-- Only run this AFTER Steps 1, 2, and 3 are successful
-- ===================================================

CREATE TABLE deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER,
    message_type VARCHAR(50) DEFAULT 'general',
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW()
);