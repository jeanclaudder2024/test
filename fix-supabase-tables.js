/**
 * Fix Supabase table structure to match schema
 */

import { db } from './server/db.js';

async function fixSupabaseTables() {
  try {
    console.log('🔧 Fixing Supabase table structures...');
    
    // Add missing columns to refineries table
    console.log('Adding missing columns to refineries table...');
    
    const refineryColumns = [
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS operator TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS owner TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS type TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS products TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS year_built INTEGER',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS last_maintenance TIMESTAMP',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS next_maintenance TIMESTAMP',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS complexity DECIMAL(10,2)',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS email TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS phone TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS website TEXT',
      'ALTER TABLE refineries ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW()'
    ];
    
    // Add missing vessel_refinery_connections table
    console.log('Creating vessel_refinery_connections table...');
    
    const vesselRefineryTable = `
      CREATE TABLE IF NOT EXISTS vessel_refinery_connections (
        id SERIAL PRIMARY KEY,
        vessel_id INTEGER REFERENCES vessels(id),
        refinery_id INTEGER REFERENCES refineries(id),
        status TEXT,
        connection_type TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        cargo_type TEXT,
        cargo_volume TEXT,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Execute all SQL commands
    for (const sql of refineryColumns) {
      await db.execute(sql);
      console.log(`✅ Executed: ${sql}`);
    }
    
    await db.execute(vesselRefineryTable);
    console.log('✅ Created vessel_refinery_connections table');
    
    console.log('🎉 All table structures fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing tables:', error);
  }
}

// Run the fix
fixSupabaseTables()
  .then(() => {
    console.log('✅ Database structure update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });