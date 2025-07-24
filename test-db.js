// Database connectivity test for production deployment
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is configured');
    
    // Test database connection by importing and running a simple query
    const { storage } = await import('./server/storage.js');
    
    console.log('🔄 Testing storage connection...');
    const users = await storage.getUsers();
    console.log(`✅ Database connection successful - ${users.length} users found`);
    
    console.log('🔄 Testing subscription plans...');
    const plans = await storage.getSubscriptionPlans();
    console.log(`✅ Subscription plans loaded - ${plans.length} plans available`);
    
    console.log('✅ All database tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('📝 Error details:', error);
    process.exit(1);
  }
}

testDatabaseConnection();