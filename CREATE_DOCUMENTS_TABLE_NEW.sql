-- Create Documents Table for Admin Document Management with Vessel Association
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  vessel_id INTEGER REFERENCES vessels(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_vessel_id ON documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Insert sample document
INSERT INTO documents (title, description, content, document_type, status, category, vessel_id, created_by) VALUES
('Bill of Lading', 'International Bill of Lading for oil cargo', 'This document serves as a receipt for cargo and evidence of the contract of carriage...', 'Legal Document', 'active', 'legal', 1, 1),
('Cargo Manifest', 'Detailed cargo manifest for crude oil shipment', 'Vessel: Sample Vessel\nCargo Type: Crude Oil\nQuantity: 100,000 barrels...', 'Shipping Document', 'active', 'commercial', 1, 1),
('Port Clearance Certificate', 'Port authority clearance for departure', 'This certificate confirms that the vessel has completed all port formalities...', 'Certificate', 'active', 'legal', 2, 1);

COMMENT ON TABLE documents IS 'Admin-managed documents with optional vessel association and AI content generation';
COMMENT ON COLUMN documents.vessel_id IS 'Optional association to a specific vessel';
COMMENT ON COLUMN documents.description IS 'Brief description used by AI for content generation';
COMMENT ON COLUMN documents.content IS 'Full document content, can be AI-generated based on title and description';