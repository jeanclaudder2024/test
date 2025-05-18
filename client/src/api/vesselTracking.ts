/**
 * Vessel tracking API module
 * Provides functions to fetch vessel information from the MyShipTracking API
 */

import axios from 'axios';

// API configuration
const API_CONFIG = {
  baseURL: 'https://api.myshiptracking.com/api/v2',
  headers: {
    'Content-Type': 'application/json',
  }
};

// API Key should be stored securely in environment variables
// and accessed here - this is a placeholder
const API_KEY = process.env.MYSHIPTRACKING_API_KEY || '';

/**
 * Interface for vessel details returned by the API
 */
export interface VesselDetails {
  vessel_name: string;
  mmsi: number;
  imo: number | null;
  vtype: number;
  lat: number;
  lng: number;
  course: number;
  speed: number;
  nav_status: string;
  received: string;
  // Additional fields that might be returned
  flag?: string;
  destination?: string;
  eta?: string;
  callsign?: string;
  length?: number;
  width?: number;
  draught?: number;
}

/**
 * Fetches detailed information about a vessel by its MMSI number
 *
 * @param mmsi - The 9-digit MMSI identifier of the vessel
 * @param apiKey - Optional API key override (otherwise uses environment variable)
 * @returns Promise resolving to the vessel details
 * @throws Error if the API request fails or returns invalid data
 */
export async function getVesselDetails(mmsi: string | number, apiKey = API_KEY): Promise<VesselDetails> {
  // Validate MMSI format
  const mmsiString = String(mmsi);
  if (!/^\d{9}$/.test(mmsiString)) {
    throw new Error('Invalid MMSI format. Must be a 9-digit number.');
  }

  // Validate API key
  if (!apiKey) {
    throw new Error('No API key provided. Set MYSHIPTRACKING_API_KEY environment variable or pass it as a parameter.');
  }

  try {
    // Create request configuration
    const requestConfig = {
      ...API_CONFIG,
      headers: {
        ...API_CONFIG.headers,
        // Use Bearer token format for authorization
        'Authorization': `Bearer ${apiKey}`,
        // Alternative method (uncomment if needed)
        // 'x-api-key': apiKey
      }
    };

    // Make the API request
    const response = await axios.get(`${API_CONFIG.baseURL}/vessel`, {
      ...requestConfig,
      params: {
        mmsi: mmsiString,
        response: 'extended'
      }
    });

    // Check if we got a valid response
    if (!response.data || response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    // Return the vessel details
    return response.data as VesselDetails;
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a non-2xx status
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('API authentication failed. Please check your API key.');
        } else if (error.response.status === 404) {
          throw new Error(`Vessel with MMSI ${mmsi} not found.`);
        } else if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from API. Please check your network connection.');
      } else {
        // Something happened in setting up the request
        throw new Error(`Error setting up API request: ${error.message}`);
      }
    }
    
    // For non-Axios errors, rethrow with a generic message
    throw new Error(`Failed to fetch vessel details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches detailed information for multiple vessels by their MMSI numbers
 * 
 * @param mmsiList - Array of MMSI numbers to fetch
 * @param apiKey - Optional API key override
 * @returns Promise resolving to an array of vessel details
 * @throws Error if the API requests fail
 */
export async function getBatchVesselDetails(
  mmsiList: (string | number)[],
  apiKey = API_KEY
): Promise<VesselDetails[]> {
  // Don't attempt if API key is missing
  if (!apiKey) {
    throw new Error('No API key provided. Set MYSHIPTRACKING_API_KEY environment variable or pass it as a parameter.');
  }
  
  // Limit batch size to avoid excessive API usage
  const MAX_BATCH_SIZE = 10;
  const safeMmsiList = mmsiList.slice(0, MAX_BATCH_SIZE);
  
  try {
    // Make concurrent requests for all vessels
    const promises = safeMmsiList.map(mmsi => getVesselDetails(mmsi, apiKey));
    return await Promise.all(promises);
  } catch (error) {
    throw new Error(`Failed to fetch batch vessel details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Demonstration function to show API usage
 * This should only be used for testing, not in production
 */
export async function demoVesselLookup(): Promise<void> {
  // Example MMSI - this is just a placeholder and might not be valid
  const exampleMmsi = '366943250'; // Example: a USCG vessel
  
  console.log(`Fetching details for vessel with MMSI: ${exampleMmsi}...`);
  
  try {
    const vesselInfo = await getVesselDetails(exampleMmsi);
    console.log('Vessel details found:');
    console.log(JSON.stringify(vesselInfo, null, 2));
    return vesselInfo;
  } catch (error) {
    console.error('Demo lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}