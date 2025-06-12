-- Broker Dashboard Tables for Comprehensive Deal Management System
-- Execute these statements in your Supabase SQL editor

-- Broker Deals Management Table
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES real_companies(id) ON DELETE CASCADE,
  deal_title TEXT NOT NULL,
  deal_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  oil_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  start_date TIMESTAMP DEFAULT NOW(),
  expected_close_date TIMESTAMP,
  actual_close_date TIMESTAMP,
  notes TEXT,
  commission_rate TEXT,
  commission_amount TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Broker Documents Table
CREATE TABLE IF NOT EXISTS broker_documents (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES broker_deals(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  uploaded_by TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Files sent to Brokers Table
CREATE TABLE IF NOT EXISTS admin_broker_files (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('contract', 'compliance', 'legal', 'technical', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  requires_signature BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Broker Deal Activities/Timeline Table
CREATE TABLE IF NOT EXISTS broker_deal_activities (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Broker Statistics Table
CREATE TABLE IF NOT EXISTS broker_stats (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  cancelled_deals INTEGER DEFAULT 0,
  total_value TEXT DEFAULT '0',
  total_commission TEXT DEFAULT '0',
  success_rate INTEGER DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  average_deal_size TEXT DEFAULT '0',
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_company_id ON broker_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_admin_broker_files_broker_id ON admin_broker_files(broker_id);
CREATE INDEX IF NOT EXISTS idx_admin_broker_files_sent_by ON admin_broker_files(sent_by_user_id);
CREATE INDEX IF NOT EXISTS idx_broker_deal_activities_deal_id ON broker_deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_broker_stats_broker_id ON broker_stats(broker_id);

-- Insert sample data for testing (optional)
-- Sample broker deal
INSERT INTO broker_deals (broker_id, company_id, deal_title, deal_value, status, progress, oil_type, quantity, notes, commission_rate)
VALUES (1, 1, 'Crude Oil Supply Agreement', '$2,500,000', 'active', 45, 'Crude Oil', '50,000 barrels', 'Major supply agreement with quarterly deliveries', '3.5%')
ON CONFLICT DO NOTHING;

-- Sample broker document
INSERT INTO broker_documents (broker_id, deal_id, file_name, original_name, file_type, file_size, file_path, description, uploaded_by)
VALUES (1, 1, 'contract_2024_001.pdf', 'Supply Agreement Contract.pdf', 'application/pdf', '2.3 MB', '/uploads/broker/1/contract_2024_001.pdf', 'Main supply agreement contract', 'admin@petrodealhub.com')
ON CONFLICT DO NOTHING;

-- Sample admin file
INSERT INTO admin_broker_files (broker_id, sent_by_user_id, file_name, original_name, file_type, file_size, file_path, description, category, priority)
VALUES (1, 1, 'compliance_update_2024.pdf', 'Compliance Guidelines Update.pdf', 'application/pdf', '1.8 MB', '/uploads/admin/broker/1/compliance_update_2024.pdf', 'Updated compliance guidelines for oil trading', 'compliance', 'high')
ON CONFLICT DO NOTHING;

-- Initialize broker stats
INSERT INTO broker_stats (broker_id, total_deals, active_deals, completed_deals, total_value, success_rate, average_deal_size)
VALUES (1, 1, 1, 0, '2500000', 85, '2500000')
ON CONFLICT (broker_id) DO UPDATE SET
  total_deals = EXCLUDED.total_deals,
  active_deals = EXCLUDED.active_deals,
  completed_deals = EXCLUDED.completed_deals,
  total_value = EXCLUDED.total_value,
  success_rate = EXCLUDED.success_rate,
  average_deal_size = EXCLUDED.average_deal_size,
  updated_at = NOW();

-- Sample deal activity
INSERT INTO broker_deal_activities (deal_id, user_id, activity_type, description, new_value)
VALUES (1, 1, 'status_change', 'Deal status updated to active', 'active')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE broker_deals IS 'Stores all broker deals with companies including progress tracking';
COMMENT ON TABLE broker_documents IS 'Stores documents uploaded by brokers for deals';
COMMENT ON TABLE admin_broker_files IS 'Stores files sent by admin to brokers';
COMMENT ON TABLE broker_deal_activities IS 'Tracks all activities and changes on broker deals';
COMMENT ON TABLE broker_stats IS 'Stores calculated statistics for each broker';