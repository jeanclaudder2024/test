-- Add Stripe payment method column to users table for automatic subscription renewal
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

-- Add index for payment method lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_payment_method_id ON users(stripe_payment_method_id);

-- Add comment
COMMENT ON COLUMN users.stripe_payment_method_id IS 'Stripe payment method ID for automatic subscription renewal after trial expires';