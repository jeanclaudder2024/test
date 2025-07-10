-- =============================================================================
-- BROKER SYSTEM DATABASE SCHEMA
-- Complete SQL schema for all broker-related tables
-- =============================================================================

-- 1. BROKER DEALS TABLE
-- Stores all broker deal information
CREATE TABLE IF NOT EXISTS broker_deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_company_id INTEGER,
    buyer_company_id INTEGER,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
    
    -- Deal basic information
    deal_title VARCHAR(255) NOT NULL,
    deal_description TEXT,
    cargo_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'MT',
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Deal status and timeline
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, pending, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    commission_rate DECIMAL(5,4) DEFAULT 0.015, -- 1.5% default commission
    commission_amount DECIMAL(12,2),
    
    -- Location information
    origin_port VARCHAR(255),
    destination_port VARCHAR(255),
    departure_date DATE,
    arrival_date DATE,
    
    -- Deal progress tracking
    progress_percentage INTEGER DEFAULT 0,
    completion_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Indexes for performance
    INDEX idx_broker_deals_broker_id (broker_id),
    INDEX idx_broker_deals_status (status),
    INDEX idx_broker_deals_created_at (created_at),
    INDEX idx_broker_deals_vessel_id (vessel_id)
);

-- 2. BROKER DOCUMENTS TABLE
-- Stores documents uploaded by brokers
CREATE TABLE IF NOT EXISTS broker_documents (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
    
    -- Document information
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- contract, invoice, certificate, etc.
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    
    -- Document metadata
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
    confidentiality_level VARCHAR(20) DEFAULT 'standard', -- public, standard, confidential, restricted
    
    -- Access tracking
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_broker_documents_broker_id (broker_id),
    INDEX idx_broker_documents_deal_id (deal_id),
    INDEX idx_broker_documents_type (document_type),
    INDEX idx_broker_documents_status (status)
);

-- 3. BROKER ADMIN FILES TABLE
-- Files shared by admin with brokers
CREATE TABLE IF NOT EXISTS broker_admin_files (
    id SERIAL PRIMARY KEY,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    
    -- File metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- general, legal, compliance, training, etc.
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Access control
    target_brokers TEXT, -- JSON array of broker IDs, null = all brokers
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active', -- active, archived, expired
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_broker_admin_files_category (category),
    INDEX idx_broker_admin_files_status (status),
    INDEX idx_broker_admin_files_created_at (created_at)
);

-- 4. BROKER ADMIN FILE ACKNOWLEDGMENTS TABLE
-- Tracks which brokers have read admin files
CREATE TABLE IF NOT EXISTS broker_admin_file_acknowledgments (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES broker_admin_files(id) ON DELETE CASCADE,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Acknowledgment details
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    notes TEXT,
    
    -- Ensure unique acknowledgment per broker per file
    UNIQUE(file_id, broker_id),
    
    -- Indexes
    INDEX idx_broker_admin_ack_file_id (file_id),
    INDEX idx_broker_admin_ack_broker_id (broker_id)
);

-- 5. BROKER STATS TABLE
-- Performance statistics for each broker
CREATE TABLE IF NOT EXISTS broker_stats (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Deal statistics
    total_deals INTEGER DEFAULT 0,
    active_deals INTEGER DEFAULT 0,
    completed_deals INTEGER DEFAULT 0,
    cancelled_deals INTEGER DEFAULT 0,
    
    -- Financial statistics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_commission DECIMAL(15,2) DEFAULT 0,
    average_deal_value DECIMAL(12,2) DEFAULT 0,
    
    -- Performance metrics
    success_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    average_deal_duration INTEGER DEFAULT 0, -- days
    client_satisfaction_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    -- Activity metrics
    documents_uploaded INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP,
    
    -- Time period tracking
    stats_period VARCHAR(20) DEFAULT 'all_time', -- all_time, yearly, monthly, weekly
    period_start_date DATE,
    period_end_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique stats per broker per period
    UNIQUE(broker_id, stats_period, period_start_date),
    
    -- Indexes
    INDEX idx_broker_stats_broker_id (broker_id),
    INDEX idx_broker_stats_period (stats_period),
    INDEX idx_broker_stats_updated_at (updated_at)
);

