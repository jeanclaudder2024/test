import { storage } from "../storage";
import { InsertRefinery, Refinery } from "@shared/schema";
import { generateRefineryDataset } from "./refineryGenerator";

export const refineryService = {
  getAllRefineries: async () => {
    return storage.getRefineries();
  },

  getRefineryById: async (id: number) => {
    return storage.getRefineryById(id);
  },

  getRefineryByRegion: async (region: string) => {
    return storage.getRefineryByRegion(region);
  },

  createRefinery: async (refinery: InsertRefinery) => {
    return storage.createRefinery(refinery);
  },

  updateRefinery: async (id: number, refineryData: Partial<InsertRefinery>) => {
    return storage.updateRefinery(id, refineryData);
  },

  deleteRefinery: async (id: number) => {
    return storage.deleteRefinery(id);
  },

  // Seed data for development
  seedRefineryData: async () => {
    try {
      console.log("Checking existing refineries in database...");
      // First, get existing refineries
      const existingRefineries = await storage.getRefineries();
      
      // Check if we already have refineries in the database
      if (existingRefineries.length > 0) {
        console.log(`Database already contains ${existingRefineries.length} refineries.`);
        
        // Skip stats update - no stats table in current schema
        const activeRefineries = existingRefineries.filter(r => r.status === 'operational').length;
        
        return {
          refineries: existingRefineries.length,
          active: activeRefineries
        };
      }
      
      // Database empty, generate refineries from our dataset
      console.log("No refineries in database. Generating refinery data...");
      const refineries = generateRefineryDataset();
      console.log(`Generated ${refineries.length} refineries from dataset.`);
      
      // Create refineries
      const createdRefineries: Refinery[] = [];
      
      // Create a Set of keys to check for duplicates (name + country)
      const existingRefineryKeys = new Set();
      
      for (const refinery of refineries) {
        // Create a unique key for the refinery
        const refineryKey = `${refinery.name}|${refinery.country}`;
        
        // Skip if refinery already exists in this batch
        if (existingRefineryKeys.has(refineryKey)) {
          continue;
        }
        
        const created = await storage.createRefinery(refinery);
        createdRefineries.push(created);
        
        // Add to tracking Set to prevent adding duplicates in this batch
        existingRefineryKeys.add(refineryKey);
      }

      console.log(`Created ${createdRefineries.length} new refineries in database.`);

      // Skip stats update - no stats table in current schema
      const activeRefineries = createdRefineries.filter(r => r.status === 'operational').length;

      return {
        refineries: createdRefineries.length,
        active: activeRefineries
      };
    } catch (error) {
      console.error("Error seeding refinery data:", error);
      throw error;
    }
  }
};