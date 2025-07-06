import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function updateUserTableForSubscriptions() {
  console.log("Starting user table subscription update...");
  
  try {
    // Add isSubscribed column
    console.log("Adding isSubscribed column...");
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false
    `);
    
    // Add subscriptionTier column
    console.log("Adding subscriptionTier column...");
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    `);
    
    // Add subscription_id column
    console.log("Adding subscription_id column...");
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES user_subscriptions(id)
    `);
    
    // Update admin users to have full access
    console.log("Updating admin users to have full access...");
    await db.execute(sql`
      UPDATE users 
      SET is_subscribed = true,
          subscription_tier = 'admin'
      WHERE role = 'admin'
    `);
    
    // Create function to check user access
    console.log("Creating check_user_access function...");
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION check_user_access(user_id INTEGER)
      RETURNS BOOLEAN AS $$
      DECLARE
          user_role TEXT;
          has_active_sub BOOLEAN;
      BEGIN
          -- Get user role
          SELECT role INTO user_role FROM users WHERE id = user_id;
          
          -- Admin users always have full access
          IF user_role = 'admin' THEN
              RETURN true;
          END IF;
          
          -- Check for active subscription
          SELECT EXISTS(
              SELECT 1 FROM user_subscriptions 
              WHERE user_id = user_id 
              AND status IN ('active', 'trial')
              AND (current_period_end IS NULL OR current_period_end > NOW())
          ) INTO has_active_sub;
          
          RETURN has_active_sub;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // Create trigger function
    console.log("Creating update_user_subscription_status function...");
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_user_subscription_status()
      RETURNS TRIGGER AS $$
      DECLARE
          plan_name TEXT;
      BEGIN
          -- Get the plan name
          SELECT name INTO plan_name FROM subscription_plans WHERE id = NEW.plan_id;
          
          -- Update user table based on subscription status
          IF NEW.status IN ('active', 'trial') THEN
              UPDATE users 
              SET is_subscribed = true,
                  subscription_tier = COALESCE(plan_name, 'basic'),
                  subscription_id = NEW.id
              WHERE id = NEW.user_id AND role != 'admin'; -- Don't change admin users
          ELSIF NEW.status IN ('canceled', 'past_due', 'unpaid') THEN
              UPDATE users 
              SET is_subscribed = false,
                  subscription_tier = 'free',
                  subscription_id = NULL
              WHERE id = NEW.user_id AND role != 'admin'; -- Don't change admin users
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // Create trigger
    console.log("Creating trigger...");
    await db.execute(sql`
      DROP TRIGGER IF EXISTS update_user_subscription_trigger ON user_subscriptions
    `);
    
    await db.execute(sql`
      CREATE TRIGGER update_user_subscription_trigger
      AFTER INSERT OR UPDATE ON user_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_user_subscription_status()
    `);
    
    // Update all existing users based on their current subscription status
    console.log("Updating existing users based on their subscription status...");
    await db.execute(sql`
      UPDATE users u
      SET is_subscribed = CASE 
          WHEN u.role = 'admin' THEN true
          WHEN EXISTS (
              SELECT 1 FROM user_subscriptions us 
              WHERE us.user_id = u.id 
              AND us.status IN ('active', 'trial')
              AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
          ) THEN true
          ELSE false
      END,
      subscription_tier = CASE
          WHEN u.role = 'admin' THEN 'admin'
          WHEN EXISTS (
              SELECT 1 FROM user_subscriptions us 
              JOIN subscription_plans sp ON us.plan_id = sp.id
              WHERE us.user_id = u.id 
              AND us.status IN ('active', 'trial')
              AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
          ) THEN (
              SELECT sp.name FROM user_subscriptions us 
              JOIN subscription_plans sp ON us.plan_id = sp.id
              WHERE us.user_id = u.id 
              AND us.status IN ('active', 'trial')
              AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
              ORDER BY us.created_at DESC
              LIMIT 1
          )
          ELSE 'free'
      END
    `);
    
    // Final update to ensure admin users always have admin tier
    console.log("Final update for admin users...");
    await db.execute(sql`
      UPDATE users
      SET is_subscribed = true,
          subscription_tier = 'admin'
      WHERE role = 'admin'
    `);
    
    console.log("✅ User table subscription update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating user table:", error);
    process.exit(1);
  }
}

updateUserTableForSubscriptions();