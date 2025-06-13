-- Admin Documents Table Creation for Document Management System
-- This table stores documents created by administrators that appear in Professional Documents

CREATE TABLE IF NOT EXISTS admin_documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT,
    is_template BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_category ON admin_documents(category);
CREATE INDEX IF NOT EXISTS idx_admin_documents_document_type ON admin_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_admin_documents_created_by ON admin_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_documents_created_at ON admin_documents(created_at);

-- Insert sample admin documents
INSERT INTO admin_documents (title, description, content, document_type, status, category, tags, is_template) VALUES
(
    'Maritime Safety Guidelines',
    'Comprehensive safety guidelines for maritime operations',
    'MARITIME SAFETY GUIDELINES

OVERVIEW:
This document outlines essential safety protocols and guidelines for all maritime operations within the PetroDealHub platform.

SAFETY PROTOCOLS:
1. Emergency Response Procedures
2. Equipment Safety Standards
3. Personnel Training Requirements
4. Environmental Protection Measures

COMPLIANCE REQUIREMENTS:
All vessels must maintain current safety certifications and undergo regular inspections according to international maritime standards.

CONTACT INFORMATION:
For safety emergencies, contact the Maritime Safety Authority immediately.',
    'safety',
    'published',
    'safety',
    'safety,maritime,guidelines,compliance',
    true
),
(
    'Oil Trading Regulations',
    'Current regulations and compliance requirements for oil trading',
    'OIL TRADING REGULATIONS

REGULATORY FRAMEWORK:
This document outlines the current regulatory environment for oil trading operations.

KEY REGULATIONS:
1. International Trade Compliance
2. Environmental Standards
3. Quality Assurance Requirements
4. Documentation Standards

COMPLIANCE CHECKLIST:
- Valid trading licenses
- Environmental impact assessments
- Quality certificates
- Insurance documentation

UPDATES:
This document is updated quarterly to reflect changes in international regulations.',
    'regulatory',
    'published',
    'compliance',
    'regulations,trading,compliance,oil',
    true
),
(
    'Vessel Documentation Standards',
    'Standard documentation requirements for vessel operations',
    'VESSEL DOCUMENTATION STANDARDS

REQUIRED DOCUMENTS:
This document specifies the standard documentation required for all vessel operations.

DOCUMENTATION CATEGORIES:
1. Vessel Registration Documents
2. Safety Certificates
3. Cargo Manifests
4. Navigation Plans

QUALITY STANDARDS:
All documentation must meet international maritime standards and be regularly updated.

SUBMISSION PROCESS:
Documents must be submitted through the PetroDealHub platform for verification and approval.',
    'documentation',
    'published',
    'operations',
    'documentation,standards,vessels,operations',
    false
);

-- Add comments to the table and columns for documentation
COMMENT ON TABLE admin_documents IS 'Stores documents created by administrators that appear in the Professional Documents section';
COMMENT ON COLUMN admin_documents.title IS 'The title of the document';
COMMENT ON COLUMN admin_documents.description IS 'Brief description of the document content';
COMMENT ON COLUMN admin_documents.content IS 'Full content of the document';
COMMENT ON COLUMN admin_documents.document_type IS 'Type of document (safety, regulatory, documentation, general, etc.)';
COMMENT ON COLUMN admin_documents.status IS 'Publication status (draft, published, archived)';
COMMENT ON COLUMN admin_documents.category IS 'Category for organization (safety, compliance, operations, general, etc.)';
COMMENT ON COLUMN admin_documents.tags IS 'Comma-separated tags for searching and filtering';
COMMENT ON COLUMN admin_documents.is_template IS 'Whether this document serves as a template for creating new documents';
COMMENT ON COLUMN admin_documents.created_by IS 'ID of the admin user who created the document';