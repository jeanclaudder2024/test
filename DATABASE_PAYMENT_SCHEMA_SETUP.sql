-- Database Setup for Payment Integration
-- Run these commands in your PostgreSQL database to enable payment processing

-- 1. Create user_subscriptions table for tracking active subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create payments table for tracking payment history
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    stripe_payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create payment_methods table for storing user payment information
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'card',
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create invoices table for tracking billing history
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    stripe_invoice_id TEXT UNIQUE,
    amount_paid DECIMAL(10,2) NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'draft',
    invoice_pdf TEXT,
    hosted_invoice_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add Stripe customer ID to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- 7. Update users table to have proper trial fields if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- Insert some test data if needed (optional)
-- Note: Make sure subscription_plans table exists first
DO $$
BEGIN
    -- Only insert if subscription_plans table is empty
    IF NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1) THEN
        INSERT INTO subscription_plans (name, description, price, currency, interval_type, features, trial_days)
        VALUES 
            ('Basic', 'Essential tracking features for small operators', 69.00, 'usd', 'month', 
             ARRAY['Track up to 50 vessels', 'Real-time vessel positions', 'Basic reporting', 'Email support'], 5),
            ('Professional', 'Advanced features for growing businesses', 150.00, 'usd', 'month',
             ARRAY['Track unlimited vessels', 'Advanced analytics', 'Document generation', 'Priority support', 'API access'], 5),
            ('Enterprise', 'Complete solution for large organizations', 399.00, 'usd', 'month',
             ARRAY['Everything in Professional', 'Custom integrations', 'Dedicated support', 'Advanced security', 'Multi-user access'], 5);
    END IF;
END
$$;

-- Success message
SELECT 'Payment integration database schema setup completed successfully!' as status;