-- 6. BROKER PROFILES TABLE
-- Extended profile information for brokers
CREATE TABLE IF NOT EXISTS broker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional information
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    license_number VARCHAR(100),
    years_experience INTEGER,
    specializations TEXT, -- JSON array of specialization areas
    
    -- Contact information
    business_phone VARCHAR(50),
    business_email VARCHAR(255),
    business_address TEXT,
    website_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- Certification and compliance
    certifications TEXT, -- JSON array of certifications
    compliance_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, suspended
    last_compliance_check TIMESTAMP,
    
    -- Performance and ratings
    rating DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    total_ratings INTEGER DEFAULT 0,
    verified_broker BOOLEAN DEFAULT FALSE,
    premium_member BOOLEAN DEFAULT FALSE,
    
    -- Preferences and settings
    notification_preferences TEXT, -- JSON object with notification settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(user_id),
    
    -- Indexes
    INDEX idx_broker_profiles_user_id (user_id),
    INDEX idx_broker_profiles_compliance_status (compliance_status),
    INDEX idx_broker_profiles_rating (rating),
    INDEX idx_broker_profiles_verified (verified_broker)
);

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample broker deals
INSERT INTO broker_deals (
    broker_id, seller_company_id, buyer_company_id, vessel_id,
    deal_title, deal_description, cargo_type, quantity, price_per_unit, total_value,
    status, origin_port, destination_port, departure_date, arrival_date,
    commission_rate, commission_amount, notes
) VALUES 
(1, 1, 2, 1, 'Crude Oil Deal - Saudi to Netherlands', 'Large crude oil shipment from Saudi Arabia to Netherlands', 'Crude Oil', 285000.00, 85.50, 24397500.00, 'active', 'Ras Tanura', 'Rotterdam', '2025-01-15', '2025-02-05', 0.015, 365962.50, 'High priority deal with established client'),
(1, 2, 3, 2, 'Diesel Fuel Transportation', 'Diesel fuel shipment for European distribution', 'Diesel', 125000.00, 95.75, 11968750.00, 'completed', 'Jebel Ali', 'Hamburg', '2024-12-20', '2025-01-10', 0.012, 143625.00, 'Completed successfully on time'),
(1, 3, 4, NULL, 'LNG Cargo Deal', 'Liquefied Natural Gas shipment under negotiation', 'LNG', 75000.00, 145.00, 10875000.00, 'draft', 'Qatar Gas Port', 'Tokyo Bay', NULL, NULL, 0.020, 217500.00, 'Preliminary negotiations in progress');

-- Insert sample broker documents
INSERT INTO broker_documents (
    broker_id, deal_id, document_name, document_type, file_path, file_size, mime_type,
    description, status, confidentiality_level
) VALUES 
(1, 1, 'Crude_Oil_Contract_2025.pdf', 'contract', '/uploads/broker-documents/1234567890-crude-contract.pdf', 2048576, 'application/pdf', 'Main contract document for crude oil deal', 'active', 'confidential'),
(1, 1, 'Bill_of_Lading_001.pdf', 'bill_of_lading', '/uploads/broker-documents/1234567891-bol.pdf', 1024768, 'application/pdf', 'Bill of lading for vessel departure', 'active', 'standard'),
(1, 2, 'Diesel_Invoice_Final.pdf', 'invoice', '/uploads/broker-documents/1234567892-diesel-invoice.pdf', 512384, 'application/pdf', 'Final invoice for completed diesel deal', 'active', 'standard');

