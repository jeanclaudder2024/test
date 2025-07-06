const { Client } = require('pg');

async function checkOilTypes() {
  console.log('Checking oil types data...');
  
  const client = new Client({
    host: 'aws-0-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.fahvjksfkzmbsyvtktyk',
    password: 'PetroDealHubSupabase2025!',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check oil types data
    const result = await client.query('SELECT id, name, display_name, category, description FROM oil_types ORDER BY id');
    
    console.log(`\n🛢️ Oil Types in database (${result.rows.length} total):`);
    console.log('='.repeat(80));
    
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Name: ${row.name || 'NULL'}`);
      console.log(`Display Name: ${row.display_name || 'NULL'}`);
      console.log(`Category: ${row.category || 'NULL'}`);
      console.log(`Description: ${row.description || 'NULL'}`);
      console.log('-'.repeat(40));
    });
    
    // Check for missing display_name values
    const missingDisplayName = result.rows.filter(row => !row.display_name);
    if (missingDisplayName.length > 0) {
      console.log(`\n⚠️  ${missingDisplayName.length} oil types are missing display_name values`);
    } else {
      console.log('\n✅ All oil types have display_name values');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOilTypes().catch(console.error);