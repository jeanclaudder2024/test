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
      // Try to get refineries from asistream API
      const asiRefineries = await asiStreamService.fetchRefineries();
      
      // Create refineries
      const createdRefineries: Refinery[] = [];
      for (const refinery of asiRefineries) {
        const created = await storage.createRefinery(refinery);
        createdRefineries.push(created);
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