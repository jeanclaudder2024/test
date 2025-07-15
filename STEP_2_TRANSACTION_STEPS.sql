-- ===================================================
-- STEP 2: Create transaction_steps table
-- ===================================================
-- Only run this AFTER Step 1 is successful
-- ===================================================

CREATE TABLE transaction_steps (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);