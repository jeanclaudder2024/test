-- Professional Document Management System Schema
-- Execute these SQL queries manually in your database

-- 1. Create the main documents table (admin-managed, vessel-independent)
CREATE TABLE IF NOT EXISTS professional_documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT, -- AI-generated content
    pdf_path TEXT, -- Path to generated PDF file
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create vessel-document associations (many-to-many relationship)
CREATE TABLE IF NOT EXISTS vessel_document_associations (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES professional_documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vessel_id, document_id)
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professional_documents_active ON professional_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_professional_documents_created_at ON professional_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_vessel_document_associations_vessel_id ON vessel_document_associations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_document_associations_document_id ON vessel_document_associations(document_id);

-- 4. Insert some sample professional documents (optional - you can create these via admin panel)
INSERT INTO professional_documents (title, description, is_active, created_at) VALUES
('Vessel Technical Specification Report', 'Comprehensive technical analysis including engine specifications, cargo capacity, and operational parameters', true, NOW()),
('Maritime Safety Compliance Certificate', 'Complete safety compliance documentation covering international maritime regulations and standards', true, NOW()),
('Cargo Handling Operations Manual', 'Detailed procedures for safe and efficient cargo loading, transportation, and discharge operations', true, NOW()),
('Voyage Performance Analysis', 'In-depth analysis of vessel performance metrics, fuel efficiency, and route optimization recommendations', true, NOW()),
('Port State Control Inspection Report', 'Regulatory inspection documentation ensuring compliance with international port state control requirements', true, NOW())
ON CONFLICT DO NOTHING;