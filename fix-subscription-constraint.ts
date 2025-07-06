// Fix subscription_plans unique constraint issue
import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function applyFix() {
  console.log('Applying unique constraint fix to subscription_plans table...');
  
  try {
    // Add unique constraint to subscription_plans.name column
    await db.execute(sql`
      ALTER TABLE subscription_plans 
      ADD CONSTRAINT subscription_plans_name_key UNIQUE (name)
    `);
    
    console.log('✓ Successfully added unique constraint to subscription_plans.name');
    
    // Now try to run the CHECK_AND_FIX_SUBSCRIPTION_TABLES.sql content
    console.log('\nRunning subscription tables check and fix...');
    
    // Check if plans exist
    const plans = await db.execute(sql`SELECT COUNT(*) as count FROM subscription_plans`);
    const planCount = plans[0]?.count || 0;
    console.log(`Found ${planCount} subscription plans`);
    
    if (planCount === 0) {
      console.log('Inserting subscription plans...');
      
      // Insert subscription plans with ON CONFLICT handling
      await db.execute(sql`
        INSERT INTO subscription_plans (name, features, price_monthly, price_yearly, active, created_at, updated_at)
        VALUES 
          ('Starter', '["Basic vessel tracking", "Up to 10 vessel searches per day", "Port & refinery data access", "Email support"]', 29, 299, true, NOW(), NOW()),
          ('Professional', '["Advanced vessel tracking & analytics", "Unlimited vessel searches", "AI-powered route optimization", "Document generation (up to 50/month)", "API access (1000 calls/day)", "Priority support", "Export data (CSV/Excel)"]', 99, 999, true, NOW(), NOW()),
          ('Enterprise', '["Everything in Professional", "Custom API limits", "Dedicated account manager", "Custom integrations", "White-label options", "24/7 phone support", "Unlimited document generation", "International Broker Membership", "Legal recognition and dispute protection"]', 299, 2999, true, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET
          features = EXCLUDED.features,
          price_monthly = EXCLUDED.price_monthly,
          price_yearly = EXCLUDED.price_yearly,
          active = EXCLUDED.active,
          updated_at = NOW()
      `);
      
      console.log('✓ Successfully inserted/updated subscription plans');
    }
    
    console.log('\nDatabase fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying fix:', error);
    process.exit(1);
  }
}

applyFix();