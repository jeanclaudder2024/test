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

  // Seed data for development - DISABLED to prevent automatic refinery seeding
  seedRefineryData: async () => {
    try {
      console.log("Checking existing refineries in database...");
      // First, get existing refineries
      const existingRefineries = await storage.getRefineries();
      
      // Skip stats update - no stats table in current schema
      const activeRefineries = existingRefineries.filter(r => r.status === 'operational').length;
      
      // DISABLED: Never automatically seed refineries to respect user deletions
      console.log(`Database contains ${existingRefineries.length} refineries. Automatic seeding disabled.`);
      
      return {
        refineries: existingRefineries.length,
        active: activeRefineries
      };
    } catch (error) {
      console.error("Error checking refinery data:", error);
      return {
        refineries: 0,
        active: 0
      };
    }
  }
};