import { storage } from "../storage";
import { InsertPort, Port } from "@shared/schema";
import { REGIONS } from "@shared/constants";
import { marineTrafficService } from "./marineTrafficService";

/**
 * Generate a list of major shipping ports for initial database seeding with current 2025 data
 * These ports represent major oil shipping hubs around the world with updated capacities and details
 */
const majorPortsData: InsertPort[] = [
  // Middle East Region
  {
    name: "Ras Tanura Terminal",
    country: "Saudi Arabia",
    region: "Middle East",
    lat: "26.644",
    lng: "50.159",
    capacity: 7200000, // Upgraded capacity as of 2025
    status: "active",
    description: "Ras Tanura is Saudi Aramco's primary oil export facility and one of the largest oil shipping ports in the world, expanded in 2024 with additional deep-water berths."
  },
  {
    name: "Jebel Ali Port",
    country: "United Arab Emirates",
    region: "Middle East",
    lat: "24.985",
    lng: "55.059",
    capacity: 5100000, // Expanded capacity 
    status: "active",
    description: "Jebel Ali is the world's largest man-made harbor with advanced automation systems implemented in 2024, specializing in both container and oil shipping."
  },
  {
    name: "Fujairah Oil Terminal",
    country: "United Arab Emirates",
    region: "Middle East",
    lat: "25.112",
    lng: "56.342",
    capacity: 3400000,
    status: "active",
    description: "The Fujairah Oil Terminal has expanded to become the largest oil storage facility in the Middle East following major expansion in 2024."
  },
  
  // Europe Region
  {
    name: "Rotterdam Energy Hub",
    country: "Netherlands",
    region: "Europe",
    lat: "51.949",
    lng: "4.139",
    capacity: 9500000, // Increased capacity following 2024 expansion
    status: "active",
    description: "Rotterdam has transformed into Europe's premier energy transition hub with new LNG and hydrogen facilities alongside traditional oil infrastructure."
  },
  {
    name: "Port of Antwerp-Bruges",
    country: "Belgium",
    region: "Europe",
    lat: "51.244",
    lng: "4.403",
    capacity: 6200000, // Merged port with increased capacity
    status: "active",
    description: "Following the 2023 merger with Bruges, this mega-port has expanded oil handling capacity with state-of-the-art carbon capture facilities."
  },
  {
    name: "Sines Terminal",
    country: "Portugal",
    region: "Europe",
    lat: "37.957",
    lng: "-8.869",
    capacity: 3800000,
    status: "active",
    description: "The Port of Sines has become a crucial Atlantic gateway for European oil imports with expanded deep-water access completed in 2024."
  },
  
  // North America Region
  {
    name: "Houston Energy Corridor",
    country: "United States",
    region: "North America",
    lat: "29.735",
    lng: "-95.017",
    capacity: 8400000, // Expanded capacity following 2024 upgrades
    status: "active",
    description: "The Port of Houston has completed a $2B expansion project to accommodate larger vessels and increased oil export capacity to meet global demand."
  },
  {
    name: "Port of Corpus Christi",
    country: "United States",
    region: "North America",
    lat: "27.814",
    lng: "-97.396",
    capacity: 5500000, // Major expansion completed
    status: "active",
    description: "Now America's largest crude oil export terminal following the 2024 channel deepening project allowing VLCC direct loading."
  },
  {
    name: "Port of Long Beach",
    country: "United States",
    region: "North America",
    lat: "33.754",
    lng: "-118.216",
    capacity: 4300000, // Increased capacity
    status: "active",
    description: "The West Coast's premier energy port now features advanced robotics and automated systems following a 2024 modernization project."
  },
  
  // Asia-Pacific Region
  {
    name: "Singapore Mega Port",
    country: "Singapore",
    region: "Asia-Pacific",
    lat: "1.265",
    lng: "103.830",
    capacity: 10500000, // Huge expansion completed in 2024
    status: "active",
    description: "Singapore's new Tuas Mega Port phase has made it the world's largest integrated oil and container facility with advanced AI-driven logistics."
  },
  {
    name: "Ningbo-Zhoushan Port",
    country: "China",
    region: "Asia-Pacific",
    lat: "29.868",
    lng: "122.147",
    capacity: 8900000, // Now China's largest oil port
    status: "active",
    description: "This port has surpassed Shanghai as China's largest energy hub following massive expansion and integration with the Maritime Silk Road initiative."
  },
  {
    name: "Port of Ulsan",
    country: "South Korea",
    region: "Asia-Pacific",
    lat: "35.502",
    lng: "129.388",
    capacity: 4200000,
    status: "active",
    description: "Korea's primary energy hub has implemented full digital twin technology in 2024, enabling real-time optimization of oil handling operations."
  },
  
  // Latin America Region
  {
    name: "Porto do Açu",
    country: "Brazil",
    region: "Latin America",
    lat: "-21.823",
    lng: "-41.019",
    capacity: 3700000, // New major Brazilian port
    status: "active",
    description: "Brazil's newest deepwater port has become Latin America's most advanced oil terminal following completion of phase 3 expansion in 2024."
  },
  {
    name: "Port of Santos Energy Terminal",
    country: "Brazil",
    region: "Latin America",
    lat: "-23.982",
    lng: "-46.299",
    capacity: 3200000, // Expanded with new energy terminal
    status: "active",
    description: "The new dedicated energy terminal has transformed Santos into a dual-purpose port serving both container and growing Brazilian oil exports."
  },
  {
    name: "Dos Bocas Terminal",
    country: "Mexico",
    region: "Latin America",
    lat: "18.422",
    lng: "-93.186",
    capacity: 2800000, // New terminal completed in 2024
    status: "active",
    description: "Mexico's new flagship energy port with integrated refinery operations completed in 2024 to boost domestic production and export capacity."
  },
  
  // Africa Region
  {
    name: "Tangier Med Port",
    country: "Morocco",
    region: "Africa",
    lat: "35.896",
    lng: "-5.495",
    capacity: 3500000, // Major expansion
    status: "active",
    description: "Africa's largest port has expanded energy handling capabilities with new oil terminal facilities completed in 2024 to serve Mediterranean routes."
  },
  {
    name: "Port of Durban",
    country: "South Africa",
    region: "Africa",
    lat: "-29.865",
    lng: "31.045",
    capacity: 3100000, // Expanded capacity
    status: "active",
    description: "Following the 2024 modernization program, Durban has enhanced oil handling capacity with new automated systems and expanded berths."
  },
  {
    name: "Lamu Port",
    country: "Kenya",
    region: "Africa",
    lat: "-2.267",
    lng: "40.902",
    capacity: 2300000, // New major East African port
    status: "active",
    description: "East Africa's newest deepwater port completed final phase construction in 2024, becoming a major hub for regional oil distribution."
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