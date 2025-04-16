import { storage } from "../storage";
import { InsertRefinery, Refinery } from "@shared/schema";

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
    const refineries: InsertRefinery[] = [
      {
        name: "Port Arthur Refinery",
        country: "USA",
        region: "North America",
        lat: 29.8958,
        lng: -93.9636,
        capacity: 600000,
        status: "active"
      },
      {
        name: "Ras Tanura Refinery",
        country: "Saudi Arabia",
        region: "MEA",
        lat: 26.6444,
        lng: 50.1520,
        capacity: 550000,
        status: "active"
      },
      {
        name: "Rotterdam Refinery",
        country: "Netherlands",
        region: "Europe",
        lat: 51.9225,
        lng: 4.4792,
        capacity: 400000,
        status: "active"
      },
      {
        name: "Jamnagar Refinery",
        country: "India",
        region: "MEA",
        lat: 22.2806,
        lng: 69.0819,
        capacity: 1240000,
        status: "active"
      },
      {
        name: "Guangzhou Refinery",
        country: "China",
        region: "Asia",
        lat: 23.1375,
        lng: 113.2759,
        capacity: 270000,
        status: "maintenance"
      }
    ];

    const createdRefineries: Refinery[] = [];
    for (const refinery of refineries) {
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
  }
};
