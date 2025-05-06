import { seedSubscriptionPlans } from './scripts/seed-subscription-plans';

async function main() {
  console.log('Starting subscription plans seeding process...');
  
  try {
    const result = await seedSubscriptionPlans();
    console.log('Subscription plans seeding completed:', result);
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
  }
}

main();