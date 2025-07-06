const { Client } = require('pg');
const { spawn } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;
console.log('Direct PostgreSQL connection test...');

if (!databaseUrl) {
  console.log('No DATABASE_URL found');
  process.exit(1);
}

// Parse URL
const url = new URL(databaseUrl);
console.log('Connection details:');
console.log('- Host:', url.hostname);
console.log('- Port:', url.port);
console.log('- Database:', url.pathname.substring(1));
console.log('- Username:', url.username);
console.log('- Password length:', url.password?.length || 0);

async function testDirectConnection() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\nAttempting direct connection...');
    await client.connect();
    console.log('✅ Direct connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time, VERSION() as version');
    console.log('Current time:', result.rows[0]?.current_time);
    console.log('PostgreSQL version:', result.rows[0]?.version?.substring(0, 50) + '...');
    
    await client.end();
    console.log('Connection closed successfully');
    return true;
  } catch (error) {
    console.log('❌ Direct connection failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Full error:', error.toString());
    return false;
  }
}

async function testPsqlCommand() {
  console.log('\nTesting psql command line connection...');
  
  return new Promise((resolve) => {
    const psql = spawn('psql', [databaseUrl, '-c', 'SELECT NOW();'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    psql.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    psql.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    psql.on('close', (code) => {
      if (code === 0) {
        console.log('✅ psql connection successful!');
        console.log('Output:', stdout.trim());
      } else {
        console.log('❌ psql connection failed with code:', code);
        console.log('Error output:', stderr.trim());
      }
      resolve(code === 0);
    });

    psql.on('error', (error) => {
      console.log('❌ psql command not available:', error.message);
      resolve(false);
    });
  });
}

async function runTests() {
  const directSuccess = await testDirectConnection();
  const psqlSuccess = await testPsqlCommand();
  
  console.log('\n=== Test Results ===');
  console.log('Direct connection:', directSuccess ? '✅ Success' : '❌ Failed');
  console.log('psql command:', psqlSuccess ? '✅ Success' : '❌ Failed');
  
  if (!directSuccess && !psqlSuccess) {
    console.log('\n🔍 Diagnosis: Database credentials or network connectivity issue');
    console.log('Recommendation: Check Supabase dashboard for correct connection string');
  }
}

runTests().catch(console.error);