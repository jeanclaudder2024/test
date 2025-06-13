-- ADD ADMIN USER TO SUPABASE MANUALLY
-- Copy and paste this SQL into your Supabase SQL editor

-- Delete any existing admin user first
DELETE FROM users WHERE email = 'superadmin@petrodealhub.com';
DELETE FROM users WHERE email = 'admin@petrodealhub.com';

-- Insert the admin user
-- Email: superadmin@petrodealhub.com
-- Password: admin123
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES (
    'superadmin@petrodealhub.com', 
    '$2b$10$6W/1ypnjS1aTMi7zCd3nweyNsPZfOeVKJSwV.PaaY0dbW6jiYSq4u', 
    'Super', 
    'Admin', 
    'admin'
);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'superadmin@petrodealhub.com';

-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Click on "SQL Editor" 
-- 3. Copy and paste this entire SQL script
-- 4. Click "RUN" to execute
-- 5. You can then login with: superadmin@petrodealhub.com / admin123