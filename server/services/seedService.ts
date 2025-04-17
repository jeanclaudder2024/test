import { storage } from '../storage';
import { InsertBroker } from '@shared/schema';

/**
 * Add seed data for brokers if no brokers exist
 */
export async function seedBrokers(): Promise<{ count: number, seeded: boolean }> {
  // Check if any brokers already exist
  const existingBrokers = await storage.getBrokers();
  if (existingBrokers && existingBrokers.length > 0) {
    console.log(`Database already contains ${existingBrokers.length} brokers.`);
    return { count: existingBrokers.length, seeded: false };
  }

  // Sample brokers data for seeding
  const brokers: InsertBroker[] = [
    {
      name: 'John Smith',
      company: 'OilTraders International',
      email: 'john.smith@oiltraders.com',
      phone: '+1 (555) 123-4567',
      country: 'United States',
      active: true,
      eliteMember: false
    },
    {
      name: 'Sarah Chen',
      company: 'Pacific Energy Partners',
      email: 'sarah.chen@pacificenergy.com',
      phone: '+65 9123 4567',
      country: 'Singapore',
      active: true,
      eliteMember: false
    },
    {
      name: 'Ahmed Al-Farsi',
      company: 'Gulf Petroleum Exchange',
      email: 'ahmed@gulfpetroleum.com',
      phone: '+971 50 123 4567',
      country: 'United Arab Emirates',
      active: true,
      eliteMember: true,
      eliteMemberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      eliteMemberExpires: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // 275 days in future
      membershipId: 'EB24601',
      shippingAddress: '123 Marina Tower, Dubai Marina, Dubai, UAE',
      subscriptionPlan: 'annual',
      lastLogin: new Date()
    },
    {
      name: 'Elena Petrova',
      company: 'EurAsian Trading Ltd',
      email: 'elena@eurasiantrading.com',
      phone: '+7 495 123 4567',
      country: 'Russia',
      active: true,
      eliteMember: false
    },
    {
      name: 'Carlos Mendoza',
      company: 'Latin American Petroleum',
      email: 'carlos@latampetroleum.com',
      phone: '+52 55 1234 5678',
      country: 'Mexico',
      active: true,
      eliteMember: false
    }
  ];

  console.log('Seeding broker data...');
  const createdBrokers = await Promise.all(
    brokers.map(broker => storage.createBroker(broker))
  );
  
  console.log(`Broker data seeded successfully: ${createdBrokers.length} brokers added.`);
  return { count: createdBrokers.length, seeded: true };
}