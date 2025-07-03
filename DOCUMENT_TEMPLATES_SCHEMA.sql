-- AI Document Templates System Database Schema
-- Create this schema in your Supabase database

-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create generated documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES document_templates(id) ON DELETE CASCADE,
  vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_generated_documents_vessel ON generated_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template ON generated_documents(template_id);

-- Insert sample document templates
INSERT INTO document_templates (name, description, category, created_by) VALUES 
(
  'Vessel Safety Certificate', 
  'Generate a comprehensive safety certificate for this vessel including all safety equipment, emergency procedures, and compliance with international maritime safety regulations. Include specific vessel details like capacity, safety equipment inventory, and certification dates.',
  'safety',
  1
),
(
  'Technical Specification Report',
  'Create a detailed technical specification document for this vessel covering engine specifications, cargo capacity, dimensions, construction details, and technical performance data. Use the vessel data to provide specific technical parameters.',
  'technical',
  1
),
(
  'Commercial Cargo Manifest',
  'Generate a professional cargo manifest document for this vessel including cargo details, loading specifications, commercial terms, and shipping documentation. Include vessel capacity and current operational status.',
  'commercial',
  1
),
(
  'Port Operations Report',
  'Create a comprehensive port operations report for this vessel including arrival/departure details, port services utilized, operational timeline, and port authority communications.',
  'general',
  1
) ON CONFLICT (name) DO NOTHING;

-- Grant permissions (if using RLS)
-- ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (optional, for security)
-- CREATE POLICY "Users can view document templates" ON document_templates FOR SELECT USING (true);
-- CREATE POLICY "Admins can manage document templates" ON document_templates FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Users can view their generated documents" ON generated_documents FOR SELECT USING (true);
-- CREATE POLICY "Users can create generated documents" ON generated_documents FOR INSERT WITH CHECK (true);