import { InsertVessel, InsertRefinery } from "@shared/schema";
import { OIL_PRODUCT_TYPES, REGIONS } from "@shared/constants";
import { getAccurateRefineries } from "./refineryCoordinates";

/**
 * Service to simulate ASI API data with more realistic vessels and refineries
 */
export const dataService = {
  /**
   * Fetch oil vessels data (simulated)
   * @returns Array of oil vessels only
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    try {
      console.log("Fetching oil vessels from ASI Stream API...");
      
      // Generate simulated vessel data with realistic oil tanker information
      const oilVessels: InsertVessel[] = [];
      
      // Common oil tanker types
      const tankerTypes = [
        "VLCC (Very Large Crude Carrier)",
        "Suezmax Crude Oil Tanker",
        "Aframax Crude Oil Tanker",
        "Panamax Oil Tanker",
        "MR (Medium Range) Tanker",
        "Handysize Product Tanker",
        "Oil/Chemical Tanker",
        "LR1 (Large Range 1)",
        "LR2 (Large Range 2)",
      ];

      // Flags of major oil shipping nations
      const oilShippingFlags = [
        "Panama", "Liberia", "Marshall Islands", "Singapore", 
        "Hong Kong", "Greece", "Bahamas", "Malta", "Saudi Arabia", 
        "Norway", "Cyprus", "Japan", "China", "Denmark", "UK", "USA"
      ];
      
      // Major oil companies and operators
      const oilOperators = [
        "Saudi Aramco", "Exxon Mobil", "Shell", "BP", "Total",
        "Chevron", "China National Offshore Oil Corporation", "COSCO Shipping",
        "Bahri", "MOL", "NYK Line", "Frontline", "DHT Holdings",
        "Euronav", "Teekay", "Maersk Tankers", "Scorpio Tankers"
      ];

      // Generate 200 realistic oil vessels
      for (let i = 0; i < 200; i++) {
        // Generate unique IMO number (IMO numbers start with 9 followed by 6 digits)
        const imoSuffix = Math.floor(100000 + Math.random() * 900000);
        const imo = `9${imoSuffix}`;
        
        // Generate unique MMSI number (MMSI numbers are 9 digits)
        const mmsi = Math.floor(100000000 + Math.random() * 900000000).toString();
        
        // Select random vessel properties
        const vesselType = tankerTypes[Math.floor(Math.random() * tankerTypes.length)];
        const flag = oilShippingFlags[Math.floor(Math.random() * oilShippingFlags.length)];
        const operator = oilOperators[Math.floor(Math.random() * oilOperators.length)];
        
        // Generate realistic tanker specs
        const built = Math.floor(1990 + Math.random() * 33); // 1990-2023
        const deadweight = Math.floor(30000 + Math.random() * 320000); // 30k-350k DWT for oil tankers
        
        // Generate vessel name with more realistic oil tanker naming
        const prefixes = ["MT", "MV", "VLCC", "TK"];
        const companies = ["ARAMCO", "EXXON", "SHELL", "BP", "CHEVRON", "SINOPEC", "PETRO", "GLOBAL"];
        const suffixes = ["PIONEER", "VENTURE", "MARINER", "VOYAGER", "TRADER", "GLORY", "PRIDE", "EAGLE", "FALCON"];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const vesselName = `${prefix} ${company} ${suffix}`;
        
        // Random position within reasonable shipping lanes
        // Major shipping routes for oil tankers
        const shippingRoutes = [
          // Persian Gulf to Asia
          { minLat: 15, maxLat: 30, minLng: 40, maxLng: 80 },
          // Suez Canal area
          { minLat: 25, maxLat: 35, minLng: 30, maxLng: 40 },
          // Mediterranean Sea
          { minLat: 30, maxLat: 45, minLng: -5, maxLng: 35 },
          // North Sea
          { minLat: 50, maxLat: 62, minLng: -4, maxLng: 12 },
          // US Gulf Coast
          { minLat: 20, maxLat: 30, minLng: -98, maxLng: -80 },
          // East Asia shipping lanes
          { minLat: 20, maxLat: 40, minLng: 115, maxLng: 130 },
          // Singapore strait
          { minLat: 0, maxLat: 10, minLng: 100, maxLng: 110 },
        ];
        
        // Select a random shipping route
        const route = shippingRoutes[Math.floor(Math.random() * shippingRoutes.length)];
        
        // Generate a position within the route
        const currentLat = (route.minLat + Math.random() * (route.maxLat - route.minLat)).toFixed(4);
        const currentLng = (route.minLng + Math.random() * (route.maxLng - route.minLng)).toFixed(4);
        
        // Determine region based on lat/lng
        let currentRegion: string;
        if (parseFloat(currentLng) > 30 && parseFloat(currentLng) < 80 && 
            parseFloat(currentLat) > 20 && parseFloat(currentLat) < 30) {
          currentRegion = "persian_gulf";
        } else if (parseFloat(currentLng) > 100 && parseFloat(currentLng) < 130) {
          currentRegion = "east_asia";
        } else if (parseFloat(currentLng) > -5 && parseFloat(currentLng) < 35 && 
                  parseFloat(currentLat) > 30 && parseFloat(currentLat) < 45) {
          currentRegion = "mediterranean";
        } else if (parseFloat(currentLng) > -10 && parseFloat(currentLng) < 12 && 
                  parseFloat(currentLat) > 50 && parseFloat(currentLat) < 62) {
          currentRegion = "north_europe";
        } else if (parseFloat(currentLng) > -98 && parseFloat(currentLng) < -80 && 
                  parseFloat(currentLat) > 20 && parseFloat(currentLat) < 30) {
          currentRegion = "us_gulf";
        } else {
          // Default regions based on general ocean areas
          if (parseFloat(currentLng) < -30) {
            currentRegion = "americas";
          } else if (parseFloat(currentLng) < 30) {
            currentRegion = "atlantic";
          } else if (parseFloat(currentLng) < 90) {
            currentRegion = "middle_east";
          } else {
            currentRegion = "asia_pacific";
          }
        }
        
        // Map region to one of our actual defined regions
        const matchedRegion = REGIONS.find(r => r.id === currentRegion);
        if (!matchedRegion) {
          // Default to a random region if no match
          currentRegion = REGIONS[Math.floor(Math.random() * REGIONS.length)].id;
        }
        
        // Select a random cargo type from oil product types
        const cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
        
        // Calculate cargo capacity and volume based on deadweight
        // For oil tankers, roughly 85-95% of deadweight can be cargo capacity
        const cargoCapacityFactor = 0.85 + Math.random() * 0.1; // 85-95%
        const cargoCapacity = Math.floor(deadweight * cargoCapacityFactor);
        
        // Current cargo volume is some percentage of capacity
        const cargoVolumeFactor = 0.5 + Math.random() * 0.5; // 50-100%
        const cargoVolume = Math.floor(cargoCapacity * cargoVolumeFactor);
        
        // Calculate ETA (1-30 days in the future)
        const now = new Date();
        const daysToAdd = Math.floor(1 + Math.random() * 30);
        const eta = new Date(now);
        eta.setDate(eta.getDate() + daysToAdd);
        
        // Add the vessel to our list
        oilVessels.push({
          name: vesselName,
          imo,
          mmsi,
          vesselType,
          flag,
          built,
          deadweight,
          currentLat,
          currentLng,
          // No heading or speed in schema
          operator,
          eta,
          currentRegion,
          cargoType,
          cargoCapacity,
          // No cargoVolume in schema
          departurePort: null,
          departureDate: null,
          destinationPort: null // Will be filled in by vessel service
          // No status in schema
        });
      }
      
      console.log(`Generated ${oilVessels.length} simulated oil vessels from ASI Stream API.`);
      return oilVessels;
    } catch (error) {
      console.error("Error fetching vessels from ASI Stream API:", error);
      // Return empty array in case of error
      return [];
    }
  },

  /**
   * Fetch real refinery data
   * @returns Array of realistic refineries based on accurate data
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    try {
      console.log("Fetching real refineries from ASI Stream API...");
      
      // Use our accurate refinery data
      const refineries = getAccurateRefineries();
      
      console.log(`Fetched ${refineries.length} real refineries from ASI Stream API.`);
      return refineries;
    } catch (error) {
      console.error("Error fetching refineries from ASI Stream API:", error);
      // Return empty array in case of error
      return [];
    }
  }
};