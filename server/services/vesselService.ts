import { storage } from "../storage";
import { InsertVessel, InsertProgressEvent, Vessel, ProgressEvent } from "@shared/schema";
import { dataService } from "./asiStreamService";
import { generateLargeVesselDataset, isCoordinateAtSea } from "./vesselGenerator";
import { OIL_PRODUCT_TYPES } from "@shared/constants";
import { marineTrafficService } from "./marineTrafficService";
import { REGIONS } from "@shared/constants";

export const vesselService = {
  // Use the exported function from vesselGenerator to check if coordinates are at sea
  isCoordinateAtSea,
  
  getAllVessels: async () => {
    try {
      // First try to get vessels from the database
      return await storage.getVessels();
    } catch (dbError) {
      console.warn("Database error getting vessels, using API fallback:", dbError);
      
      // If database access fails, try to get vessels from MyShipTracking API
      if (marineTrafficService.isConfigured()) {
        try {
          return await marineTrafficService.fetchVessels();
        } catch (apiError) {
          console.error("Failed to fetch vessels from API:", apiError);
          throw new Error("Failed to get vessels from database or API");
        }
      } else {
        console.error("Database inaccessible and MyShipTracking API not configured");
        throw new Error("Database inaccessible and MyShipTracking API not configured");
      }
    }
  },

  getVesselById: async (id: number) => {
    try {
      // Try to get the vessel from database first
      return await storage.getVesselById(id);
    } catch (dbError) {
      console.warn(`Database error getting vessel ${id}, using API fallback:`, dbError);
      
      // If database access fails, try to get all vessels from API and find the matching one
      if (marineTrafficService.isConfigured()) {
        try {
          const allVessels = await marineTrafficService.fetchVessels();
          return allVessels.find(v => v.id === id);
        } catch (apiError) {
          console.error("Failed to fetch vessel from API:", apiError);
          throw new Error(`Failed to get vessel ${id} from database or API`);
        }
      } else {
        console.error("Database inaccessible and MyShipTracking API not configured");
        throw new Error("Database inaccessible and MyShipTracking API not configured");
      }
    }
  },

  getVesselsByRegion: async (region: string) => {
    try {
      // Try to get vessels by region from database first
      return await storage.getVesselsByRegion(region);
    } catch (dbError) {
      console.warn(`Database error getting vessels in region ${region}, using API fallback:`, dbError);
      
      // If database access fails, try to get all vessels from API and filter by region
      if (marineTrafficService.isConfigured()) {
        try {
          const allVessels = await marineTrafficService.fetchVessels();
          return allVessels.filter(v => v.currentRegion === region);
        } catch (apiError) {
          console.error("Failed to fetch vessels from API:", apiError);
          throw new Error(`Failed to get vessels in region ${region} from database or API`);
        }
      } else {
        console.error("Database inaccessible and MyShipTracking API not configured");
        throw new Error("Database inaccessible and MyShipTracking API not configured");
      }
    }
  },

  createVessel: async (vessel: InsertVessel) => {
    return storage.createVessel(vessel);
  },

  updateVessel: async (id: number, vesselData: Partial<InsertVessel>) => {
    return storage.updateVessel(id, vesselData);
  },
  
  // Ensure all vessels have destinations assigned
  ensureVesselDestinations: async () => {
    try {
      // Get all vessels without destinations
      const allVessels = await storage.getVessels();
      const vesselsWithoutDestination = allVessels.filter(v => !v.destinationPort || v.destinationPort === '');
      
      if (vesselsWithoutDestination.length === 0) {
        console.log("All vessels already have destinations assigned.");
        return { updated: 0, total: allVessels.length };
      }
      
      console.log(`Found ${vesselsWithoutDestination.length} vessels without destinations. Assigning refinery destinations...`);
      
      // Get all refineries to use for destinations
      const refineries = await storage.getRefineries();
      if (refineries.length === 0) {
        console.log("No refineries found. Cannot assign refinery destinations.");
        return { updated: 0, total: allVessels.length };
      }
      
      let updatedCount = 0;
      
      // Assign random refineries to vessels without destinations
      for (const vessel of vesselsWithoutDestination) {
        try {
          // Select a random refinery that's in the same region if possible
          let matchingRefineries = refineries.filter(r => r.region === vessel.currentRegion);
          
          // If no refineries in the vessel's region, use any refinery
          if (matchingRefineries.length === 0) {
            matchingRefineries = refineries;
          }
          
          const randomRefinery = matchingRefineries[Math.floor(Math.random() * matchingRefineries.length)];
          const destinationPort = `REF:${randomRefinery.id}:${randomRefinery.name}`;
          
          // Ensure ETA is set
          let eta = vessel.eta;
          if (!eta) {
            const now = new Date();
            const futureOffset = Math.floor(Math.random() * 30) + 5; // 5-35 days in future
            const etaDate = new Date(now);
            etaDate.setDate(etaDate.getDate() + futureOffset);
            eta = etaDate;
          }
          
          // Update the vessel
          await storage.updateVessel(vessel.id, { 
            destinationPort, 
            eta 
          });
          
          updatedCount++;
        } catch (err) {
          console.error(`Error updating vessel ${vessel.id}:`, err);
        }
      }
      
      console.log(`Updated ${updatedCount} vessels with refinery destinations.`);
      return { updated: updatedCount, total: allVessels.length };
    } catch (error) {
      console.error("Error ensuring vessel destinations:", error);
      throw error;
    }
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
  
  // Get vessel counts by region
  getVesselCountsByRegion: async () => {
    try {
      // Function to identify oil vessels
      const isOilVessel = (v: Vessel) => {
        if (!v.vesselType) return false;
        const type = v.vesselType.toLowerCase();
        return (
          type.includes('oil') ||
          type.includes('tanker') ||
          type.includes('crude') ||
          type.includes('vlcc')
        );
      };
    
      // First try to get vessels from database
      try {
        const vessels = await storage.getVessels();
        
        // Group vessels by region
        const regionCounts: Record<string, number> = {};
        const oilVesselRegionCounts: Record<string, number> = {};
        let totalVessels = 0;
        let totalOilVessels = 0;
        
        // Count vessels by region
        for (const vessel of vessels) {
          if (!vessel.currentRegion) continue;
          
          // Count total vessels by region
          totalVessels++;
          if (!regionCounts[vessel.currentRegion]) {
            regionCounts[vessel.currentRegion] = 0;
          }
          regionCounts[vessel.currentRegion]++;
          
          // Count oil vessels by region
          if (isOilVessel(vessel)) {
            totalOilVessels++;
            if (!oilVesselRegionCounts[vessel.currentRegion]) {
              oilVesselRegionCounts[vessel.currentRegion] = 0;
            }
            oilVesselRegionCounts[vessel.currentRegion]++;
          }
        }
        
        return {
          totalVessels,
          totalOilVessels,
          regionCounts,
          oilVesselRegionCounts
        };
      } catch (dbError) {
        console.warn("Database error counting vessels by region, trying API fallback:", dbError);
        
        // If database access fails, try MyShipTracking API
        if (marineTrafficService.isConfigured()) {
          const vessels = await marineTrafficService.fetchVessels();
          
          // Group vessels by region
          const regionCounts: Record<string, number> = {};
          const oilVesselRegionCounts: Record<string, number> = {};
          let totalVessels = 0;
          let totalOilVessels = 0;
          
          // Count vessels by region
          for (const vessel of vessels) {
            if (!vessel.currentRegion) continue;
            
            // Count total vessels by region
            totalVessels++;
            if (!regionCounts[vessel.currentRegion]) {
              regionCounts[vessel.currentRegion] = 0;
            }
            regionCounts[vessel.currentRegion]++;
            
            // Count oil vessels by region
            if (isOilVessel(vessel)) {
              totalOilVessels++;
              if (!oilVesselRegionCounts[vessel.currentRegion]) {
                oilVesselRegionCounts[vessel.currentRegion] = 0;
              }
              oilVesselRegionCounts[vessel.currentRegion]++;
            }
          }
          
          return {
            totalVessels,
            totalOilVessels,
            regionCounts,
            oilVesselRegionCounts
          };
        } else {
          // If API is not configured, throw an error
          throw new Error("Database inaccessible and MyShipTracking API not configured");
        }
      }
    } catch (error) {
      console.error("Error getting vessel counts by region:", error);
      throw error;
    }
  },

  // Seed data for development
  seedVesselData: async (forceRefresh: boolean = false) => {
    try {
      console.log("Checking existing vessels in database...");
      // First, get existing vessels
      const existingVessels = await storage.getVessels();
      
      // Check if we already have vessels in the database and not forcing refresh
      if (existingVessels.length > 0 && !forceRefresh) {
        console.log(`Database already contains ${existingVessels.length} vessels.`);
        
        // We already have vessels, just return stats
        const oilVessels = existingVessels.filter(v => {
          // Check if vessel has a cargo type that matches any of the oil product types
          return v.cargoType && OIL_PRODUCT_TYPES.includes(v.cargoType);
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
          totalCargo: totalCargo.toString() // Convert to string for schema compatibility
        });
        
        return {
          vessels: existingVessels.length,
          oilVessels: oilVessels.length,
          totalCargo
        };
      }
      
      // Database empty or forcing refresh, generate vessel dataset
      if (forceRefresh && existingVessels.length > 0) {
        console.log("Forcing refresh of vessel data...");
        // Delete all existing vessels
        for (const vessel of existingVessels) {
          await storage.deleteVessel(vessel.id);
        }
        console.log(`Deleted ${existingVessels.length} existing vessels.`);
      }
      
      // First, get all refineries to use for destinations
      console.log("Getting refineries for destination assignments...");
      const refineries = await storage.getRefineries();
      if (refineries.length === 0) {
        console.log("No refineries found. Please seed refineries first.");
      } else {
        console.log(`Found ${refineries.length} refineries for destination assignment.`);
      }
      
      console.log("Generating large vessel dataset...");
      const vessels = generateLargeVesselDataset(2500); // Increased from 1500 to 2500
      console.log(`Generated ${vessels.length} vessels.`);
      
      // Track created vessels and IMOs to avoid duplicates
      const createdVessels: Vessel[] = [];
      const usedImoNumbers = new Set<string>();
      
      // Save vessels to database
      for (const vessel of vessels) {
        try {
          // Skip vessels with IMO numbers we've already processed to avoid duplicates
          if (usedImoNumbers.has(vessel.imo)) continue;
          
          // Add this IMO to our tracking set
          usedImoNumbers.add(vessel.imo);
          
          // Ensure vessel has a destination (assign a refinery randomly if refineries exist)
          if ((!vessel.destinationPort || vessel.destinationPort === '') && refineries.length > 0) {
            // Assign a random refinery as destination (use REF:id:name format)
            const randomRefinery = refineries[Math.floor(Math.random() * refineries.length)];
            vessel.destinationPort = `REF:${randomRefinery.id}:${randomRefinery.name}`;
            
            // Ensure ETA is set for this new destination
            if (!vessel.eta) {
              const now = new Date();
              const futureOffset = Math.floor(Math.random() * 30) + 5; // 5-35 days in future
              const etaDate = new Date(now);
              etaDate.setDate(etaDate.getDate() + futureOffset);
              vessel.eta = etaDate;
            }
          }
          
          // Save vessel to database
          const createdVessel = await storage.createVessel(vessel);
          createdVessels.push(createdVessel);
        } catch (err) {
          console.error(`Error creating vessel ${vessel.name}:`, err);
          // Continue with the next vessel
        }
      }
      
      console.log(`Saved ${createdVessels.length} vessels to database.`);
      
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
          
          // Handle potential null values
          const baseLat = vessel.currentLat ? parseFloat(vessel.currentLat) : 0;
          const baseLng = vessel.currentLng ? parseFloat(vessel.currentLng) : 0;
          
          const lat = Math.max(-85, Math.min(85, baseLat + latOffset)).toFixed(4);
          const lng = Math.max(-180, Math.min(180, baseLng + lngOffset)).toFixed(4);
          
          // Check if lat is >= 0 for determining N/S
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);
          
          // Create event
          progressEvents.push({
            vesselId: vessel.id,
            date: eventDate,
            event: eventType,
            lat,
            lng,
            location: `${lat}° ${latNum >= 0 ? 'N' : 'S'}, ${lng}° ${lngNum >= 0 ? 'E' : 'W'}`
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
        totalCargo: totalCargo.toString(), // Convert to string for schema compatibility
        activeVessels: createdVessels.length
      });

      return {
        vessels: createdVessels.length,
        oilVessels: createdVessels.filter(v => {
          // Check if vessel has a cargo type that matches any of the oil product types
          return v.cargoType && OIL_PRODUCT_TYPES.includes(v.cargoType);
        }).length,
        totalCargo
      };
    } catch (error) {
      console.error("Error seeding vessel data:", error);
      throw error;
    }
  }
};