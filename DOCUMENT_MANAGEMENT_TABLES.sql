-- Create professional_documents table
CREATE TABLE IF NOT EXISTS professional_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published')),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pdf_path VARCHAR(500)
);

-- Create vessel_documents junction table
CREATE TABLE IF NOT EXISTS vessel_documents (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vessel_id, document_id)
);

-- Create oil_types table that's missing
CREATE TABLE IF NOT EXISTS oil_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  api_gravity DECIMAL(5,2),
  sulfur_content DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some sample oil types
INSERT INTO oil_types (name, description, api_gravity, sulfur_content) VALUES
('Crude Oil', 'Basic crude oil for refining', 35.5, 0.5),
('Light Sweet Crude', 'High quality crude oil', 42.0, 0.3),
('Heavy Crude', 'Dense crude oil', 22.0, 2.5),
('Refined Gasoline', 'Processed gasoline fuel', 60.0, 0.1),
('Diesel Fuel', 'Marine and automotive diesel', 38.0, 0.2)
ON CONFLICT DO NOTHING;

-- Insert sample professional documents
INSERT INTO professional_documents (title, description, content, status, created_by) VALUES
('Vessel Inspection Certificate', 'Standard vessel inspection documentation', 'This document certifies that the vessel has undergone comprehensive inspection and meets all maritime safety standards.', 'published', 1),
('Commercial Viability Report', 'Analysis of commercial potential and market conditions', 'Comprehensive analysis of market conditions, cargo capacity, and commercial viability for maritime operations.', 'published', 1),
('Technical Specifications Report', 'Detailed technical specifications and capabilities', 'Complete technical documentation including engine specifications, cargo capacity, and operational parameters.', 'approved', 1),
('Cargo Manifest Template', 'Standard cargo documentation template', 'Template for documenting cargo details, quantities, and shipping information for maritime transport.', 'published', 1),
('Safety Compliance Certificate', 'Maritime safety compliance documentation', 'Certification of compliance with international maritime safety regulations and standards.', 'approved', 1)
ON CONFLICT DO NOTHING;