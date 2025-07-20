-- Add broker membership columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT;

-- Update any existing admin users to have broker access
UPDATE users 
SET has_broker_membership = TRUE 
WHERE role = 'admin' AND has_broker_membership IS FALSE;