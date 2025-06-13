import { db } from './db.js';
import { users, userSubscriptions } from '@shared/schema.js';
import { sql } from 'drizzle-orm';

export async function initializeCustomAuthTables() {
  try {
    console.log('Initializing custom authentication tables...');
    
    // Drop existing tables if they exist
    await db.execute(sql`DROP TABLE IF EXISTS user_subscriptions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    
    // Create users table with auto-incrementing ID
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create user_subscriptions table
    await db.execute(sql`
      CREATE TABLE user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        trial_start_date TIMESTAMP NOT NULL,
        trial_end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Drop old admin_documents table if it exists
    await db.execute(sql`DROP TABLE IF EXISTS admin_documents CASCADE`);
    
    // Create new documents table (Document Management system) - only if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        document_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        category TEXT DEFAULT 'general',
        tags TEXT,
        is_template BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)`);
    
    console.log('Custom authentication tables created successfully');
    
    // Insert test admin user (password: "admin123")
    const adminPasswordHash = '$2b$10$6W/1ypnjS1aTMi7zCd3nweyNsPZfOeVKJSwV.PaaY0dbW6jiYSq4u';
    
    // First delete any existing admin user to ensure clean recreation
    await db.execute(sql`DELETE FROM users WHERE email = 'admin@petrodealhub.com'`);
    
    await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ('admin@petrodealhub.com', ${adminPasswordHash}, 'Admin', 'User', 'admin')
    `);
    
    console.log('Test admin user created: admin@petrodealhub.com / admin123');
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}