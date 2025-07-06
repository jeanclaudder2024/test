import { Client } from 'pg';

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
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();