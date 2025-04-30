import axios from 'axios';
import { InsertVessel, Vessel, InsertRefinery, Refinery } from "@shared/schema";
import { REGIONS } from "@shared/constants";

/**
 * Marine Traffic Service for fetching real vessel data
 * This service connects to the Marine Traffic API to get real-time vessel information
 */

// Environment variable check
if (!process.env.MARINE_TRAFFIC_API_KEY) {
  console.warn('Warning: MARINE_TRAFFIC_API_KEY environment variable is not set. Marine Traffic API integration will not work.');
}

// Base URL for the Marine Traffic API
const API_BASE_URL = 'https://services.marinetraffic.com/api';
const API_KEY = process.env.MARINE_TRAFFIC_API_KEY;

// Marine Traffic API endpoints
const ENDPOINTS = {
  // Marine Traffic PS01 - Vessel Positions
  VESSEL_POSITIONS: '/exportvessels',
  // Marine Traffic PS02 - Vessel Positions of a Fleet
  FLEET_POSITIONS: '/exportvessel',
  // Marine Traffic VD01 - Vessel Details
  VESSEL_DETAILS: '/vesseldetails',
  // Marine Traffic PS06 - Port Calls
  PORT_CALLS: '/portcalls',
  // Marine Traffic PS07 - Expected Arrivals
  EXPECTED_ARRIVALS: '/expectedarrivals'
};

// Types for Marine Traffic API responses
interface MarineTrafficVesselPosition {
  MMSI: string;
  IMO: string;
  SHIP_ID: string;
  LAT: string;
  LON: string;
  SPEED: string;
  HEADING: string;
  COURSE: string;
  STATUS: string;
  TIMESTAMP: string;
  DSRC: string;
  SHIP_NAME: string;
  SHIP_TYPE: string;
  TYPE_COLOR: string;
  TYPE_NAME: string;
  DESTINATION: string;
  ETA: string;
  AIS_TYPE_SUMMARY: string;
  CURRENT_PORT: string;
  LAST_PORT: string;
  LAST_PORT_TIME: string;
  FLAG: string;
}

interface MarineTrafficVesselDetails {
  IMO: string;
  NAME: string;
  MMSI: string;
  TYPE_NAME: string;
  TYPE_SUMMARY: string;
  DWT: string;
  YEAR_BUILT: string;
  GT: string;
  FLAG: string;
  OWNER: string;
  LENGTH: string;
  BREADTH: string;
  DRAUGHT: string;
}

/**
 * Map Marine Traffic vessel type to our application vessel type
 */
