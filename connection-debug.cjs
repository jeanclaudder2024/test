const { Client } = require('pg');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
console.log('=== DATABASE CONNECTION DEBUG ===');

if (!databaseUrl) {
  console.log('❌ No DATABASE_URL found');
  process.exit(1);
}

// Parse the URL manually to avoid encoding issues
const url = new URL(databaseUrl);
const config = {
  host: url.hostname,
  port: parseInt(url.port),
  database: url.pathname.substring(1),
  user: url.username,
  password: decodeURIComponent(url.password),
  ssl: { rejectUnauthorized: false }
};

console.log('Connection config:');
console.log('- Host:', config.host);
console.log('- Port:', config.port);
console.log('- Database:', config.database);
console.log('- User:', config.user);
console.log('- Password:', config.password.substring(0, 5) + '...');

async function testClientConnection() {
  console.log('\n1. Testing direct Client connection...');
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Client connection successful!');
    
    const result = await client.query('SELECT version(), now()');
    console.log('Version:', result.rows[0].version?.substring(0, 50) + '...');
    console.log('Current time:', result.rows[0].now);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Client connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    return false;
  }
}

async function testPoolConnection() {
  console.log('\n2. Testing Pool connection...');
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ Pool connection successful!');
    
    const result = await client.query('SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('Public tables count:', result.rows[0].table_count);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Pool connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    return false;
  }
}

async function testConnectionString() {
  console.log('\n3. Testing original connection string...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connection string worked!');
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection string failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    return false;
  }
}

async function runAllTests() {
  const clientSuccess = await testClientConnection();
  const poolSuccess = await testPoolConnection();
  const stringSuccess = await testConnectionString();
  
  console.log('\n=== RESULTS ===');
  console.log('Direct Client:', clientSuccess ? '✅' : '❌');
  console.log('Pool Connection:', poolSuccess ? '✅' : '❌');
  console.log('Connection String:', stringSuccess ? '✅' : '❌');
  
  if (clientSuccess || poolSuccess || stringSuccess) {
    console.log('\n🎉 Database is accessible! Using working connection method.');
  } else {
    console.log('\n💥 All connection methods failed. Check credentials or network.');
  }
}

runAllTests().catch(console.error);