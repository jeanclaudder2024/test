const postgres = require('postgres');

const databaseUrl = process.env.DATABASE_URL;
console.log('Testing database connection...');
console.log('Database URL exists:', !!databaseUrl);

if (!databaseUrl) {
  console.log('No DATABASE_URL found');
  process.exit(1);
}

// Parse URL manually
const url = new URL(databaseUrl);
console.log('Host:', url.hostname);
console.log('Port:', url.port);
console.log('Database:', url.pathname.substring(1));
console.log('Username:', url.username);
console.log('Password length:', url.password?.length || 0);

async function testConnection() {
  try {
    const sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1
    });
    
    console.log('Attempting to connect...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    console.log('Current time:', result[0]?.current_time);
    
    await sql.end();
    console.log('Connection closed');
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.toString());
  }
}

testConnection();