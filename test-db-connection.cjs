const { Client } = require('pg');

// Test database connection directly
async function testConnection() {
  const client = new Client({
    host: 'aws-0-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.fahvjksfkzmbsyvtktyk',
    password: 'Jonny@2025@',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executed:', result.rows[0]);
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('📋 Available tables:', tables.rows.map(r => r.table_name));
    
    // Test vessel data
    const vessels = await client.query("SELECT COUNT(*) FROM vessels;");
    console.log('🚢 Vessel count:', vessels.rows[0].count);

    // Check oil_types table structure
    const oilTypesColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'oil_types' 
      ORDER BY ordinal_position
    `);
    console.log('🛢️ Oil types columns:', oilTypesColumns.rows.map(row => row.column_name));

    // Add display_name column if it doesn't exist
    try {
      await client.query('ALTER TABLE oil_types ADD COLUMN IF NOT EXISTS display_name TEXT');
      console.log('✅ Added display_name column to oil_types table');
    } catch (error) {
      console.log('⚠️ Column may already exist:', error.message);
    }

    // Count oil types
    const oilTypesCount = await client.query('SELECT COUNT(*) as count FROM oil_types');
    console.log('🛢️ Oil types count:', oilTypesCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();