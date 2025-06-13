-- Create Documents Table for New Document Management System
-- This replaces the old admin_documents table with a clean implementation

-- Create the new documents table
CREATE TABLE IF NOT EXISTS documents (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Insert sample documents for testing
INSERT INTO documents (title, description, content, document_type, status, category, tags, is_template) VALUES
(
    'Maritime Safety Guidelines',
    'Comprehensive safety guidelines for maritime operations',
    'MARITIME SAFETY GUIDELINES

1. GENERAL SAFETY PROTOCOLS
- All personnel must wear appropriate safety equipment
- Emergency procedures must be clearly posted
- Regular safety drills are mandatory

2. VESSEL OPERATIONS
- Pre-departure safety checks required
- Continuous monitoring of weather conditions
- Proper cargo securing procedures

3. EMERGENCY PROCEDURES
- Emergency contact information readily available
- Life-saving equipment inspected regularly
- Emergency response plans updated annually',
    'Safety Protocol',
    'active',
    'technical',
    'safety, maritime, guidelines',
    true
),
(
    'Oil Transportation Standards',
    'Standards and procedures for oil transportation',
    'OIL TRANSPORTATION STANDARDS

1. CARGO HANDLING
- Proper loading and unloading procedures
- Temperature and pressure monitoring
- Quality control measures

2. ENVIRONMENTAL COMPLIANCE
- Pollution prevention measures
- Waste management protocols
- Regulatory compliance requirements

3. DOCUMENTATION
- Required certificates and permits
- Manifest and shipping documents
- Quality assurance records',
    'Transportation Standard',
    'active',
    'commercial',
    'oil, transportation, standards',
    true
),
(
    'Port Operations Manual',
    'Complete manual for port operations and procedures',
    'PORT OPERATIONS MANUAL

1. ARRIVAL PROCEDURES
- Vessel notification requirements
- Berth allocation process
- Documentation requirements

2. CARGO OPERATIONS
- Loading and discharge procedures
- Safety protocols during operations
- Equipment maintenance requirements

3. DEPARTURE PROCEDURES
- Final inspections
- Documentation completion
- Clearance procedures',
    'Operations Manual',
    'active',
    'general',
    'port, operations, manual',
    false
);