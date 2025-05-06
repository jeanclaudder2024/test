// Script to migrate database schema to Supabase
import { supabase } from '../db';
import * as schema from '@shared/schema';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

/**
 * This script migrates schema and data from our old PostgreSQL database to Supabase
 */
async function migrateToSupabase() {
  console.log('Starting migration to Supabase...');
  try {
    // Connection to old database (needed to fetch existing data)
    let oldPoolConnected = false;
    let oldDb: any = null;

    try {
      if (process.env.DATABASE_URL) {
        // Only attempt connection if DATABASE_URL is available
        const neonConfig = { webSocketConstructor: ws };
        const oldPool = new Pool({ connectionString: process.env.DATABASE_URL });
        oldDb = drizzle({ client: oldPool, schema });
        oldPoolConnected = true;
        console.log('Successfully connected to old database for data migration');
      } else {
        console.log('No DATABASE_URL found, skipping data migration from old database');
      }
    } catch(err) {
      console.log('Failed to connect to old database:', err);
      console.log('Will create empty tables without migrating data');
    }

    // Create tables in the correct order to respect dependencies
    console.log('Creating tables...');
    
    // Users table
    await createTable('users', `
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      is_subscribed BOOLEAN,
      subscription_tier TEXT DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      provider TEXT,
      provider_id TEXT,
      photo_url TEXT,
      display_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Vessels table
    await createTable('vessels', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      imo TEXT NOT NULL UNIQUE,
      mmsi TEXT NOT NULL,
      vessel_type TEXT NOT NULL,
      flag TEXT NOT NULL,
      built INTEGER,
      deadweight INTEGER,
      current_lat DECIMAL(10, 6),
      current_lng DECIMAL(10, 6),
      departure_port TEXT,
      departure_date TIMESTAMP WITH TIME ZONE,
      departure_lat DECIMAL(10, 6),
      departure_lng DECIMAL(10, 6),
      destination_port TEXT,
      destination_lat DECIMAL(10, 6),
      destination_lng DECIMAL(10, 6),
      eta TIMESTAMP WITH TIME ZONE,
      cargo_type TEXT,
      cargo_capacity INTEGER,
      current_region TEXT,
      buyer_name TEXT DEFAULT 'NA',
      seller_name TEXT,
      metadata TEXT,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Refineries table
    await createTable('refineries', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      lat DECIMAL(10, 6) NOT NULL,
      lng DECIMAL(10, 6) NOT NULL,
      capacity INTEGER,
      status TEXT DEFAULT 'active',
      description TEXT
    `);

    // Ports table
    await createTable('ports', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      lat DECIMAL(10, 6) NOT NULL,
      lng DECIMAL(10, 6) NOT NULL,
      type TEXT DEFAULT 'commercial',
      capacity INTEGER,
      status TEXT DEFAULT 'active',
      description TEXT,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Progress Events table
    await createTable('progress_events', `
      id SERIAL PRIMARY KEY,
      vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      event TEXT NOT NULL,
      lat DECIMAL(10, 6),
      lng DECIMAL(10, 6),
      location TEXT
    `);

    // Documents table
    await createTable('documents', `
      id SERIAL PRIMARY KEY,
      vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expiry_date TIMESTAMP WITH TIME ZONE,
      reference TEXT,
      issuer TEXT,
      recipient_name TEXT,
      recipient_org TEXT,
      last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      language TEXT DEFAULT 'en',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Brokers table
    await createTable('brokers', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      country TEXT,
      active BOOLEAN DEFAULT TRUE,
      elite_member BOOLEAN DEFAULT FALSE,
      elite_member_since TIMESTAMP WITH TIME ZONE,
      elite_member_expires TIMESTAMP WITH TIME ZONE,
      membership_id TEXT,
      shipping_address TEXT,
      subscription_plan TEXT,
      last_login TIMESTAMP WITH TIME ZONE
    `);

    // Stats table
    await createTable('stats', `
      id SERIAL PRIMARY KEY,
      active_vessels INTEGER DEFAULT 0,
      total_cargo DECIMAL(15, 2) DEFAULT 0,
      active_refineries INTEGER DEFAULT 0,
      active_brokers INTEGER DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Companies table
    await createTable('companies', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT,
      region TEXT,
      headquarters TEXT,
      founded_year INTEGER,
      ceo TEXT,
      fleet_size INTEGER,
      specialization TEXT,
      website TEXT,
      logo TEXT,
      description TEXT,
      revenue DECIMAL(15, 2),
      employees INTEGER,
      publicly_traded BOOLEAN DEFAULT FALSE,
      stock_symbol TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Refinery-Port Connections table
    await createTable('refinery_port_connections', `
      id SERIAL PRIMARY KEY,
      refinery_id INTEGER NOT NULL REFERENCES refineries(id) ON DELETE CASCADE,
      port_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
      distance DECIMAL(10, 2),
      connection_type TEXT DEFAULT 'pipeline',
      capacity DECIMAL(15, 2),
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Subscription Plans table
    await createTable('subscription_plans', `
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      monthly_price_id TEXT NOT NULL,
      yearly_price_id TEXT NOT NULL,
      monthly_price DECIMAL(10, 2) NOT NULL,
      yearly_price DECIMAL(10, 2) NOT NULL,
      currency TEXT DEFAULT 'usd',
      features TEXT NOT NULL,
      is_popular BOOLEAN DEFAULT FALSE,
      trial_days INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Subscriptions table
    await createTable('subscriptions', `
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
      status TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_start TIMESTAMP WITH TIME ZONE,
      current_period_end TIMESTAMP WITH TIME ZONE,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      billing_interval TEXT NOT NULL DEFAULT 'month',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Payment Methods table
    await createTable('payment_methods', `
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_payment_method_id TEXT NOT NULL,
      type TEXT NOT NULL,
      brand TEXT,
      last4 TEXT,
      expiry_month INTEGER,
      expiry_year INTEGER,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Invoices table
    await createTable('invoices', `
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
      stripe_invoice_id TEXT NOT NULL,
      stripe_customer_id TEXT,
      amount DECIMAL(10, 2) NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT NOT NULL,
      billing_reason TEXT,
      invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
      period_start TIMESTAMP WITH TIME ZONE,
      period_end TIMESTAMP WITH TIME ZONE,
      pdf_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Set up RLS policies for Supabase
    await setupRowLevelSecurity();

    // Migrate data if we have connection to old database
    if (oldPoolConnected && oldDb) {
      console.log('Migrating data from old database...');
      await migrateData(oldDb);
    }

    console.log('Migration to Supabase completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Helper function to check if a table exists
async function createTable(tableName: string, tableDefinition: string) {
  console.log(`Checking if table ${tableName} exists...`);
  
  try {
    // Try to query the table
    const { error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist (error code for "relation does not exist")
      console.log(`Table ${tableName} doesn't exist, would create it with schema:`, tableDefinition);
      console.log(`NOTE: The free tier of Supabase doesn't allow creating tables via API.`);
      console.log(`Please create this table manually in the Supabase dashboard SQL editor.`);
    } else {
      console.log(`Table ${tableName} already exists, skipping creation.`);
    }
  } catch (err) {
    console.error(`Error checking table ${tableName}:`, err);
    console.log(`NOTE: Please create this table manually in the Supabase dashboard SQL editor with schema:`, tableDefinition);
  }
}

// Set up Row Level Security policies for Supabase tables
async function setupRowLevelSecurity() {
  console.log('For Row Level Security (RLS) policies setup:');
  console.log('NOTE: The free tier of Supabase does not allow executing SQL via the API.');
  console.log('Please set up RLS policies manually in the Supabase dashboard SQL editor:');
  
  // The tables that need RLS
  const tables = [
    'users', 'vessels', 'refineries', 'ports', 'progress_events', 
    'documents', 'brokers', 'stats', 'companies', 'refinery_port_connections',
    'subscription_plans', 'subscriptions', 'payment_methods', 'invoices'
  ];

  // Generate SQL for RLS setup
  for (const table of tables) {
    console.log(`-- RLS setup for table ${table}:`);
    console.log(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    console.log(`CREATE POLICY service_role_policy ON ${table}`);
    console.log(`  USING (auth.role() = 'service_role')`);
    console.log(`  WITH CHECK (auth.role() = 'service_role');`);
    console.log();
  }
  
  console.log('Please copy and execute the above SQL in your Supabase SQL Editor.');
}

// Migrate data from old database to Supabase
async function migrateData(oldDb: any) {
  // Tables to migrate in order (respecting foreign key constraints)
  const tablesToMigrate = [
    { name: 'users', oldTable: schema.users },
    { name: 'subscription_plans', oldTable: schema.subscriptionPlans },
    { name: 'vessels', oldTable: schema.vessels },
    { name: 'refineries', oldTable: schema.refineries },
    { name: 'ports', oldTable: schema.ports },
    { name: 'progress_events', oldTable: schema.progressEvents },
    { name: 'documents', oldTable: schema.documents },
    { name: 'brokers', oldTable: schema.brokers },
    { name: 'stats', oldTable: schema.stats },
    { name: 'companies', oldTable: schema.companies },
    { name: 'refinery_port_connections', oldTable: schema.refineryPortConnections },
    { name: 'subscriptions', oldTable: schema.subscriptions },
    { name: 'payment_methods', oldTable: schema.paymentMethods },
    { name: 'invoices', oldTable: schema.invoices }
  ];

  for (const table of tablesToMigrate) {
    try {
      console.log(`Migrating data for table: ${table.name}...`);

      // Get data from old database
      const oldData = await oldDb.select().from(table.oldTable);
      
      if (!oldData || oldData.length === 0) {
        console.log(`No data found in old database for table ${table.name}, skipping.`);
        continue;
      }
      
      console.log(`Found ${oldData.length} records in old database for table ${table.name}.`);

      // Check if target table already has data
      const { data: existingData, error: countError } = await supabase
        .from(table.name)
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error(`Error checking existing data for ${table.name}:`, countError);
      } else if (existingData && existingData.length > 0) {
        console.log(`Table ${table.name} already has data, skipping import.`);
        continue;
      }

      // Import in batches to avoid timeouts and payload size issues
      const batchSize = 50;
      let imported = 0;
      
      for (let i = 0; i < oldData.length; i += batchSize) {
        const batch = oldData.slice(i, i + batchSize);
        
        // Insert data into Supabase
        const { error: insertError } = await supabase
          .from(table.name)
          .insert(batch);
        
        if (insertError) {
          console.error(`Error inserting batch for ${table.name}:`, insertError);
        } else {
          imported += batch.length;
          console.log(`Imported ${imported}/${oldData.length} records for ${table.name}`);
        }
      }

      console.log(`Completed migration for table ${table.name}.`);
    } catch (error) {
      console.error(`Error migrating data for table ${table.name}:`, error);
    }
  }
}

// Run the migration
migrateToSupabase()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });