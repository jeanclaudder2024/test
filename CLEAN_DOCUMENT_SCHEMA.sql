-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS vessel_documents CASCADE;
DROP TABLE IF EXISTS professional_documents CASCADE;
DROP TABLE IF EXISTS oil_types CASCADE;

-- Create professional_documents table
CREATE TABLE professional_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT DEFAULT 'Professional maritime document content placeholder.',
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'approved', 'published')),
  created_by INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pdf_path VARCHAR(500)
);

-- Create vessel_documents junction table
CREATE TABLE vessel_documents (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vessel_id, document_id)
);

-- Create oil_types table
CREATE TABLE oil_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  api_gravity DECIMAL(5,2),
  sulfur_content DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample professional documents
INSERT INTO professional_documents (title, description, content, status) VALUES
('Vessel Inspection Certificate', 'Standard vessel inspection documentation', 'This document certifies that the vessel has undergone comprehensive inspection according to international maritime safety standards. All systems have been verified and meet regulatory requirements.', 'published'),
('Commercial Viability Report', 'Analysis of commercial potential and market conditions', 'Comprehensive analysis of current market conditions, cargo capacity utilization, and commercial viability assessment for maritime operations in the specified trade routes.', 'published'),
('Technical Specifications Report', 'Detailed technical specifications and capabilities', 'Complete technical documentation including engine specifications, cargo handling capabilities, navigation systems, and operational parameters for maritime vessel operations.', 'published'),
('Cargo Manifest Template', 'Standard cargo documentation template', 'Standardized template for documenting cargo details, quantities, origins, destinations, and special handling requirements for maritime transport operations.', 'published'),
('Safety Compliance Certificate', 'Maritime safety compliance documentation', 'Certification of compliance with International Maritime Organization (IMO) safety regulations, SOLAS requirements, and vessel safety management systems.', 'published');

-- Insert oil types
INSERT INTO oil_types (name, description, api_gravity, sulfur_content) VALUES
('Crude Oil', 'Basic crude oil for refining', 35.5, 0.5),
('Light Sweet Crude', 'High quality crude oil', 42.0, 0.3),
('Heavy Crude', 'Dense crude oil', 22.0, 2.5),
('Refined Gasoline', 'Processed gasoline fuel', 60.0, 0.1),
('Diesel Fuel', 'Marine and automotive diesel', 38.0, 0.2);

-- Associate documents with first few vessels
INSERT INTO vessel_documents (vessel_id, document_id) 
SELECT v.id, d.id 
FROM (SELECT id FROM vessels LIMIT 5) v 
CROSS JOIN (SELECT id FROM professional_documents) d;