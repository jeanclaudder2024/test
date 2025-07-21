-- BROKER MEMBERSHIP DATABASE UPDATE
-- Add broker membership fields to users table for $299 one-time payment system

-- Add broker membership columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT;

-- Update existing admin user to have broker membership (optional)
-- UPDATE users SET has_broker_membership = TRUE, broker_membership_date = NOW() WHERE role = 'admin';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('has_broker_membership', 'broker_membership_date', 'broker_membership_payment_id')
ORDER BY column_name;

-- Test query to check broker membership status
SELECT id, email, role, has_broker_membership, broker_membership_date 
FROM users 
WHERE has_broker_membership = TRUE 
OR role = 'admin'
ORDER BY id;