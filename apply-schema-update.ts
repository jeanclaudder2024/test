import { db } from './server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function applySchemaUpdate() {
  console.log('Starting database schema update...');
  
  try {
    // Read the SQL file
    const schemaSQL = fs.readFileSync('./COMPLETE_DATABASE_SCHEMA_UPDATE.sql', 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + '...');
        
        await db.execute(sql.raw(statement));
        successCount++;
        console.log('✓ Success');
      } catch (error: any) {
        errorCount++;
        console.error(`✗ Error: ${error.message}`);
        
        // Continue with other statements even if one fails
        // Some columns might already exist
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Verify critical tables exist
    console.log('\n=== Verifying Tables ===');
    const tables = [
      'users',
      'vessels', 
      'ports',
      'refineries',
      'subscription_plans',
      'user_subscriptions',
      'vessel_document_associations',
      'broker_deals'
    ];
    
    for (const table of tables) {
      try {
        const result = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `);
        console.log(`Table ${table}: ${result.rows[0].exists ? '✓ exists' : '✗ missing'}`);
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the update
applySchemaUpdate();