-- Insert sample admin files
INSERT INTO broker_admin_files (
    file_name, file_path, file_size, mime_type, title, description, category, priority,
    requires_acknowledgment, created_by, status
) VALUES 
('Maritime_Regulations_2025.pdf', '/uploads/admin-files/maritime-regulations.pdf', 5242880, 'application/pdf', 'Updated Maritime Regulations 2025', 'New regulations effective from January 2025', 'legal', 'high', TRUE, 1, 'active'),
('Broker_Guidelines_V2.pdf', '/uploads/admin-files/broker-guidelines.pdf', 3145728, 'application/pdf', 'Broker Guidelines Version 2.0', 'Updated guidelines for broker operations', 'compliance', 'normal', TRUE, 1, 'active'),
('Safety_Protocols.pdf', '/uploads/admin-files/safety-protocols.pdf', 2097152, 'application/pdf', 'Safety Protocols Update', 'Updated safety protocols for all operations', 'training', 'high', FALSE, 1, 'active');

-- Insert sample broker stats
INSERT INTO broker_stats (
    broker_id, total_deals, active_deals, completed_deals, cancelled_deals,
    total_revenue, total_commission, average_deal_value, success_rate,
    average_deal_duration, client_satisfaction_score, documents_uploaded,
    last_activity_date, stats_period
) VALUES 
(1, 25, 3, 20, 2, 125000000.00, 1875000.00, 5000000.00, 80.00, 21, 8.5, 75, CURRENT_TIMESTAMP, 'all_time');

-- Insert sample broker profile
INSERT INTO broker_profiles (
    user_id, company_name, job_title, license_number, years_experience,
    specializations, business_phone, business_email, business_address,
    certifications, compliance_status, rating, total_ratings, verified_broker
) VALUES 
(1, 'Maritime Brokerage Solutions', 'Senior Oil Broker', 'MB-2025-001', 8, 
'["Crude Oil", "Refined Products", "LNG", "Maritime Insurance"]', 
'+1-555-0123', 'broker@maritime-solutions.com', '123 Harbor Drive, Maritime City, MC 12345',
'["International Maritime Broker Certificate", "Oil Trading License", "Maritime Safety Certificate"]',
'approved', 8.75, 24, TRUE);

-- =============================================================================
-- USEFUL QUERIES FOR CHECKING BROKER SYSTEM
-- =============================================================================

-- Check all broker deals
SELECT 
    bd.id,
    bd.deal_title,
    bd.cargo_type,
    bd.quantity,
    bd.total_value,
    bd.status,
    bd.commission_amount,
    u.email as broker_email
FROM broker_deals bd
JOIN users u ON bd.broker_id = u.id
ORDER BY bd.created_at DESC;

-- Check broker documents
SELECT 
    bd.id,
    bd.document_name,
    bd.document_type,
    bd.file_size,
    bd.status,
    bd.download_count,
    u.email as broker_email
FROM broker_documents bd
JOIN users u ON bd.broker_id = u.id
ORDER BY bd.created_at DESC;

-- Check broker statistics
SELECT 
    bs.broker_id,
    u.email as broker_email,
    bs.total_deals,
    bs.active_deals,
    bs.completed_deals,
    bs.total_commission,
    bs.success_rate,
    bs.client_satisfaction_score
FROM broker_stats bs
JOIN users u ON bs.broker_id = u.id;

-- Check admin files and acknowledgments
SELECT 
    af.id,
    af.title,
    af.category,
    af.status,
    af.requires_acknowledgment,
    COUNT(ack.id) as acknowledgment_count
FROM broker_admin_files af
LEFT JOIN broker_admin_file_acknowledgments ack ON af.id = ack.file_id
GROUP BY af.id, af.title, af.category, af.status, af.requires_acknowledgment
ORDER BY af.created_at DESC;

-- Check broker profiles
SELECT 
    bp.user_id,
    u.email,
    bp.company_name,
    bp.job_title,
    bp.years_experience,
    bp.compliance_status,
    bp.rating,
    bp.verified_broker
FROM broker_profiles bp
JOIN users u ON bp.user_id = u.id;