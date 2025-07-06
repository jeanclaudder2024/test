const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
console.log('=== FIXED CONNECTION TEST FOR SUPABASE ===');

if (!databaseUrl) {
  console.log('❌ No DATABASE_URL found');
  process.exit(1);
}

// Parse the URL
const url = new URL(databaseUrl);

// Fix for Supabase SASL authentication issues
async function testSupabaseFixedConnection() {
  console.log('\n1. Testing Supabase fixed connection with proper SASL config...');
  
  const config = {
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.substring(1),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { 
      rejectUnauthorized: false,
      ca: false,
      key: false,
      cert: false
    },
    // Additional SASL fix parameters
    options: '--search_path=public',
    application_name: 'petrodealhub-app',
    connect_timeout: 60,
    command_timeout: 60,
    statement_timeout: 60000,
    query_timeout: 60000,
    idle_in_transaction_session_timeout: 60000
  };

  const client = new Client(config);
  
  try {
    console.log('  Attempting connection with SASL fix...');
    await client.connect();
    console.log('  ✅ SASL fixed connection successful!');
    
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('  Database:', result.rows[0].current_database);
    console.log('  User:', result.rows[0].current_user);
    
    // Test basic table query
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);
    console.log('  Sample tables:', tablesResult.rows.map(r => r.table_name));
    
    await client.end();
    return true;
  } catch (error) {
    console.log('  ❌ SASL fixed connection failed:', error.message);
    return false;
  }
}

// Test connection with minimal config (sometimes works better)
async function testMinimalConnection() {
  console.log('\n2. Testing minimal connection config...');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: false // Try without SSL first
  });
  
  try {
    await client.connect();
    console.log('  ✅ Minimal connection (no SSL) successful!');
    await client.end();
    return true;
  } catch (error) {
    console.log('  ❌ Minimal connection failed:', error.message.substring(0, 80) + '...');
    
    // Try with SSL
    const sslClient = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await sslClient.connect();
      console.log('  ✅ Minimal connection (with SSL) successful!');
      await sslClient.end();
      return true;
    } catch (sslError) {
      console.log('  ❌ Minimal SSL connection failed:', sslError.message.substring(0, 80) + '...');
      return false;
    }
  }
}

// Test the exact format that works with Supabase
async function testSupabaseDirectFormat() {
  console.log('\n3. Testing Supabase direct format...');
  
  // Extract components and rebuild without potential encoding issues
  const host = url.hostname;
  const port = url.port;
  const database = url.pathname.substring(1);
  const username = url.username;
  const password = url.password; // Keep encoded

  const directUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?sslmode=require`;
  
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('  Using reconstructed URL format...');
    await client.connect();
    console.log('  ✅ Supabase direct format successful!');
    
    const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('  Public tables found:', result.rows[0].table_count);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('  ❌ Supabase direct format failed:', error.message);
    return false;
  }
}

async function runFixedTests() {
  const supabaseFixed = await testSupabaseFixedConnection();
  const minimal = await testMinimalConnection();
  const direct = await testSupabaseDirectFormat();
  
  console.log('\n=== RESULTS ===');
  console.log('Supabase SASL Fix:', supabaseFixed ? '✅ WORKING' : '❌ Failed');
  console.log('Minimal Config:', minimal ? '✅ WORKING' : '❌ Failed');
  console.log('Direct Format:', direct ? '✅ WORKING' : '❌ Failed');
  
  if (supabaseFixed || minimal || direct) {
    console.log('\n🎉 FOUND WORKING CONNECTION METHOD!');
    console.log('The database is accessible, proceeding with application startup...');
  } else {
    console.log('\n💥 All connection methods still failing.');
    console.log('This appears to be a Supabase SASL authentication protocol issue.');
  }
}

runFixedTests().catch(console.error);