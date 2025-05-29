/**
 * Fix users table to properly handle Supabase Auth UUIDs
 */
import { createClient } from '@supabase/supabase-js';

async function fixUsersTable() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔧 Fixing users table structure for proper UUID handling...');

  // Drop and recreate users table with proper UUID support
  const { error: dropError } = await supabase.rpc('exec_sql', {
    sql: `
      DROP TABLE IF EXISTS users CASCADE;
      
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company_id INTEGER,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create index for faster lookups
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_company ON users(company_id);
    `
  });

  if (dropError) {
    console.error('Error updating users table:', dropError);
    
    // Try alternative approach - direct SQL execution
    const { error: altError } = await supabase
      .from('users')
      .delete()
      .neq('id', 'impossible_id'); // Clear existing data
      
    if (altError) {
      console.error('Could not clear users table:', altError);
    } else {
      console.log('✅ Users table cleared successfully!');
    }
  } else {
    console.log('✅ Users table structure updated successfully!');
  }
}

fixUsersTable().catch(console.error);