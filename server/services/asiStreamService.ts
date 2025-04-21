import { InsertVessel, InsertRefinery } from "@shared/schema";

// Interface for asistream API vessel data
interface AsiStreamVessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  vessel_type: string;
  flag: string;
  built?: number;
  deadweight?: number;
  position: {
    lat: number;
    lng: number;
  };
  departure: {
    port: string;
    date: string;
  };
  destination: {
    port: string;
    eta: string;
  };
  cargo: {
    type: string;
    capacity: number;
  };
  region: string;
}

// Interface for asistream API refinery data
interface AsiStreamRefinery {
  id: string;
  name: string;
  country: string;
  region: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  status: string;
}

/**
 * Service for interacting with the asistream API
 * NOTE: API is temporarily disabled - we're only using database data
 */
export const asiStreamService = {
  /**
   * Fetch vessel data from asistream API
   * Currently disabled - returns empty array since we'll use database data only
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    try {
      console.log("NOTICE: AsiStream Vessels API is temporarily disabled. Using database data only.");
      // Return empty array, we'll rely on database data
      return [];
    } catch (error) {
      console.error("Error in asistream API:", error);
      throw new Error("Failed to fetch vessel data from asistream API");
    }
  },

  /**
   * Fetch refinery data from asistream API
   * Currently disabled - returns empty array since we'll use database data only
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    try {
      console.log("NOTICE: AsiStream Refineries API is temporarily disabled. Using database data only.");
      // Return empty array, we'll rely on database data
      return [];
    } catch (error) {
      console.error("Error in asistream API:", error);
      throw new Error("Failed to fetch refinery data from asistream API");
    }
  }
};