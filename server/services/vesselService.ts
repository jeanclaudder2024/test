import { storage } from "../storage";
import { InsertVessel, InsertProgressEvent, Vessel, ProgressEvent } from "@shared/schema";
import { asiStreamService } from "./asiStreamService";

export const vesselService = {
  getAllVessels: async () => {
    return storage.getVessels();
  },

  getVesselById: async (id: number) => {
    return storage.getVesselById(id);
  },

  getVesselsByRegion: async (region: string) => {
    return storage.getVesselsByRegion(region);
  },

  createVessel: async (vessel: InsertVessel) => {
    return storage.createVessel(vessel);
  },

  updateVessel: async (id: number, vesselData: Partial<InsertVessel>) => {
    return storage.updateVessel(id, vesselData);
  },

  deleteVessel: async (id: number) => {
    return storage.deleteVessel(id);
  },

  // Progress events
  getVesselProgressEvents: async (vesselId: number) => {
    return storage.getProgressEventsByVesselId(vesselId);
  },

  addProgressEvent: async (event: InsertProgressEvent) => {
    return storage.createProgressEvent(event);
  },

  deleteProgressEvent: async (id: number) => {
    return storage.deleteProgressEvent(id);
  },

  // Seed data for development
  seedVesselData: async () => {
    try {
      // Try to get vessels from asistream API
      const asiVessels = await asiStreamService.fetchVessels();
      
      // Create vessels
      const createdVessels: Vessel[] = [];
      for (const vessel of asiVessels) {
        const created = await storage.createVessel(vessel);
        createdVessels.push(created);
      }
      
      // Sample progress events for the first vessel
      const progressEvents: InsertProgressEvent[] = [
        {
          vesselId: 1,
          date: new Date("2023-03-24"),
          event: "Vessel passed Gibraltar Strait",
          lat: "36.1344",
          lng: "5.4548",
          location: "36.1344° N, 5.4548° W"
        },
        {
          vesselId: 1,
          date: new Date("2023-03-22"),
          event: "Vessel entered Mediterranean Sea",
          lat: "35.9375",
          lng: "14.3754",
          location: "35.9375° N, 14.3754° E"
        },
        {
          vesselId: 1,
          date: new Date("2023-03-18"),
          event: "Vessel passed Suez Canal",
          lat: "30.0286",
          lng: "32.5793",
          location: "30.0286° N, 32.5793° E"
        }
      ];

      // Create progress events
      for (const event of progressEvents) {
        await storage.createProgressEvent(event);
      }

      // Update stats with cargo info
      let totalCargo = 0;
      createdVessels.forEach(vessel => {
        if (vessel.cargoCapacity) {
          totalCargo += vessel.cargoCapacity;
        }
      });

      await storage.updateStats({ 
        totalCargo: totalCargo.toString(),
        activeVessels: createdVessels.length
      });

      return {
        vessels: createdVessels.length,
        progressEvents: progressEvents.length
      };
    } catch (error) {
      console.error("Error seeding vessel data:", error);
      throw error;
    }
  }
};