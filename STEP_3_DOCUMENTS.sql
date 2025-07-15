-- ===================================================
-- STEP 3: Create transaction_documents table
-- ===================================================
-- Only run this AFTER Steps 1 and 2 are successful
-- ===================================================

CREATE TABLE transaction_documents (
    id SERIAL PRIMARY KEY,
    step_id INTEGER NOT NULL,
    deal_id INTEGER NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);