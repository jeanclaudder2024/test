-- Manual test to grant broker membership to admin user for testing
-- Run this in your database console (Supabase SQL Editor)

-- Check current user status
SELECT id, email, role, has_broker_membership, broker_membership_date, broker_membership_payment_id 
FROM users 
WHERE email = 'admin@petrodealhub.com';

-- Manually grant broker membership to admin user for testing
UPDATE users 
SET 
  has_broker_membership = TRUE,
  broker_membership_date = NOW(),
  broker_membership_payment_id = 'manual_test_payment'
WHERE email = 'admin@petrodealhub.com';

-- Verify the update
SELECT id, email, role, has_broker_membership, broker_membership_date, broker_membership_payment_id 
FROM users 
WHERE email = 'admin@petrodealhub.com';