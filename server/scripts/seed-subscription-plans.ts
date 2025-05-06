import { db } from '../db';
import { subscriptionPlans } from '@shared/schema';

/**
 * Script to seed initial subscription plans in the database
 */
async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...');

  // First check if any plans exist
  const existingPlans = await db.select().from(subscriptionPlans);
  if (existingPlans.length > 0) {
    console.log(`Found ${existingPlans.length} existing plans. Skipping seeding.`);
    return { count: existingPlans.length, seeded: false };
  }

  // Basic Plan
  const basicPlan = {
    name: 'Basic',
    slug: 'basic',
    description: 'Essential tracking features for small operators',
    monthlyPriceId: 'price_basic_monthly', // These would be replaced with actual Stripe price IDs
    yearlyPriceId: 'price_basic_yearly',
    monthlyPrice: '49.99',
    yearlyPrice: '499.90',
    currency: 'usd',
    features: JSON.stringify([
      'Track up to 50 vessels',
      'Real-time vessel positions',
      'Basic reporting',
      'Email support',
      'Data export (CSV)',
    ]),
    isPopular: false,
    trialDays: 14,
    sortOrder: 1,
    isActive: true,
  };

  // Pro Plan
  const proPlan = {
    name: 'Professional',
    slug: 'pro',
    description: 'Advanced features for medium-sized fleets',
    monthlyPriceId: 'price_pro_monthly',
    yearlyPriceId: 'price_pro_yearly',
    monthlyPrice: '99.99',
    yearlyPrice: '999.90',
    currency: 'usd',
    features: JSON.stringify([
      'Track up to 200 vessels',
      'Real-time vessel positions',
      'Advanced analytics dashboard',
      'API access',
      'Priority email support',
      'Data export (CSV, JSON)',
      'Historical data (12 months)',
      'Custom alerts',
    ]),
    isPopular: true,
    trialDays: 14,
    sortOrder: 2,
    isActive: true,
  };

  // Enterprise Plan
  const enterprisePlan = {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Comprehensive solution for large operations',
    monthlyPriceId: 'price_enterprise_monthly',
    yearlyPriceId: 'price_enterprise_yearly',
    monthlyPrice: '249.99',
    yearlyPrice: '2499.90',
    currency: 'usd',
    features: JSON.stringify([
      'Unlimited vessel tracking',
      'Real-time vessel positions',
      'Enterprise analytics',
      'Full API access',
      '24/7 dedicated support',
      'Data export (all formats)',
      'Historical data (unlimited)',
      'Custom alerts and notifications',
      'White-label options',
      'Custom integrations',
      'Dedicated account manager',
    ]),
    isPopular: false,
    trialDays: 30,
    sortOrder: 3,
    isActive: true,
  };

  // Insert plans into database
  await db.insert(subscriptionPlans).values([basicPlan, proPlan, enterprisePlan]);
  console.log('Successfully seeded 3 subscription plans');
  
  return { count: 3, seeded: true };
}

export { seedSubscriptionPlans };