-- Complete Broker System Database Schema
-- This script creates all tables needed for the broker dashboard functionality

-- Broker deals table
CREATE TABLE IF NOT EXISTS broker_deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES real_companies(id) ON DELETE SET NULL,
    deal_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    deal_value DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    oil_type VARCHAR(100) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    notes TEXT,
    documents_count INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    commission_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Broker documents table
CREATE TABLE IF NOT EXISTS broker_documents (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255) NOT NULL,
    download_count INTEGER DEFAULT 0,
    is_admin_file BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin files sent to brokers
CREATE TABLE IF NOT EXISTS broker_admin_files (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_by VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('contract', 'compliance', 'legal', 'technical', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Broker statistics/analytics table
CREATE TABLE IF NOT EXISTS broker_stats (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    active_deals INTEGER DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    completed_deals INTEGER DEFAULT 0,
    cancelled_deals INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    total_commission DECIMAL(15,2) DEFAULT 0.00,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_deal_size DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Broker profile completion tracking
CREATE TABLE IF NOT EXISTS broker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    nationality VARCHAR(100),
    experience VARCHAR(100),
    specialization VARCHAR(100),
    previous_employer VARCHAR(255),
    certifications TEXT,
    passport_photo_path VARCHAR(500),
    phone_number VARCHAR(50),
    address TEXT,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    membership_status VARCHAR(50) DEFAULT 'inactive' CHECK (membership_status IN ('active', 'inactive', 'expired', 'suspended')),
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    card_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_broker_admin_files_broker_id ON broker_admin_files(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_admin_files_is_read ON broker_admin_files(is_read);
CREATE INDEX IF NOT EXISTS idx_broker_stats_broker_id ON broker_stats(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_profiles_user_id ON broker_profiles(user_id);

-- Function to update broker stats automatically
CREATE OR REPLACE FUNCTION update_broker_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the broker
    INSERT INTO broker_stats (broker_id, active_deals, total_deals, completed_deals, cancelled_deals, total_value, success_rate, completion_rate, average_deal_size)
    SELECT 
        NEW.broker_id,
        COUNT(*) FILTER (WHERE status = 'active'),
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COALESCE(SUM(deal_value), 0),
        CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2) ELSE 0 END,
        CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status IN ('completed', 'cancelled'))::DECIMAL / COUNT(*)) * 100, 2) ELSE 0 END,
        CASE WHEN COUNT(*) > 0 THEN ROUND(AVG(deal_value), 2) ELSE 0 END
    FROM broker_deals 
    WHERE broker_id = NEW.broker_id
    ON CONFLICT (broker_id) DO UPDATE SET
        active_deals = EXCLUDED.active_deals,
        total_deals = EXCLUDED.total_deals,
        completed_deals = EXCLUDED.completed_deals,
        cancelled_deals = EXCLUDED.cancelled_deals,
        total_value = EXCLUDED.total_value,
        success_rate = EXCLUDED.success_rate,
        completion_rate = EXCLUDED.completion_rate,
        average_deal_size = EXCLUDED.average_deal_size,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update broker stats
DROP TRIGGER IF EXISTS trigger_update_broker_stats ON broker_deals;
CREATE TRIGGER trigger_update_broker_stats
    AFTER INSERT OR UPDATE OR DELETE ON broker_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_broker_stats();

-- Insert sample data for testing
INSERT INTO broker_deals (broker_id, company_id, deal_title, company_name, deal_value, status, progress, oil_type, quantity, notes, documents_count)
VALUES 
    (1, 1, 'Saudi Crude Oil Export Deal', 'Saudi Aramco', 2500000.00, 'active', 65, 'Crude Oil', '50,000 barrels', 'High priority export deal', 3),
    (1, 2, 'Shell Refined Products', 'Shell', 1200000.00, 'pending', 25, 'Refined Products', '25,000 barrels', 'Pending documentation', 1),
    (1, 3, 'ExxonMobil Partnership', 'ExxonMobil', 3500000.00, 'active', 85, 'Heavy Crude', '75,000 barrels', 'Near completion', 5),
    (1, 4, 'BP Trading Agreement', 'BP', 1800000.00, 'completed', 100, 'Light Crude', '40,000 barrels', 'Successfully completed', 7),
    (1, 5, 'Chevron Supply Contract', 'Chevron', 900000.00, 'cancelled', 45, 'Diesel', '15,000 barrels', 'Cancelled due to market conditions', 2);

-- Insert sample admin files
INSERT INTO broker_admin_files (broker_id, file_name, original_name, file_type, file_size, file_path, sent_by, description, category, priority)
VALUES 
    (1, 'contract_template_2024.pdf', 'Standard Contract Template 2024.pdf', 'pdf', '2.5MB', '/uploads/admin/contract_template_2024.pdf', 'Admin Manager', 'Updated contract template for 2024', 'contract', 'high'),
    (1, 'compliance_guide.pdf', 'Maritime Compliance Guide.pdf', 'pdf', '1.8MB', '/uploads/admin/compliance_guide.pdf', 'Legal Team', 'Latest compliance requirements', 'compliance', 'medium'),
    (1, 'technical_specs.docx', 'Technical Specifications.docx', 'docx', '750KB', '/uploads/admin/technical_specs.docx', 'Technical Team', 'Technical specifications for oil grades', 'technical', 'medium');

-- Insert sample broker profile
INSERT INTO broker_profiles (user_id, first_name, last_name, phone_number, address, is_profile_complete, membership_status, membership_expires_at, card_number)
VALUES 
    (1, 'John', 'Doe', '+1-555-0123', '123 Business St, New York, NY 10001', true, 'active', '2025-12-31 23:59:59', 'OIL-123456');

COMMENT ON TABLE broker_deals IS 'Stores broker deals and their progress';
COMMENT ON TABLE broker_documents IS 'Stores documents uploaded by brokers for deals';
COMMENT ON TABLE broker_admin_files IS 'Stores files sent by admin to brokers';
COMMENT ON TABLE broker_stats IS 'Stores calculated statistics for each broker';
COMMENT ON TABLE broker_profiles IS 'Stores broker profile information and completion status';