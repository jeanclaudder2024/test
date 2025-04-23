import { InsertVessel, InsertRefinery } from "@shared/schema";
import { OIL_PRODUCT_TYPES } from "@shared/constants";
import { generateLargeVesselDataset } from "./vesselGenerator";
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
    // Generate a large dataset of vessels
    const allVessels = generateLargeVesselDataset(3000);
    
    // Filter to only include oil vessels
    const oilVessels = allVessels.filter(vessel => {
      // Check if vessel has an oil-related cargo type
      return vessel.cargoType && OIL_PRODUCT_TYPES.includes(vessel.cargoType);
    });
    
    console.log(`ASI Stream API: Generated ${oilVessels.length} oil vessels out of ${allVessels.length} total vessels`);
    
    return oilVessels;
  },

  /**
   * Fetch real refinery data
   * @returns Array of realistic refineries based on accurate data
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    // Get real refinery data from accurate source
    const refineries = getAccurateRefineries();
    
    console.log(`ASI Stream API: Fetched ${refineries.length} real refineries`);
    
    return refineries;
  }
};