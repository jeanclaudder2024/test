import { storage } from "../storage";
import { InsertRefinery, Refinery } from "@shared/schema";
import { asiStreamService } from "./asiStreamService";

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
      // First, get existing refineries
      const existingRefineries = await storage.getRefineries();
      
      // Try to get refineries from asistream API
      const asiRefineries = await asiStreamService.fetchRefineries();
      
      // Create refineries (avoid duplicates by name and location)
      const createdRefineries: Refinery[] = [];
      
      // Create a Set of keys to check for duplicates (name + country)
      const existingRefineryKeys = new Set();
      existingRefineries.forEach(r => {
        existingRefineryKeys.add(`${r.name}|${r.country}`);
      });
      
      for (const refinery of asiRefineries) {
        // Create a unique key for the refinery
        const refineryKey = `${refinery.name}|${refinery.country}`;
        
        // Skip if refinery already exists
        if (existingRefineryKeys.has(refineryKey)) {
          continue;
        }
        
        const created = await storage.createRefinery(refinery);
        createdRefineries.push(created);
        
        // Add to tracking Set to prevent adding duplicates in this batch
        existingRefineryKeys.add(refineryKey);
      }

      // Update stats
      const activeRefineries = createdRefineries.filter(r => r.status === 'active').length;
      await storage.updateStats({ activeRefineries });

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