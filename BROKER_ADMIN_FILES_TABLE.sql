-- Create broker admin files table for admin-to-broker file sharing
DROP TABLE IF EXISTS broker_admin_files CASCADE;

CREATE TABLE broker_admin_files (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    sent_date TIMESTAMP DEFAULT NOW(),
    sent_by VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test the table creation
SELECT 'broker_admin_files table created successfully' as status;