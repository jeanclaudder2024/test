import { storage } from '../storage';
import { Broker, InsertBroker } from '@shared/schema';

/**
 * Service for managing brokers and elite membership functionality
 */
export const brokerService = {
  /**
   * Get all brokers
   */
  getBrokers: async (): Promise<Broker[]> => {
    try {
      return await storage.getBrokers();
    } catch (error) {
      console.error("Error fetching brokers:", error);
      throw new Error("Failed to retrieve brokers");
    }
  },

  /**
   * Get broker by ID
   */
  getBrokerById: async (id: number): Promise<Broker | undefined> => {
    try {
      return await storage.getBrokerById(id);
    } catch (error) {
      console.error(`Error fetching broker with ID ${id}:`, error);
      throw new Error("Failed to retrieve broker");
    }
  },

  /**
   * Create a new broker
   */
  createBroker: async (broker: InsertBroker): Promise<Broker> => {
    try {
      return await storage.createBroker(broker);
    } catch (error) {
      console.error("Error creating broker:", error);
      throw new Error("Failed to create broker");
    }
  },

  /**
   * Update broker information
   */
  updateBroker: async (id: number, broker: Partial<InsertBroker>): Promise<Broker | undefined> => {
    try {
      return await storage.updateBroker(id, broker);
    } catch (error) {
      console.error(`Error updating broker with ID ${id}:`, error);
      throw new Error("Failed to update broker");
    }
  },

  /**
   * Delete a broker
   */
  deleteBroker: async (id: number): Promise<boolean> => {
    try {
      return await storage.deleteBroker(id);
    } catch (error) {
      console.error(`Error deleting broker with ID ${id}:`, error);
      throw new Error("Failed to delete broker");
    }
  },

  /**
   * Upgrade a broker to elite membership
   */
  upgradeToEliteMembership: async (
    brokerId: number, 
    subscription: 'monthly' | 'annual',
    shippingAddress: string
  ): Promise<Broker | undefined> => {
    try {
      // Generate a membership ID
      const membershipId = `EB${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Set membership period based on subscription type
      const now = new Date();
      const expiryDate = new Date();
      if (subscription === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      // Update broker with elite membership details
      return await storage.updateBroker(brokerId, {
        eliteMember: true,
        eliteMemberSince: now,
        eliteMemberExpires: expiryDate,
        membershipId,
        shippingAddress,
        subscriptionPlan: subscription
      });
    } catch (error) {
      console.error(`Error upgrading broker ${brokerId} to elite membership:`, error);
      throw new Error("Failed to upgrade broker to elite membership");
    }
  },
  
  /**
   * Check if a broker has active elite membership
   */
  hasActiveEliteMembership: async (brokerId: number): Promise<boolean> => {
    try {
      const broker = await storage.getBrokerById(brokerId);
      if (!broker || !broker.eliteMember) return false;
      
      // Check if membership is still valid
      if (broker.eliteMemberExpires) {
        const now = new Date();
        const expiryDate = new Date(broker.eliteMemberExpires);
        return expiryDate > now;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking elite membership for broker ${brokerId}:`, error);
      return false;
    }
  },
  
  /**
   * Renew an existing elite membership
   */
  renewEliteMembership: async (
    brokerId: number, 
    subscription: 'monthly' | 'annual'
  ): Promise<Broker | undefined> => {
    try {
      const broker = await storage.getBrokerById(brokerId);
      if (!broker) throw new Error("Broker not found");
      
      // Calculate new expiry date, extending from current expiry if still valid
      let expiryDate = new Date();
      if (broker.eliteMemberExpires && new Date(broker.eliteMemberExpires) > new Date()) {
        expiryDate = new Date(broker.eliteMemberExpires);
      }
      
      if (subscription === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      // Update membership details
      return await storage.updateBroker(brokerId, {
        eliteMember: true,
        eliteMemberExpires: expiryDate,
        subscriptionPlan: subscription
      });
    } catch (error) {
      console.error(`Error renewing elite membership for broker ${brokerId}:`, error);
      throw new Error("Failed to renew elite membership");
    }
  },

  /**
   * Seed broker data for testing
   */
  seedBrokers: async (count: number = 20): Promise<{ added: number }> => {
    try {
      const companies = [
        "OilTrade International", "Petrochem Brokers Ltd.", "Global Crude Partners",
        "Maritime Oil Solutions", "Oceanic Energy Trading", "EastWest Petroleum",
        "Atlas Shipping & Trading", "Gulf Stream Brokers", "Pacific Rim Energy",
        "Continental Oil Exchange", "Petroleum Alliance Group", "Caspian Trading Co.",
        "BlackGold Trading", "Blue Ocean Energy", "Northern Star Brokers",
        "Royal Crude Brokers", "Sterling Petroleum", "Titan Energy Partners",
        "United Maritime Traders", "Vanguard Oil Brokers"
      ];
      
      const countries = [
        "United States", "United Kingdom", "Saudi Arabia", "UAE", "Russia",
        "Singapore", "Norway", "Netherlands", "Japan", "China"
      ];
      
      const brokers = [];
      
      for (let i = 0; i < count; i++) {
        const firstName = ["James", "Mohammed", "John", "Alexander", "Wei", "Sergei", 
                          "Hans", "Carlos", "Raj", "Michael"][Math.floor(Math.random() * 10)];
        const lastName = ["Smith", "Al-Saud", "Johnson", "Ivanov", "Chen", "Müller", 
                         "Garcia", "Patel", "Anderson", "Kim"][Math.floor(Math.random() * 10)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`;
        const company = companies[i % companies.length];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const phone = `+${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
        
        brokers.push({
          name,
          email,
          company,
          country,
          phone,
          active: true,
          eliteMember: Math.random() > 0.7, // 30% are elite members
          eliteMemberSince: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 31536000000) : null, // random date within last year
          eliteMemberExpires: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 31536000000) : null, // random date within next year
          subscriptionPlan: Math.random() > 0.5 ? "annual" : "monthly",
          shippingAddress: Math.random() > 0.7 ? `${Math.floor(Math.random() * 1000) + 1} Business Ave, Suite ${Math.floor(Math.random() * 500) + 100}, Major City` : null,
          lastLogin: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 604800000) : null // random date within last week
        });
      }
      
      let added = 0;
      for (const broker of brokers) {
        await storage.createBroker(broker);
        added++;
      }
      
      return { added };
    } catch (error) {
      console.error("Error seeding brokers:", error);
      throw new Error("Failed to seed broker data");
    }
  }
};
