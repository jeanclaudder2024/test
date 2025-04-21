import { InsertVessel, InsertRefinery } from "@shared/schema";

/**
 * This service is now retired. 
 * The application uses only database data for vessels and refineries,
 * not an external API.
 */
export const dataService = {
  /**
   * Placeholder function that returns an empty array
   * The application should use database data directly
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    return [];
  },

  /**
   * Placeholder function that returns an empty array
   * The application should use database data directly
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    return [];
  }
};