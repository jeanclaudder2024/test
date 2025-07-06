import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Client } = pkg;

async function createSuperAdminUser() {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash the password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if user already exists
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['superadmin@petrodealhub.com']
    );

    if (existingUserResult.rows.length > 0) {
      console.log('User superadmin@petrodealhub.com already exists');
      return;
    }

    // Insert new admin user
    const result = await client.query(
      `INSERT INTO users (email, password, role, firstName, lastName, createdAt, updatedAt) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, email, role`,
      ['superadmin@petrodealhub.com', hashedPassword, 'admin', 'Super', 'Admin']
    );

    console.log('✅ Successfully created superadmin user:', result.rows[0]);
    console.log('📧 Email: superadmin@petrodealhub.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error creating superadmin user:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createSuperAdminUser();