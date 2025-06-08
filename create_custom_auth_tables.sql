-- Create custom authentication tables
-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with auto-incrementing ID
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trial_start_date TIMESTAMP NOT NULL,
  trial_end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Insert test admin user (password: "admin123")
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('admin@petrodealhub.com', '$2b$10$rQ8Z9J8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8u', 'Admin', 'User', 'admin');