-- QUICK BROKER SYSTEM DATABASE FIX
-- Run this in Supabase SQL Editor to fix all broker issues

-- 1. Ensure users table has correct broker membership fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT;

-- 2. Create broker_deals table (essential for broker dashboard)
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  deal_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_close_date TIMESTAMP,
  oil_type TEXT,
  quantity TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Grant broker membership to admin for testing
UPDATE users 
SET 
  has_broker_membership = TRUE,
  broker_membership_date = NOW(),
  broker_membership_payment_id = 'admin_manual_grant'
WHERE email = 'admin@petrodealhub.com';

-- 4. Verify setup
SELECT id, email, role, has_broker_membership, broker_membership_date 
FROM users 
WHERE email = 'admin@petrodealhub.com';

-- 5. Check if broker_deals table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'broker_deals';