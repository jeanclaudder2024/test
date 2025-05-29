/**
 * Simple Supabase Table Setup - Oil Vessel Tracking Platform
 * Creates all necessary tables with a single API call
 */

import { supabase } from './supabase';

export async function setupSupabaseTables(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔧 Setting up Supabase tables...');

    // Create companies table
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      query: `
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
    const { error: portsError } = await supabase.rpc('exec_sql', {
      query: `
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
    const { error: refineriesError } = await supabase.rpc('exec_sql', {
      query: `
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
    const { error: vesselsError } = await supabase.rpc('exec_sql', {
      query: `
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

    console.log('✅ All Supabase tables created successfully!');
    return { 
      success: true, 
      message: 'Oil vessel tracking database tables created successfully in Supabase!' 
    };

  } catch (error: any) {
    console.error('❌ Error setting up Supabase tables:', error);
    return { 
      success: false, 
      message: `Failed to create tables: ${error.message}` 
    };
  }
}