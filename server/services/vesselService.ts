import { storage } from "../storage";
import { InsertVessel, InsertProgressEvent, Vessel, ProgressEvent } from "@shared/schema";
import { dataService } from "./asiStreamService";
import { generateLargeVesselDataset } from "./vesselGenerator";

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
      console.log("Checking existing vessels in database...");
      // First, get existing vessels
      const existingVessels = await storage.getVessels();
      
      // Check if we already have vessels in the database
      if (existingVessels.length > 0) {
        console.log(`Database already contains ${existingVessels.length} vessels.`);
        
        // We already have vessels, just return stats
        const oilVessels = existingVessels.filter(v => {
          if (!v.vesselType) return false;
          const type = v.vesselType.toLowerCase();
          return (
            type.includes('oil') ||
            type.includes('tanker') ||
            type.includes('crude') ||
            type.includes('vlcc')
          );
        });
        
        // Calculate total cargo capacity
        let totalCargo = 0;
        existingVessels.forEach(vessel => {
          if (vessel.cargoCapacity) {
            totalCargo += vessel.cargoCapacity;
          }
        });
        
        // Update stats
        await storage.updateStats({ 
          activeVessels: existingVessels.length, 
          totalCargo 
        });
        
        return {
          vessels: existingVessels.length,
          oilVessels: oilVessels.length,
          totalCargo
        };
      }
      
      // Database empty, generate vessel dataset
      console.log("Generating large vessel dataset...");
      const vessels = generateLargeVesselDataset(1500);
      console.log(`Generated ${vessels.length} vessels.`);
      
      // Track created vessels and IMOs to avoid duplicates
      const createdVessels: Vessel[] = [];
      const usedImoNumbers = new Set<string>();
      
      // Generate progress events for multiple vessels
      console.log("Generating progress events...");
      const progressEvents: InsertProgressEvent[] = [];
      
      // Common event types
      const eventTypes = [
        "Departed from port",
        "Arrived at port",
        "Passed through strait",
        "Encountered heavy weather",
        "Changed course",
        "Refueling operation",
        "Security inspection",
        "Maintenance performed",
        "Cargo loading completed",
        "Cargo unloading completed",
        "Entered territorial waters",
        "Exited territorial waters",
        "Vessel passed checkpoint"
      ];
      
      // Generate events for the first 50 vessels
      const vesselCount = Math.min(50, createdVessels.length);
      console.log(`Generating events for ${vesselCount} vessels...`);
      
      for (let i = 0; i < vesselCount; i++) {
        const vessel = createdVessels[i];
        
        // Generate 1-5 random events per vessel
        const eventCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < eventCount; j++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const daysAgo = Math.floor(Math.random() * 30) + 1;
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() - daysAgo);
          
          // Use vessel's position with slight variation
          const latOffset = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
          const lngOffset = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
          
          const baseLat = parseFloat(vessel.currentLat);
          const baseLng = parseFloat(vessel.currentLng);
          
          const lat = Math.max(-85, Math.min(85, baseLat + latOffset)).toFixed(4);
          const lng = Math.max(-180, Math.min(180, baseLng + lngOffset)).toFixed(4);
          
          // Create event
          progressEvents.push({
            vesselId: vessel.id,
            date: eventDate,
            event: eventType,
            lat,
            lng,
            location: `${lat}° ${lat >= 0 ? 'N' : 'S'}, ${lng}° ${lng >= 0 ? 'E' : 'W'}`
          });
        }
      }
      
      console.log(`Generated ${progressEvents.length} progress events.`);

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
        totalCargo,
        activeVessels: createdVessels.length
      });

      return {
        vessels: createdVessels.length,
        oilVessels: createdVessels.filter(v => {
          if (!v.vesselType) return false;
          const type = v.vesselType.toLowerCase();
          return (
            type.includes('oil') ||
            type.includes('tanker') ||
            type.includes('crude') ||
            type.includes('vlcc')
          );
        }).length,
        totalCargo
      };
    } catch (error) {
      console.error("Error seeding vessel data:", error);
      throw error;
    }
  }
};