-- Manual User Insert SQL Schema
-- Use this to add users directly to the database

-- Add a regular user
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  is_email_verified, 
  created_at, 
  updated_at
) VALUES (
  'new.user@example.com',
  '$2b$10$K8pVVXjf6rVNj6QGmKcGU.OyVrUwXO8qFGy7XxOQmKpDgFwGbZ8p.',  -- Password: "password123"
  'New',
  'User',
  'user',
  true,
  NOW(),
  NOW()
);

-- Add an admin user
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  is_email_verified, 
  created_at, 
  updated_at
) VALUES (
  'admin.user@petrodealhub.com',
  '$2b$10$K8pVVXjf6rVNj6QGmKcGU.OyVrUwXO8qFGy7XxOQmKpDgFwGbZ8p.',  -- Password: "password123"
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Add a broker user
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  is_email_verified, 
  created_at, 
  updated_at
) VALUES (
  'broker.user@petrodealhub.com',
  '$2b$10$K8pVVXjf6rVNj6QGmKcGU.OyVrUwXO8qFGy7XxOQmKpDgFwGbZ8p.',  -- Password: "password123"
  'Broker',
  'User',
  'broker',
  true,
  NOW(),
  NOW()
);

-- Common Password Hashes (bcrypt):
-- "password123" = $2b$10$K8pVVXjf6rVNj6QGmKcGU.OyVrUwXO8qFGy7XxOQmKpDgFwGbZ8p.
-- "admin123" = $2b$10$H.PVW7tV4xZ2vGkWZR6FjOvs7l8qH3FtL2pYwKrNmZeGd4nQ7Xa9G
-- "test123" = $2b$10$Nf8qVgBGgE3pY8MzGwVrWe6xV.8L7qHfJ2N4TdKpY9aZ3pE1M6oF.
-- "demo123" = $2b$10$L7kD8VqE2FtN3xZ9wGkKdO2vB.7MqI5fH4P6RcL8nV9aE3rT1Wm.

-- Users Table Schema Reference:
-- id: SERIAL PRIMARY KEY (auto-generated)
-- email: TEXT NOT NULL UNIQUE
-- password: TEXT NOT NULL (bcrypt hashed)
-- first_name: TEXT
-- last_name: TEXT  
-- role: TEXT NOT NULL DEFAULT 'user' ('admin', 'user', 'broker')
-- stripe_customer_id: TEXT
-- is_email_verified: BOOLEAN DEFAULT false
-- email_verification_token: TEXT
-- reset_password_token: TEXT
-- reset_password_expires: TIMESTAMP
-- last_login_at: TIMESTAMP
-- created_at: TIMESTAMP DEFAULT NOW()
-- updated_at: TIMESTAMP DEFAULT NOW()

-- Example with all fields:
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  stripe_customer_id,
  is_email_verified, 
  email_verification_token,
  reset_password_token,
  reset_password_expires,
  last_login_at,
  created_at, 
  updated_at
) VALUES (
  'complete.user@example.com',
  '$2b$10$K8pVVXjf6rVNj6QGmKcGU.OyVrUwXO8qFGy7XxOQmKpDgFwGbZ8p.',
  'Complete',
  'User',
  'user',
  NULL,
  true,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);