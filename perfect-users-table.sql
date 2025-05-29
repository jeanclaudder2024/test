-- Perfect simple users table for oil vessel tracking platform
-- No complex auth, no email verification - just works!

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple indexes
CREATE INDEX idx_users_email ON users(email);

-- No RLS complexity - keep it simple
ALTER TABLE users DISABLE ROW LEVEL SECURITY;