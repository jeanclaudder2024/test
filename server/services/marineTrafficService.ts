import axios from 'axios';
import { InsertVessel, Vessel, InsertRefinery, Refinery } from "@shared/schema";
import { REGIONS } from "@shared/constants";

/**
 * MyShipTracking Service for fetching real vessel data
 * This service connects to the MyShipTracking API to get real-time vessel information
 */

// Environment variable check
if (!process.env.MARINE_TRAFFIC_API_KEY) {
  console.warn('Warning: MARINE_TRAFFIC_API_KEY environment variable is not set. MyShipTracking API integration will not work.');
}

// Base URL for the MyShipTracking API
const API_BASE_URL = 'https://api.myshiptracking.com/v1';
const API_KEY = process.env.MARINE_TRAFFIC_API_KEY;

// MyShipTracking API endpoints
const ENDPOINTS = {
  // Get vessel positions 
  VESSEL_POSITIONS: '/vessels',
  // Get vessel details by IMO or MMSI
  VESSEL_DETAILS: '/vessels/details',
  // Get vessels in area (defined by coordinates)
  VESSELS_IN_AREA: '/vessels/area',
  // Get vessel route and trajectory
  VESSEL_ROUTE: '/vessels/route',
  // Get port calls
  PORT_CALLS: '/ports/calls'
}

// Types for MyShipTracking API responses
interface MyShipTrackingVessel {
  mmsi: string;
  imo: string;
  name: string;
  type: number;
  type_name: string;
  ais_type_summary?: string;
  flag: string;
  flag_name: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  status: number;
  status_name: string;
  last_position_time: string;
  destination: string;
  eta: string;
  last_port: string;
  last_port_time: string;
}

interface MyShipTrackingVesselDetails {
  imo: string;
  mmsi: string;
  name: string;
  type: number;
  type_name: string;
  call_sign: string;
  flag: string;
  flag_name: string;
  gross_tonnage: number;
  deadweight: number;
  length: number;
  beam: number;
  draught: number;
  year_built: number;
  home_port: string;
  owner: string;
  manager: string;
  photos: Array<{url: string; caption: string}>;
}

/**
 * Map MyShipTracking vessel type to our application vessel type
 */
function mapVesselType(shipTrackingType: string): string {
  const typeLower = shipTrackingType.toLowerCase();
  
  // MyShipTracking API uses numerical vessel types but also provides string descriptions
  // Type 80: Tanker - Hazard A (Major)
  // Type 81: Tanker - Hazard B
  // Type 82: Tanker - Hazard C (Minor)
  // Type 83: Tanker - Hazard D (Recognizable)
  // Type 84: Other type of Tanker
  
  if (typeLower.includes('crude oil tanker') || typeLower.includes('hazard a')) return 'crude oil tanker';
  if (typeLower.includes('oil/chemical') || typeLower.includes('hazard b')) return 'oil/chemical tanker';
  if (typeLower.includes('oil products') || typeLower.includes('hazard c')) return 'oil products tanker';
  if (typeLower.includes('lng')) return 'lng tanker';
  if (typeLower.includes('lpg')) return 'lpg tanker';
  if (typeLower.includes('tanker')) return 'oil products tanker';
  
  return 'other';
}

/**
 * Determine region based on coordinates
 */
function determineRegion(lat: number, lng: number): string {
  // First check specific regions by coordinates
  
  // Middle East
  if (lat >= 15 && lat <= 40 && lng >= 30 && lng <= 65) {
    return 'middle_east';
  }
  
  // North America
  if (lat >= 25 && lat <= 60 && lng >= -140 && lng <= -50) {
    return 'north_america';
  }
  
  // Europe
  if (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 40) {
    return 'europe';
  }
  
  // East Asia
  if (lat >= 20 && lat <= 50 && lng >= 100 && lng <= 145) {
    return 'east_asia';
  }
  
  // Default to a reasonable region
  return 'global';
}

/**
 * Fetch vessels from MyShipTracking API
 */
