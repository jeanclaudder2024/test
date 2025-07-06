import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, userSubscriptions } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database...');

// Create postgres connection
const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function createAdminUser() {
  try {
    // Check if admin user already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@petrodealhub.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Update the admin user's password
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          role: 'admin'
        })
        .where(eq(users.email, 'admin@petrodealhub.com'));
      
      console.log('Admin password updated successfully!');
      console.log('Login credentials:');
      console.log('Email: admin@petrodealhub.com');
      console.log('Password: admin123');
      
    } else {
      console.log('Creating new admin user...');
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create the admin user
      const [newAdmin] = await db
        .insert(users)
        .values({
          email: 'admin@petrodealhub.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        })
        .returning();
      
      console.log('Admin user created successfully!');
      console.log('User ID:', newAdmin.id);
      
      // Create a subscription for the admin (with no trial end date for unlimited access)
      const trialStartDate = new Date();
      const trialEndDate = new Date('2099-12-31'); // Far future date for admin
      
      await db
        .insert(userSubscriptions)
        .values({
          userId: newAdmin.id,
          trialStartDate,
          trialEndDate,
          isActive: true,
          subscriptionTier: 'enterprise' // Admin gets enterprise tier
        });
      
      console.log('Admin subscription created successfully!');
      console.log('Login credentials:');
      console.log('Email: admin@petrodealhub.com');
      console.log('Password: admin123');
    }
    
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

// Run the script
createAdminUser();