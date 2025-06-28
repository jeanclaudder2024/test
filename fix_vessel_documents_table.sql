-- Fix vessel_documents table structure to match Drizzle schema
-- Drop and recreate the table with correct column names

DROP TABLE IF EXISTS vessel_documents CASCADE;

CREATE TABLE vessel_documents (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER REFERENCES vessels(id),
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'draft',
    is_required BOOLEAN DEFAULT false,
    expiry_date TIMESTAMP,
    created_by TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP,
    tags TEXT,
    metadata TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessel_documents_vessel_id ON vessel_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_documents_status ON vessel_documents(status);
CREATE INDEX IF NOT EXISTS idx_vessel_documents_document_type ON vessel_documents(document_type);

-- Insert some sample documents for testing
INSERT INTO vessel_documents (vessel_id, document_type, title, description, content, status, is_required, created_by) VALUES
(1, 'Certificate', 'Safety Certificate', 'International Safety Management Certificate', 'This certificate confirms that the vessel meets all safety requirements...', 'active', true, 'Port Authority'),
(1, 'Manifest', 'Cargo Manifest', 'Detailed cargo manifest for current voyage', 'Cargo details and specifications for the current voyage...', 'active', true, 'Cargo Manager'),
(2, 'Certificate', 'Tonnage Certificate', 'International Tonnage Certificate', 'Official tonnage measurement certificate...', 'active', true, 'Classification Society');