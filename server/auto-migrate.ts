/**
 * Automatic Supabase Migration System
 * Runs SQL migrations automatically to create all tables
 */

import { supabase } from './supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function runAutoMigration(): Promise<boolean> {
  try {
    console.log('🚀 Starting automatic Supabase migration...');
    
    // Read the SQL migration file
    const migrationSQL = readFileSync(
      join(process.cwd(), 'server', 'supabase-migration.sql'), 
      'utf8'
    );
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} migration statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });
          
          if (error && !error.message?.includes('already exists')) {
            console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
          }
        } catch (err: any) {
          if (!err.message?.includes('already exists')) {
            console.warn(`⚠️ Statement ${i + 1} skipped:`, err.message);
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Alternative: Create tables directly using Supabase JavaScript API
export async function createTablesDirectly(): Promise<boolean> {
  try {
    console.log('🔧 Creating tables using direct SQL execution...');
    
    // Create companies table
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(100),
          region VARCHAR(100),
          description TEXT,
          website VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Create ports table
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ports (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(100) NOT NULL,
          region VARCHAR(100) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          port_type VARCHAR(100),
          capacity INTEGER,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Create refineries table
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS refineries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(100) NOT NULL,
          region VARCHAR(100) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          capacity INTEGER,
          products TEXT[],
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Create vessels table
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS vessels (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          mmsi VARCHAR(20) UNIQUE,
          imo VARCHAR(20) UNIQUE,
          vessel_type VARCHAR(100),
          flag VARCHAR(100),
          built INTEGER,
          deadweight INTEGER,
          cargo_capacity INTEGER,
          current_lat DECIMAL(10, 8),
          current_lng DECIMAL(11, 8),
          speed VARCHAR(20),
          status VARCHAR(100),
          departure_port INTEGER,
          destination_port INTEGER,
          departure_date TIMESTAMP,
          arrival_date TIMESTAMP,
          eta TIMESTAMP,
          company_id INTEGER,
          cargo_type VARCHAR(100),
          cargo_quantity INTEGER,
          oil_source VARCHAR(100),
          route_info TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    console.log('✅ Core tables created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
    return false;
  }
}

// Test database connection and create tables
export async function initializeSupabaseDatabase(): Promise<boolean> {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('vessels').select('count').limit(1);
    
    if (error && (error.message?.includes('relation "vessels" does not exist') || error.message?.includes('relation "public.vessels" does not exist'))) {
      console.log('📋 Tables need to be created. Creating now...');
      return await createTablesDirectly();
    }
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase database is ready and tables exist!');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}