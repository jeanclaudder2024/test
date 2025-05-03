import { storage } from "../storage";
import { InsertPort, Port } from "@shared/schema";
import { REGIONS } from "@shared/constants";
import { marineTrafficService } from "./marineTrafficService";

/**
 * Generate a list of major shipping ports for initial database seeding
 * These ports represent major oil shipping hubs around the world 
 */
const majorPortsData: InsertPort[] = [
  // Middle East Region
  {
    name: "Ras Tanura",
    country: "Saudi Arabia",
    region: "Middle East",
    lat: "26.644",
    lng: "50.159",
    capacity: 6000000,
    status: "active",
    description: "Ras Tanura is one of the largest oil shipping ports in the world, located in Saudi Arabia."
  },
  {
    name: "Jebel Ali Port",
    country: "United Arab Emirates",
    region: "Middle East",
    lat: "24.985",
    lng: "55.059",
    capacity: 4000000,
    status: "active",
    description: "Jebel Ali is the world's largest man-made harbor and the biggest port in the Middle East."
  },
  
  // Europe Region
  {
    name: "Rotterdam Port",
    country: "Netherlands",
    region: "Europe",
    lat: "51.949",
    lng: "4.139",
    capacity: 8800000,
    status: "active",
    description: "Rotterdam is Europe's largest port and a key oil shipping hub."
  },
  {
    name: "Antwerp Port",
    country: "Belgium",
    region: "Europe",
    lat: "51.244",
    lng: "4.403",
    capacity: 5500000,
    status: "active",
    description: "Antwerp is one of Europe's major ports with significant oil handling capacity."
  },
  
  // North America Region
  {
    name: "Houston Ship Channel",
    country: "United States",
    region: "North America",
    lat: "29.735",
    lng: "-95.017",
    capacity: 7200000,
    status: "active",
    description: "The Port of Houston is one of the busiest ports in the United States, specializing in oil shipments."
  },
  {
    name: "Port of Long Beach",
    country: "United States",
    region: "North America",
    lat: "33.754",
    lng: "-118.216",
    capacity: 3900000,
    status: "active",
    description: "Port of Long Beach is the second-busiest container port in the United States."
  },
  
  // Asia-Pacific Region
  {
    name: "Port of Singapore",
    country: "Singapore",
    region: "Asia-Pacific",
    lat: "1.265",
    lng: "103.830",
    capacity: 9000000,
    status: "active",
    description: "Singapore is one of the busiest ports in the world and a major oil transshipment hub."
  },
  {
    name: "Shanghai Port",
    country: "China",
    region: "Asia-Pacific",
    lat: "31.230",
    lng: "121.474",
    capacity: 7400000,
    status: "active",
    description: "Shanghai is the world's busiest container port by throughput."
  },
  
  // Latin America Region
  {
    name: "Port of Santos",
    country: "Brazil",
    region: "Latin America",
    lat: "-23.982",
    lng: "-46.299",
    capacity: 2800000,
    status: "active",
    description: "Santos is the largest port in Latin America."
  },
  {
    name: "Port of Coatzacoalcos",
    country: "Mexico",
    region: "Latin America",
    lat: "18.142",
    lng: "-94.459",
    capacity: 1900000,
    status: "active",
    description: "Coatzacoalcos is one of Mexico's main oil exporting ports."
  },
  
  // Africa Region
  {
    name: "Port of Durban",
    country: "South Africa",
    region: "Africa",
    lat: "-29.865",
    lng: "31.045",
    capacity: 2600000,
    status: "active",
    description: "Durban is the busiest port in sub-Saharan Africa."
  },
  {
    name: "Port of Lagos",
    country: "Nigeria",
    region: "Africa",
    lat: "6.454",
    lng: "3.384",
    capacity: 1800000,
    status: "active",
    description: "Lagos is Nigeria's principal port and a major oil shipping terminal."
  }
];

export const portService = {
  /**
   * Get all port data from database or API
   */
  getAllPorts: async (): Promise<Port[]> => {
    try {
      // First try to get ports from the database
      const dbPorts = await storage.getPorts();
      
      // If we have data in the database, return it
      if (dbPorts && dbPorts.length > 0) {
        return dbPorts;
      }
      
      // If database is empty, try to get ports from MyShipTracking API
      if (marineTrafficService.isConfigured()) {
        try {
          const apiPorts = await marineTrafficService.fetchPorts();
          
          // If we got ports from the API, store them in the database
          if (apiPorts && apiPorts.length > 0) {
            for (const port of apiPorts) {
              await storage.createPort(port);
            }
            return await storage.getPorts();
          }
        } catch (apiError) {
          console.error("Failed to fetch ports from API:", apiError);
        }
      }
      
      // If both database and API failed, seed the database with majorPortsData
      await portService.seedPortData();
      return await storage.getPorts();
      
    } catch (error) {
      console.error("Error in getAllPorts:", error);
      throw new Error("Failed to get port data");
    }
  },
  
  /**
   * Get port by ID
   */
  getPortById: async (id: number): Promise<Port | undefined> => {
    try {
      return await storage.getPortById(id);
    } catch (error) {
      console.error(`Error getting port ${id}:`, error);
      throw new Error(`Failed to get port with ID ${id}`);
    }
  },
  
  /**
   * Get ports by region
   */
  getPortsByRegion: async (region: string): Promise<Port[]> => {
    try {
      return await storage.getPortsByRegion(region);
    } catch (error) {
      console.error(`Error getting ports for region ${region}:`, error);
      throw new Error(`Failed to get ports for region ${region}`);
    }
  },
  
  /**
   * Seed the database with port data
   */
  seedPortData: async (): Promise<{ports: number, seeded: boolean}> => {
    try {
      // Check if we already have ports in the database
      const existingPorts = await storage.getPorts();
      console.log(`Checking existing ports in database...`);
      
      if (existingPorts && existingPorts.length > 0) {
        console.log(`Database already contains ${existingPorts.length} ports.`);
        return { ports: existingPorts.length, seeded: false };
      }
      
      // If no ports in database, seed with major ports data
      console.log(`No ports found in database. Seeding with major ports data...`);
      
      // Try MyShipTracking API first if available
      if (marineTrafficService.isConfigured()) {
        try {
          const apiPorts = await marineTrafficService.fetchPorts();
          
          if (apiPorts && apiPorts.length > 0) {
            for (const port of apiPorts) {
              await storage.createPort(port);
            }
            console.log(`Seeded database with ${apiPorts.length} ports from API.`);
            return { ports: apiPorts.length, seeded: true };
          }
        } catch (apiError) {
          console.error("Failed to fetch ports from API for seeding:", apiError);
        }
      }
      
      // If API failed or not configured, use majorPortsData
      for (const port of majorPortsData) {
        await storage.createPort(port);
      }
      
      console.log(`Seeded database with ${majorPortsData.length} major ports.`);
      return { ports: majorPortsData.length, seeded: true };
      
    } catch (error) {
      console.error("Error seeding port data:", error);
      throw new Error("Failed to seed port data");
    }
  }
};