function mapVesselType(marineTrafficType: string): string {
  const typeLower = marineTrafficType.toLowerCase();
  
  if (typeLower.includes('crude oil tanker')) return 'crude oil tanker';
  if (typeLower.includes('oil/chemical')) return 'oil/chemical tanker';
  if (typeLower.includes('oil products')) return 'oil products tanker';
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
 * Fetch vessels from Marine Traffic API
 */
async function fetchVesselsFromAPI(): Promise<InsertVessel[]> {
  if (!API_KEY) {
    console.error('Marine Traffic API key is not set');
    return [];
  }
  
  try {
    // PS01 API - Get vessel positions for oil tankers
    const params = {
      timespan: 60, // Last 60 minutes
      msgtype: 'simple',
      protocol: 'jsono', // JSON output
      key: API_KEY,
      ship_type: '7', // 7 is for Tankers
      limit: 100 // Limit to 100 vessels to avoid excessive API usage
    };
    
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.VESSEL_POSITIONS}`, { params });
    
    if (!response.data || response.data.errors) {
      console.error('Error fetching vessel data from Marine Traffic:', response.data?.errors || 'Unknown error');
      return [];
    }
    
    // Map the Marine Traffic data to our vessel schema
    const vessels: InsertVessel[] = response.data.map((vessel: MarineTrafficVesselPosition) => {
      // Extract values with proper type conversion
      const lat = parseFloat(vessel.LAT);
      const lng = parseFloat(vessel.LON);
      const region = determineRegion(lat, lng);
      
      // Format destination port
      const destinationPort = vessel.DESTINATION ? vessel.DESTINATION.trim() : 'Unknown';
      const departurePort = vessel.LAST_PORT || 'Unknown';
      
      // Create vessel object according to our schema
      return {
        imo: vessel.IMO || `MT-${vessel.MMSI}`,
        mmsi: vessel.MMSI,
        name: vessel.SHIP_NAME,
        vesselType: mapVesselType(vessel.TYPE_NAME || vessel.AIS_TYPE_SUMMARY || 'Tanker'),
        flag: vessel.FLAG || 'Unknown',
        built: null, // Detailed info not available in this endpoint
        deadweight: null, // Detailed info not available in this endpoint
        currentLat: lat.toString(),
        currentLng: lng.toString(),
        departurePort: departurePort,
        departureDate: vessel.LAST_PORT_TIME ? new Date(vessel.LAST_PORT_TIME) : null,
        destinationPort: destinationPort,
        eta: vessel.ETA ? new Date(vessel.ETA) : null,
        cargoType: 'crude_oil', // Assuming oil tankers carry crude oil
        cargoCapacity: null, // Detailed info not available in this endpoint
        currentRegion: region
      };
    });
    
    console.log(`Fetched ${vessels.length} vessels from Marine Traffic API`);
    return vessels;
    
  } catch (error) {
    console.error('Error fetching data from Marine Traffic API:', error);
    return [];
  }
}

/**
 * Enrich vessel data with details from the Marine Traffic API
 */
async function enrichVesselData(vessels: InsertVessel[]): Promise<InsertVessel[]> {
  if (!API_KEY || vessels.length === 0) {
    return vessels;
  }
  
  // We'll enrich up to 20 vessels at a time to avoid excessive API usage
  const vesselBatch = vessels.slice(0, 20);
  const imoList = vesselBatch.map(v => v.imo).filter(imo => imo && !imo.startsWith('MT-')).join(',');
  
  if (!imoList) {
    return vessels;
  }
  
  try {
    // VD01 API - Get vessel details
    const params = {
      imois: imoList,
      protocol: 'jsono',
      key: API_KEY
    };
    
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.VESSEL_DETAILS}`, { params });
    
    if (!response.data || response.data.errors) {
      console.error('Error fetching vessel details from Marine Traffic:', response.data?.errors || 'Unknown error');
      return vessels;
    }
    
    // Create a map of IMO to vessel details
    const detailsMap = new Map<string, MarineTrafficVesselDetails>();
    response.data.forEach((details: MarineTrafficVesselDetails) => {
      detailsMap.set(details.IMO, details);
    });
    
    // Enrich the vessels with details
    return vessels.map(vessel => {
      const details = detailsMap.get(vessel.imo);
      
      if (!details) {
        return vessel;
      }
      
      return {
        ...vessel,
        built: details.YEAR_BUILT ? parseInt(details.YEAR_BUILT, 10) : null,
        deadweight: details.DWT ? parseInt(details.DWT, 10) : null,
        // Update other fields if available in the details
        name: details.NAME || vessel.name,
        mmsi: details.MMSI || vessel.mmsi,
        vesselType: mapVesselType(details.TYPE_NAME || details.TYPE_SUMMARY || vessel.vesselType),
        flag: details.FLAG || vessel.flag,
        cargoCapacity: details.DWT ? Math.round(parseInt(details.DWT, 10) * 0.95) : null // Estimated cargo capacity as 95% of DWT
      };
    });
    
  } catch (error) {
    console.error('Error enriching vessel data from Marine Traffic API:', error);
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
  
  try {
    // PS07 API - Get expected arrivals
    const params = {
      portid: portIds.join(','),
      days: 5, // Look ahead 5 days
      msgtype: 'simple',
      protocol: 'jsono',
      key: API_KEY
    };
    
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.EXPECTED_ARRIVALS}`, { params });
    
    if (!response.data || response.data.errors) {
      console.error('Error fetching expected arrivals from Marine Traffic:', response.data?.errors || 'Unknown error');
      return [];
    }
    
    // Map the arrival data to our vessel schema
    const expectedVessels: InsertVessel[] = response.data.map((arrival: any) => {
      return {
        imo: arrival.IMO || `MT-${arrival.MMSI}`,
        mmsi: arrival.MMSI,
        name: arrival.SHIP_NAME,
        vesselType: mapVesselType(arrival.TYPE_NAME || 'Tanker'),
        flag: arrival.FLAG || 'Unknown',
        built: null,
        deadweight: null,
        currentLat: arrival.LAT || null,
        currentLng: arrival.LON || null,
        departurePort: arrival.LAST_PORT || 'Unknown',
        departureDate: arrival.LAST_PORT_TIME ? new Date(arrival.LAST_PORT_TIME) : null,
        destinationPort: arrival.PORT_NAME || 'Unknown',
        eta: arrival.ETA ? new Date(arrival.ETA) : null,
        cargoType: 'crude_oil',
        cargoCapacity: null,
        currentRegion: determineRegion(
          parseFloat(arrival.LAT || '0'), 
          parseFloat(arrival.LON || '0')
        )
      };
    });
    
    return expectedVessels;
    
  } catch (error) {
    console.error('Error fetching expected arrivals from Marine Traffic API:', error);
    return [];
  }
}

/**
 * Export the Marine Traffic service for integration with the application
 */
export const marineTrafficService = {
  /**
   * Fetch vessel data from Marine Traffic API
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
   * @param portIds Array of Marine Traffic port IDs
   * @returns Array of expected vessels
   */
  getExpectedArrivals: async (portIds: string[]): Promise<InsertVessel[]> => {
    return getExpectedArrivals(portIds);
  },
  
  /**
   * Check if the Marine Traffic API is configured and available
   * @returns Boolean indicating if the service is ready to use
   */
  isConfigured: (): boolean => {
    return !!API_KEY;
  }
};