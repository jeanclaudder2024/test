-- Manual creation of broker_admin_files table
-- Run this in your Supabase SQL Editor to create the missing table

-- First, drop the table if it exists to avoid conflicts
DROP TABLE IF EXISTS broker_admin_files CASCADE;

-- Create the broker_admin_files table with proper structure
CREATE TABLE broker_admin_files (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  sent_by TEXT NOT NULL,
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  broker_id INTEGER NOT NULL REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_broker_admin_files_broker_id ON broker_admin_files(broker_id);
CREATE INDEX idx_broker_admin_files_sent_date ON broker_admin_files(sent_date);
CREATE INDEX idx_broker_admin_files_category ON broker_admin_files(category);

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'broker_admin_files' 
ORDER BY ordinal_position;