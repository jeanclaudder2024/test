-- Recreate admin_documents table without is_active column
-- Run this in your Supabase SQL Editor

-- Drop the existing table
DROP TABLE IF EXISTS admin_documents CASCADE;

-- Recreate the table with correct structure
CREATE TABLE admin_documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT DEFAULT 'general',
  tags TEXT,
  is_template BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_category ON admin_documents(category);

-- Insert a sample document to test
INSERT INTO admin_documents (title, description, content, document_type, status, category, is_template) 
VALUES (
  'Sample Maritime Document',
  'Test document for system verification',
  'This is a sample document to verify the Document Management system is working correctly.',
  'Certificate',
  'active',
  'general',
  false
);