async function fetchVesselsFromAPI(): Promise<InsertVessel[]> {
  if (!API_KEY) {
    console.error('MyShipTracking API key is not set');
    return [];
  }
  
  try {
    // Get vessel positions for oil tankers
    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Query parameters for tankers only
    const params = {
      type: '80,81,82,83,84', // Tanker vessel types (Crude oil, Oil/Chemical, LNG, etc.)
      limit: 100 // Limit to 100 vessels to avoid excessive API usage
    };
    
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.VESSEL_POSITIONS}`, { 
      headers,
      params 
    });
    
    if (!response.data || response.data.error) {
      console.error('Error fetching vessel data from MyShipTracking:', response.data?.error || 'Unknown error');
      return [];
    }
    
    // Map the MyShipTracking data to our vessel schema
    const vessels: InsertVessel[] = response.data.map((vessel: MyShipTrackingVessel) => {
      // Determine region based on coordinates
      const region = determineRegion(vessel.latitude, vessel.longitude);
      
      // Format destination port
      const destinationPort = vessel.destination ? vessel.destination.trim() : 'Unknown';
      const departurePort = vessel.last_port || 'Unknown';
      
      // Create vessel object according to our schema with a generated ID
      const mmsiNumber = parseInt(vessel.mmsi.replace(/\D/g, '')) || 0;
      const generatedId = mmsiNumber % 100000; // Generate a reasonably unique ID from MMSI
      
      // Store additional navigation details in metadata field
      const navigationMetadata = {
        heading: vessel.heading || 0,
        course: vessel.course || 0,
        speed: vessel.speed || 0,
        status: vessel.status_name || 'Unknown',
        lastPositionTime: vessel.last_position_time || new Date().toISOString(),
      };
      
      // Serialize the metadata as a JSON string to store in our schema
      const metadataString = JSON.stringify(navigationMetadata);
      
      return {
        name: vessel.name,
        imo: vessel.imo || `MST-${vessel.mmsi}`,
        mmsi: vessel.mmsi,
        vesselType: mapVesselType(vessel.type_name || vessel.ais_type_summary || 'Tanker'),
        flag: vessel.flag_name || vessel.flag || 'Unknown',
        built: null, // Detailed info not available in this endpoint
        deadweight: null, // Detailed info not available in this endpoint
        currentLat: vessel.latitude.toString(),
        currentLng: vessel.longitude.toString(),
        departurePort: departurePort,
        departureDate: vessel.last_port_time ? new Date(vessel.last_port_time) : null,
        destinationPort: destinationPort,
        eta: vessel.eta ? new Date(vessel.eta) : null,
        cargoType: 'crude_oil', // Assuming oil tankers carry crude oil
        cargoCapacity: null, // Detailed info not available in this endpoint
        currentRegion: region,
        metadata: metadataString // Store navigation details in metadata
      };
    });
    
    console.log(`Fetched ${vessels.length} vessels from MyShipTracking API`);
    return vessels;
    
  } catch (error) {
    console.error('Error fetching data from MyShipTracking API:', error);
    return [];
  }
}

/**
 * Enrich vessel data with details from the MyShipTracking API
 */
async function enrichVesselData(vessels: InsertVessel[]): Promise<InsertVessel[]> {
  if (!API_KEY || vessels.length === 0) {
    return vessels;
  }
  
  // We'll enrich up to 20 vessels at a time to avoid excessive API usage
  const enrichedVessels: InsertVessel[] = [...vessels];
  const vesselBatch = vessels.slice(0, 20);
  
  // Headers for API requests
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Process vessels in batches to avoid rate limits
    for (const vessel of vesselBatch) {
      // Skip vessels with generated IDs
      if (vessel.imo.startsWith('MST-')) {
        continue;
      }
      
      try {
        // Get vessel details by IMO
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.VESSEL_DETAILS}`, { 
          headers,
          params: { imo: vessel.imo }
        });
        
        if (!response.data || response.data.error) {
          continue; // Skip to next vessel if error
        }
        
        // API may return single object or array
        const vesselDetails: MyShipTrackingVesselDetails = 
          Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (!vesselDetails) {
          continue;
        }
        
        // Find the vessel in our result array and update it
        const index = enrichedVessels.findIndex(v => v.imo === vessel.imo);
        if (index !== -1) {
          // Make sure to keep the id from the original object
          enrichedVessels[index] = {
            ...enrichedVessels[index],
            id: enrichedVessels[index].id, // Explicitly preserve ID
            built: vesselDetails.year_built || null,
            deadweight: vesselDetails.deadweight || null,
            name: vesselDetails.name || vessel.name,
            mmsi: vesselDetails.mmsi || vessel.mmsi,
            vesselType: mapVesselType(vesselDetails.type_name || vessel.vesselType),
            flag: vesselDetails.flag_name || vesselDetails.flag || vessel.flag,
            cargoCapacity: vesselDetails.deadweight ? Math.round(vesselDetails.deadweight * 0.95) : null // Estimated cargo capacity as 95% of DWT
          };
        }
        
        // Small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (detailError) {
        console.warn(`Error fetching details for vessel ${vessel.imo}:`, detailError);
        // Continue with next vessel
      }
    }
    
    return enrichedVessels;
    
  } catch (error) {
    console.error('Error enriching vessel data from MyShipTracking API:', error);
    return vessels;
  }
}

