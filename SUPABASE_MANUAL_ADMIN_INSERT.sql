-- Manual Superadmin User Creation for Supabase
-- Run this in the Supabase SQL Editor

-- Insert into auth.users (Supabase Auth table)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'superadmin@petrodealhub.com',
  crypt('admin123', gen_salt('bf')), -- Bcrypt password hash
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  false,
  'authenticated'
);

-- Also insert into your custom users table if you have one
INSERT INTO users (
  email,
  password,
  role,
  first_name,
  last_name,
  created_at
) VALUES (
  'superadmin@petrodealhub.com',
  '$2b$10$9XdKzI.ZoX0.Q5QqZl8/0.rKqMQ8tG5t2VjqEgHt6/QFZ2tK8Y2L6', -- Pre-hashed admin123
  'admin',
  'Super',
  'Admin',
  now()
) ON CONFLICT (email) DO NOTHING;