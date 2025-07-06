-- Manual User Account Creation SQL
-- Run these commands directly in your PostgreSQL database

-- 1. Admin Account
INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, created_at, updated_at) 
VALUES (
  'admin@petrodealhub.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'Super',
  'Admin',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 2. Demo User Account
INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, created_at, updated_at)
VALUES (
  'demo@petrodealhub.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: demo123
  'Demo',
  'User',
  'user',
  true,
  NOW(),
  NOW()
);

-- 3. Test User Account
INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, created_at, updated_at)
VALUES (
  'test@petrodealhub.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: test123
  'Test',
  'User',
  'user',
  true,
  NOW(),
  NOW()
);

-- 4. Broker User Account
INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, created_at, updated_at)
VALUES (
  'broker@petrodealhub.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: broker123
  'Broker',
  'User',
  'broker',
  true,
  NOW(),
  NOW()
);

-- Verify the accounts were created
SELECT id, email, first_name, last_name, role, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC;