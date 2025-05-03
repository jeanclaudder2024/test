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
    duration: string,
    level: string
  ): Promise<{ success: boolean; message: string; broker?: Broker }> => {
    try {
      // Generate a membership ID
      const membershipId = `EB${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Set membership period based on duration
      const now = new Date();
      const expiryDate = new Date();
      
      // Parse duration - expected format '3' for 3 months, '12' for 12 months, etc.
      const months = parseInt(duration);
      if (isNaN(months) || months <= 0) {
        return {
          success: false,
          message: "Invalid duration specified. Please provide a valid number of months."
        };
      }
      
      expiryDate.setMonth(expiryDate.getMonth() + months);
      
      // Update broker with elite membership details
      const broker = await storage.updateBroker(brokerId, {
        eliteMember: true,
        eliteMemberSince: now,
        eliteMemberExpires: expiryDate,
        membershipId,
        subscriptionPlan: level
      });
      
      if (!broker) {
        return {
          success: false,
          message: "Failed to update broker. Broker not found."
        };
      }
      
      return {
        success: true,
        message: `Broker has been upgraded to Elite ${level} for ${months} months`,
        broker
      };
    } catch (error) {
      console.error(`Error upgrading broker ${brokerId} to elite membership:`, error);
      return {
        success: false,
        message: "Failed to upgrade broker to elite membership due to an internal error."
      };
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
  }
};