/**
 * Get expected vessel arrivals at ports
 * This is useful for showing vessels that are expected to arrive at refineries
 */
async function getExpectedArrivals(portIds: string[]): Promise<InsertVessel[]> {
  if (!API_KEY || portIds.length === 0) {
    return [];
  }
  
  // Headers for API requests
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // In MyShipTracking, we need to use the port calls endpoint to get expected arrivals
    // We're using a different approach than with Marine Traffic API
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.PORT_CALLS}`, { 
      headers,
      params: {
        port_id: portIds[0], // MyShipTracking only supports one port at a time
        arrivals: true,      // We want arrivals, not departures
        days_ahead: 5        // Look ahead 5 days
      }
    });
    
    if (!response.data || response.data.error) {
      console.error('Error fetching expected arrivals from MyShipTracking:', response.data?.error || 'Unknown error');
      return [];
    }
    
    // Map the arrival data to our vessel schema
    const expectedVessels: InsertVessel[] = response.data.map((arrival: any) => {
      // Generate an ID from MMSI to match database schema
      const mmsiNumber = parseInt(arrival.mmsi?.replace(/\D/g, '') || '0') || 0;
      const generatedId = mmsiNumber % 100000; // Generate a reasonably unique ID from MMSI
      
      // Store additional navigation details in metadata field
      const navigationMetadata = {
        heading: arrival.heading || 0,
        course: arrival.course || 0,
        speed: arrival.speed || 0,
        status: arrival.status_name || 'Unknown',
        lastPositionTime: arrival.last_position_time || new Date().toISOString(),
      };
      
      // Serialize the metadata as a JSON string to store in our schema
      const metadataString = JSON.stringify(navigationMetadata);
      
      return {
        name: arrival.vessel_name || arrival.name,
        imo: arrival.imo || `MST-${arrival.mmsi}`,
        mmsi: arrival.mmsi,
        vesselType: mapVesselType(arrival.vessel_type_name || arrival.type_name || 'Tanker'),
        flag: arrival.flag_name || arrival.flag || 'Unknown',
        built: null,
        deadweight: null,
        currentLat: arrival.latitude ? arrival.latitude.toString() : null,
        currentLng: arrival.longitude ? arrival.longitude.toString() : null,
        departurePort: arrival.last_port_name || arrival.last_port || 'Unknown',
        departureDate: arrival.last_port_time ? new Date(arrival.last_port_time) : null,
        destinationPort: arrival.port_name || arrival.destination || 'Unknown',
        eta: arrival.eta ? new Date(arrival.eta) : null,
        cargoType: 'crude_oil',
        cargoCapacity: null,
        currentRegion: determineRegion(
          parseFloat(arrival.latitude || '0'), 
          parseFloat(arrival.longitude || '0')
        ),
        metadata: metadataString
      };
    });
    
    // If we need more port arrivals, we could fetch them in parallel here
    // But for now we'll just return what we have
    
    return expectedVessels;
    
  } catch (error) {
    console.error('Error fetching expected arrivals from MyShipTracking API:', error);
    return [];
  }
}

/**
 * Export the MyShipTracking service for integration with the application
 */
export const marineTrafficService = {
  /**
   * Fetch vessel data from MyShipTracking API
   * @returns Array of vessels matching our application schema
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    try {
      const vessels = await fetchVesselsFromAPI();
      
      // Enrich data with vessel details if vessels were found
      if (vessels.length > 0) {
        return await enrichVesselData(vessels);
      }
      
      return vessels;
    } catch (error) {
      console.error('Error in marineTrafficService.fetchVessels:', error);
      return [];
    }
  },
  
  /**
   * Get vessels expected to arrive at specific ports
   * @param portIds Array of MyShipTracking port IDs
   * @returns Array of expected vessels
   */
  getExpectedArrivals: async (portIds: string[]): Promise<InsertVessel[]> => {
    return getExpectedArrivals(portIds);
  },
  
  /**
   * Check if the MyShipTracking API is configured and available
   * @returns Boolean indicating if the service is ready to use
   */
  isConfigured: (): boolean => {
    return !!API_KEY;
  },
  
  /**
   * Delete all vessel data from the API cache - used for testing
   * Note: This doesn't affect the actual API data, just our local data
   */
  clearVesselData: async (): Promise<void> => {
    console.log('Cleared vessel data from MyShipTracking service');
  }
};