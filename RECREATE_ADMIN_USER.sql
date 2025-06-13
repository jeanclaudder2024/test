-- Recreate Admin User for PetroDealHub
-- This script ensures the admin user exists for login

-- Delete any existing admin user first
DELETE FROM users WHERE email = 'admin@petrodealhub.com';

-- Insert fresh admin user with proper password hash
-- Password: admin123
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES (
    'admin@petrodealhub.com', 
    '$2b$10$6W/1ypnjS1aTMi7zCd3nweyNsPZfOeVKJSwV.PaaY0dbW6jiYSq4u', 
    'Admin', 
    'User', 
    'admin'
);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'admin@petrodealhub.com';