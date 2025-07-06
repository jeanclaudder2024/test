const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
console.log('=== ALTERNATIVE CONNECTION APPROACHES ===');

if (!databaseUrl) {
  console.log('❌ No DATABASE_URL found');
  process.exit(1);
}

// Parse the URL manually
const url = new URL(databaseUrl);

// Test 1: Different SSL configurations
async function testSSLConfigurations() {
  console.log('\n1. Testing different SSL configurations...');
  
  const baseConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.substring(1),
    user: url.username,
    password: decodeURIComponent(url.password)
  };

  const sslConfigs = [
    { ssl: false },
    { ssl: { rejectUnauthorized: false } },
    { ssl: { rejectUnauthorized: true } },
    { ssl: 'require' }
  ];

  for (let i = 0; i < sslConfigs.length; i++) {
    const config = { ...baseConfig, ...sslConfigs[i] };
    const client = new Client(config);
    
    try {
      console.log(`  Testing SSL config ${i + 1}:`, sslConfigs[i]);
      await client.connect();
      console.log(`  ✅ SSL config ${i + 1} worked!`);
      
      const result = await client.query('SELECT 1 as test');
      console.log(`  Query result:`, result.rows[0]);
      
      await client.end();
      return sslConfigs[i];
    } catch (error) {
      console.log(`  ❌ SSL config ${i + 1} failed:`, error.message.substring(0, 80) + '...');
    }
  }
  
  return null;
}

// Test 2: Connection with pg module options
async function testConnectionOptions() {
  console.log('\n2. Testing with connection options...');
  
  const config = {
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.substring(1),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
    // Additional options that might help with SASL
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000
  };

  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('  ✅ Connection with options worked!');
    
    const result = await client.query('SELECT version()');
    console.log('  Database version:', result.rows[0].version?.substring(0, 50) + '...');
    
    await client.end();
    return true;
  } catch (error) {
    console.log('  ❌ Connection with options failed:', error.message);
    return false;
  }
}

// Test 3: Raw connection string variations
async function testConnectionStringVariations() {
  console.log('\n3. Testing connection string variations...');
  
  // Remove the sslmode=require if present and add different SSL modes
  const baseUrl = databaseUrl.split('?')[0];
  
  const variations = [
    baseUrl + '?sslmode=disable',
    baseUrl + '?sslmode=allow',
    baseUrl + '?sslmode=prefer',
    baseUrl + '?sslmode=require',
    baseUrl + '?sslmode=verify-ca',
    baseUrl
  ];

  for (let i = 0; i < variations.length; i++) {
    const client = new Client({
      connectionString: variations[i],
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      console.log(`  Testing variation ${i + 1}:`, variations[i].split('?')[1] || 'no params');
      await client.connect();
      console.log(`  ✅ Variation ${i + 1} worked!`);
      
      await client.end();
      return variations[i];
    } catch (error) {
      console.log(`  ❌ Variation ${i + 1} failed:`, error.message.substring(0, 60) + '...');
    }
  }
  
  return null;
}

async function runAlternativeTests() {
  const sslResult = await testSSLConfigurations();
  const optionsResult = await testConnectionOptions();
  const stringResult = await testConnectionStringVariations();
  
  console.log('\n=== RESULTS ===');
  console.log('Working SSL config:', sslResult ? JSON.stringify(sslResult) : '❌ None worked');
  console.log('Connection options:', optionsResult ? '✅ Worked' : '❌ Failed');
  console.log('Connection string variation:', stringResult ? stringResult.split('?')[1] || 'default' : '❌ None worked');
  
  if (sslResult || optionsResult || stringResult) {
    console.log('\n🎉 Found working connection method!');
  } else {
    console.log('\n💥 All alternative methods failed.');
  }
}

runAlternativeTests().catch(console.error);