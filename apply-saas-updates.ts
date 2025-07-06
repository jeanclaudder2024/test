import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function applySaasUpdates() {
  console.log('Starting SAAS schema updates...');
  
  try {
    // Update subscription_plans with ON CONFLICT handling
    console.log('Updating subscription_plans...');
    await db.execute(sql`
      INSERT INTO subscription_plans (
        name, slug, price_monthly, price_yearly, features, max_users, 
        max_vessels, max_documents, max_api_calls, api_rate_limit, 
        support_level, is_active, stripe_price_id_monthly, stripe_price_id_yearly, 
        description, highlight_features, popular, sort_order, created_at, updated_at
      ) VALUES
      ('Starter', 'starter', 2900, 29900, '{"Real-time vessel tracking", "Basic port information", "Standard document templates", "Email support", "5 tracked vessels", "10 documents/month", "Basic API access"}', 1, 5, 10, 1000, 60, 'email', true, 'price_1QfA8qRvB3zJdQZvXXXXXXXX', 'price_1QfA8qRvB3zJdQZvYYYYYYYY', 'Perfect for individual brokers and small operations', '{"Real-time tracking for 5 vessels", "Essential document templates", "Email support"}', false, 1, NOW(), NOW()),
      ('Professional', 'professional', 9900, 99900, '{"Everything in Starter", "Advanced vessel analytics", "Priority support", "Custom document templates", "API integrations", "25 tracked vessels", "100 documents/month", "Broker collaboration tools", "Deal management", "Market insights"}', 5, 25, 100, 10000, 120, 'priority', true, 'price_1QfA8qRvB3zJdQZvZZZZZZZZ', 'price_1QfA8qRvB3zJdQZvAAAAAAAA', 'Ideal for growing brokerage firms', '{"Track 25 vessels with analytics", "Priority 24/7 support", "Broker collaboration suite"}', true, 2, NOW(), NOW()),
      ('Enterprise', 'enterprise', 29900, 299900, '{"Everything in Professional", "Unlimited vessels", "Unlimited documents", "White-label options", "Dedicated account manager", "Custom integrations", "Advanced analytics", "Compliance tools", "Multi-currency support", "24/7 phone support", "Service Level Agreement (SLA)", "Advanced API access", "International Broker Membership", "Legal recognition and dispute protection"}', -1, -1, -1, -1, 1000, 'dedicated', true, 'price_1QfA8qRvB3zJdQZvBBBBBBBB', 'price_1QfA8qRvB3zJdQZvCCCCCCCC', 'Complete solution for large maritime operations', '{"Unlimited vessels & documents", "Dedicated account manager", "White-label options", "International Broker Membership"}', false, 3, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET
        slug = EXCLUDED.slug,
        price_monthly = EXCLUDED.price_monthly,
        price_yearly = EXCLUDED.price_yearly,
        features = EXCLUDED.features,
        max_users = EXCLUDED.max_users,
        max_vessels = EXCLUDED.max_vessels,
        max_documents = EXCLUDED.max_documents,
        max_api_calls = EXCLUDED.max_api_calls,
        api_rate_limit = EXCLUDED.api_rate_limit,
        support_level = EXCLUDED.support_level,
        is_active = EXCLUDED.is_active,
        stripe_price_id_monthly = EXCLUDED.stripe_price_id_monthly,
        stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly,
        description = EXCLUDED.description,
        highlight_features = EXCLUDED.highlight_features,
        popular = EXCLUDED.popular,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
    `);
    console.log('✓ Subscription plans updated');
    
    // Add missing columns to vessels table
    console.log('Adding missing columns to vessels table...');
    const vesselColumns = [
      'oil_type VARCHAR(255)',
      'quantity VARCHAR(255)',
      'price VARCHAR(255)',
      'deal_value VARCHAR(255)',
      'market_price VARCHAR(255)',
      'route_distance VARCHAR(255)',
      'broker_id INTEGER',
      'broker_rating DECIMAL(3,2)',
      'broker_commission VARCHAR(255)',
      'deal_status VARCHAR(50)',
      'payment_status VARCHAR(50)',
      'insurance_details TEXT',
      'survey_reports TEXT',
      'charter_party_details TEXT',
      'environmental_compliance TEXT',
      'special_requirements TEXT',
      'cargo_grade VARCHAR(100)',
      'loading_rate VARCHAR(100)',
      'discharge_rate VARCHAR(100)',
      'demurrage_rate VARCHAR(100)',
      'freight_rate VARCHAR(100)',
      'weather_conditions TEXT',
      'is_featured BOOLEAN DEFAULT false',
      'view_count INTEGER DEFAULT 0',
      'last_inspection_date DATE',
      'certificate_expiry DATE'
    ];
    
    for (const col of vesselColumns) {
      const colName = col.split(' ')[0];
      await db.execute(sql.raw(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS ${col}`));
    }
    console.log('✓ Vessel columns added');
    
    // Add missing columns to refineries table
    console.log('Adding missing columns to refineries table...');
    const refineryColumns = [
      'distillation_capacity VARCHAR(255)',
      'conversion_capacity VARCHAR(255)',
      'hydrogen_capacity VARCHAR(255)',
      'sulfur_recovery VARCHAR(255)',
      'crude_oil_sources TEXT',
      'processing_units TEXT',
      'storage_capacity VARCHAR(255)',
      'pipeline_connections TEXT',
      'shipping_terminals TEXT',
      'rail_connections TEXT',
      'truck_loading_bays VARCHAR(255)',
      'nearest_port VARCHAR(255)',
      'port_distance VARCHAR(255)',
      'investment_cost VARCHAR(255)',
      'operating_costs VARCHAR(255)',
      'revenue VARCHAR(255)',
      'profit_margin VARCHAR(255)',
      'market_share VARCHAR(255)',
      'environmental_certifications TEXT',
      'safety_record VARCHAR(255)',
      'workforce_size VARCHAR(255)',
      'annual_throughput VARCHAR(255)',
      'gasoline_yield VARCHAR(255)',
      'diesel_yield VARCHAR(255)',
      'jet_fuel_yield VARCHAR(255)',
      'other_products_yield VARCHAR(255)',
      'gasoline_specifications TEXT',
      'diesel_specifications TEXT',
      'jet_fuel_specifications TEXT',
      'other_products_specifications TEXT'
    ];
    
    for (const col of refineryColumns) {
      const colName = col.split(' ')[0];
      await db.execute(sql.raw(`ALTER TABLE refineries ADD COLUMN IF NOT EXISTS ${col}`));
    }
    console.log('✓ Refinery columns added');
    
    // Add missing columns to users table
    console.log('Adding missing columns to users table...');
    const userColumns = [
      'subscription_tier VARCHAR(50)',
      'is_subscribed BOOLEAN DEFAULT false',
      'trial_start_date TIMESTAMP WITH TIME ZONE',
      'trial_end_date TIMESTAMP WITH TIME ZONE',
      'billing_address TEXT',
      'company_name VARCHAR(255)',
      'company_type VARCHAR(100)',
      'phone_number VARCHAR(50)',
      'preferred_language VARCHAR(10) DEFAULT \'en\'',
      'timezone VARCHAR(50) DEFAULT \'UTC\'',
      'notification_preferences JSONB DEFAULT \'{}\'::jsonb',
      'last_login_at TIMESTAMP WITH TIME ZONE',
      'login_count INTEGER DEFAULT 0',
      'api_key VARCHAR(255)',
      'api_key_created_at TIMESTAMP WITH TIME ZONE',
      'two_factor_enabled BOOLEAN DEFAULT false',
      'two_factor_secret VARCHAR(255)'
    ];
    
    for (const col of userColumns) {
      const colName = col.split(' ')[0];
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col}`));
    }
    console.log('✓ User columns added');
    
    // Create missing tables
    console.log('Creating missing tables...');
    
    // Create vessel_document_associations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vessel_document_associations (
        id SERIAL PRIMARY KEY,
        vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
        document_id INTEGER,
        document_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        UNIQUE(vessel_id, document_id, document_type)
      )
    `);
    
    // Create user_subscriptions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_customer_id VARCHAR(255),
        current_period_start TIMESTAMP WITH TIME ZONE,
        current_period_end TIMESTAMP WITH TIME ZONE,
        cancel_at_period_end BOOLEAN DEFAULT false,
        billing_interval VARCHAR(20) DEFAULT 'monthly',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create usage_tracking table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        resource_type VARCHAR(50),
        resource_count INTEGER DEFAULT 0,
        period_start TIMESTAMP WITH TIME ZONE,
        period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create payment_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES user_subscriptions(id),
        stripe_payment_intent_id VARCHAR(255) UNIQUE,
        amount INTEGER,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(50),
        payment_method VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `);
    
    console.log('✓ All tables created');
    
    // Create indexes
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vessels_broker_id ON vessels(broker_id)',
      'CREATE INDEX IF NOT EXISTS idx_vessels_deal_status ON vessels(deal_status)',
      'CREATE INDEX IF NOT EXISTS idx_vessels_is_featured ON vessels(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)',
      'CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id)'
    ];
    
    for (const index of indexes) {
      await db.execute(sql.raw(index));
    }
    console.log('✓ All indexes created');
    
    console.log('✅ SAAS schema updates completed successfully!');
    
  } catch (error) {
    console.error('Error applying SAAS updates:', error);
    throw error;
  }
}

applySaasUpdates().catch(console.error);