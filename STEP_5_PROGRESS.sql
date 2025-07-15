-- ===================================================
-- STEP 5: Create deal_progress_tracking table
-- ===================================================
-- Only run this AFTER Steps 1, 2, 3, and 4 are successful
-- ===================================================

CREATE TABLE deal_progress_tracking (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    assigned_to INTEGER,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);