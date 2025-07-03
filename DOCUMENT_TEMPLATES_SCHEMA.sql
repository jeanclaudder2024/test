-- Document Templates Schema for AI-Powered Document Generation
-- Run this in your Supabase SQL Editor

-- Create Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL, -- AI prompt describing what document to generate
    category TEXT NOT NULL DEFAULT 'general', -- general, technical, safety, commercial
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Generated Documents Table
CREATE TABLE IF NOT EXISTS generated_documents (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
    vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- AI-generated content
    status TEXT NOT NULL DEFAULT 'generated', -- generated, approved, archived
    generated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON document_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_at ON document_templates(created_at);

CREATE INDEX IF NOT EXISTS idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_vessel_id ON generated_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at);

-- Insert sample document templates
INSERT INTO document_templates (name, description, category, is_active, created_by) VALUES
(
    'Vessel Safety Certificate',
    'Generate a comprehensive vessel safety certificate document that includes all safety protocols, emergency procedures, safety equipment inventory, crew safety training records, safety inspection history, and compliance with international maritime safety standards. Include vessel specifications, safety rating, and certification validity period.',
    'safety',
    true,
    1
),
(
    'Technical Specification Report',
    'Create a detailed technical specification report covering vessel engine specifications, fuel capacity, cargo handling systems, navigation equipment, communication systems, structural specifications, and maintenance records. Include technical drawings references, performance metrics, and compliance with technical standards.',
    'technical',
    true,
    1
),
(
    'Commercial Charter Agreement',
    'Generate a professional commercial charter agreement document including vessel charter terms, rental rates, operational responsibilities, insurance requirements, fuel provisions, crew arrangements, route specifications, cargo handling terms, payment schedules, and legal compliance requirements.',
    'commercial',
    true,
    1
),
(
    'Port Authority Documentation',
    'Create comprehensive port authority documentation including vessel registration details, port clearance requirements, customs documentation, quarantine certificates, waste disposal compliance, security clearances, pilot services requirements, and port fees calculation.',
    'general',
    true,
    1
),
(
    'Cargo Manifest and Inspection Report',
    'Generate detailed cargo manifest and inspection report covering cargo types, quantities, loading procedures, safety protocols for cargo handling, inspection findings, compliance with cargo regulations, storage requirements, and transfer documentation.',
    'technical',
    true,
    1
);

-- Add comments for documentation
COMMENT ON TABLE document_templates IS 'AI-powered document templates that admins create for dynamic document generation';
COMMENT ON COLUMN document_templates.name IS 'Display name of the template (e.g., "Vessel Certificate", "Safety Report")';
COMMENT ON COLUMN document_templates.description IS 'AI prompt that describes what document content to generate using vessel data';
COMMENT ON COLUMN document_templates.category IS 'Template category for organization (general, technical, safety, commercial)';

COMMENT ON TABLE generated_documents IS 'AI-generated documents created from templates using vessel data';
COMMENT ON COLUMN generated_documents.template_id IS 'Reference to the template used for generation';
COMMENT ON COLUMN generated_documents.vessel_id IS 'Reference to the vessel the document was generated for';
COMMENT ON COLUMN generated_documents.content IS 'AI-generated document content based on template description and vessel data';