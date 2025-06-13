-- Fix Documents Table Structure  
-- Run this in your Supabase SQL Editor

-- First check if documents table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';

-- Drop and recreate the documents table with correct structure
DROP TABLE IF EXISTS documents CASCADE;

-- Create the documents table with all required columns including is_active
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT DEFAULT 'general',
  tags TEXT,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON documents(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Insert sample documents to test the system
INSERT INTO documents (title, description, content, document_type, status, category, is_template, is_active) 
VALUES 
(
  'Maritime Safety Certificate',
  'Standard safety certificate for maritime vessels',
  'This document certifies that the vessel meets all international maritime safety standards and regulations according to SOLAS (Safety of Life at Sea) convention requirements.',
  'Certificate',
  'active',
  'safety',
  true,
  true
),
(
  'Cargo Manifest Template',
  'Template for cargo manifest documentation',
  'Standard template for documenting cargo details including weights, destinations, hazardous materials classification, and stowage requirements for maritime transportation.',
  'Manifest',
  'active',
  'cargo',
  true,
  true
),
(
  'Port Authority Clearance',
  'Template for port authority clearance documents',
  'Documentation required for vessels to obtain clearance from port authorities before departure, including customs declarations and security certificates.',
  'Clearance',
  'active',
  'regulatory',
  true,
  true
),
(
  'Bill of Lading Template',
  'Standard bill of lading for cargo shipments',
  'Legal document between shipper and carrier detailing the type, quantity and destination of goods being carried, serving as receipt and contract.',
  'Bill of Lading',
  'active',
  'commercial',
  true,
  true
),
(
  'Vessel Inspection Report',
  'Template for vessel condition inspection',
  'Comprehensive inspection report covering hull condition, machinery status, safety equipment verification, and compliance with maritime regulations.',
  'Inspection',
  'active',
  'regulatory',
  true,
  true
);

-- Verify the table was created successfully with all columns
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Quick test to verify is_active column works
SELECT id, title, is_active, status FROM documents LIMIT 3;