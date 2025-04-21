import { InsertVessel, InsertRefinery } from "@shared/schema";
import fetch from "node-fetch";

// Interface for vessel data from RapidAPI
interface RapidAPIVessel {
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

// Interface for refinery data from RapidAPI
interface RapidAPIRefinery {
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

// Configurations for RapidAPI
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// RapidAPI configuration - these need to be updated with the correct API details
// Currently configured to detect and handle API connection failures gracefully
const RAPIDAPI_HOST = "maritime-tracking-api.p.rapidapi.com";
const VESSEL_ENDPOINT = "/vessels";
const REFINERY_ENDPOINT = "/refineries";

/**
 * Service for interacting with the maritime tracking API via RapidAPI
 */
export const asiStreamService = {
  /**
   * Fetch vessel data from RapidAPI
   * @returns Array of vessel data ready to be inserted into the database
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    try {
      // Check if API key is available
      if (!RAPIDAPI_KEY) {
        console.log("WARNING: RapidAPI key not found. Using database data only.");
        return [];
      }

      console.log("Fetching vessel data from RapidAPI...");
      
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      };

      const response = await fetch(`https://${RAPIDAPI_HOST}${VESSEL_ENDPOINT}?limit=100`, options);
      
      if (!response.ok) {
        throw new Error(`RapidAPI responded with status: ${response.status}`);
      }
      
      const data = await response.json() as { vessels?: RapidAPIVessel[] };
      console.log(`Retrieved ${data.vessels?.length || 0} vessels from RapidAPI`);
      
      // Map the RapidAPI response to our InsertVessel format
      return (data.vessels || []).map((vessel: RapidAPIVessel) => ({
        name: vessel.name,
        imo: vessel.imo,
        mmsi: vessel.mmsi,
        vesselType: vessel.vessel_type,
        flag: vessel.flag,
        built: vessel.built || null,
        deadweight: vessel.deadweight || null,
        currentLat: vessel.position.lat.toString(),
        currentLng: vessel.position.lng.toString(),
        departurePort: vessel.departure.port,
        departureDate: new Date(vessel.departure.date),
        destinationPort: vessel.destination.port,
        eta: new Date(vessel.destination.eta),
        cargoType: vessel.cargo.type,
        cargoCapacity: vessel.cargo.capacity,
        currentRegion: vessel.region
      }));
    } catch (error) {
      console.error("Error fetching vessels from RapidAPI:", error);
      console.log("Using database data only due to API error.");
      return [];
    }
  },

  /**
   * Fetch refinery data from RapidAPI
   * @returns Array of refinery data ready to be inserted into the database
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    try {
      // Check if API key is available
      if (!RAPIDAPI_KEY) {
        console.log("WARNING: RapidAPI key not found. Using database data only.");
        return [];
      }

      console.log("Fetching refinery data from RapidAPI...");
      
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      };

      const response = await fetch(`https://${RAPIDAPI_HOST}${REFINERY_ENDPOINT}?limit=50`, options);
      
      if (!response.ok) {
        throw new Error(`RapidAPI responded with status: ${response.status}`);
      }
      
      const data = await response.json() as { refineries?: RapidAPIRefinery[] };
      console.log(`Retrieved ${data.refineries?.length || 0} refineries from RapidAPI`);
      
      // Map the RapidAPI response to our InsertRefinery format
      return (data.refineries || []).map((refinery: RapidAPIRefinery) => ({
        name: refinery.name,
        country: refinery.country,
        region: refinery.region,
        lat: refinery.location.lat.toString(),
        lng: refinery.location.lng.toString(),
        capacity: refinery.capacity,
        status: refinery.status
      }));
    } catch (error) {
      console.error("Error fetching refineries from RapidAPI:", error);
      console.log("Using database data only due to API error.");
      return [];
    }
  }
};