/**
 * MyShipTracking API Client
 * 
 * This module provides functions to interact with the MyShipTracking API via
 * our server-side API endpoint, which handles authentication securely.
 */

// Default options for API requests
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  }
};

// API Key should be stored securely in environment variables
// and accessed here - this is a placeholder
const API_KEY = import.meta.env.VITE_MYSHIPTRACKING_API_KEY || '';

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
  flag?: string;
  destination?: string;
  eta?: string;
  callsign?: string;
  length?: number;
  width?: number;
  draught?: number;
}

/**
 * Error class for API responses
 */
export class VesselAPIError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'VesselAPIError';
    this.status = status;
  }
}

/**
 * Get detailed information about a vessel by its MMSI number
 * 
 * @param mmsi The 9-digit MMSI number of the vessel
 * @param apiKey Optional API key, if not using the server endpoint
 * @returns Promise with vessel details
 */
export async function getVesselDetails(mmsi: string, apiKey?: string): Promise<VesselDetails> {
  try {
    // Input validation
    if (!mmsi || !/^\d{9}$/.test(mmsi)) {
      throw new VesselAPIError('Invalid MMSI format. Must be a 9-digit number.', 400);
    }
    
    // Check if we should use direct API call (with apiKey) or server endpoint
    if (apiKey) {
      // Direct API call with provided key (not recommended for production)
      return getVesselDirectFromAPI(mmsi, apiKey);
    } else {
      // Server-side endpoint (recommended for production)
      return getVesselFromServerEndpoint(mmsi);
    }
  } catch (error) {
    if (error instanceof VesselAPIError) {
      throw error;
    }
    
    // Handle other errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new VesselAPIError(`Failed to fetch vessel details: ${message}`, 500);
  }
}

/**
 * Get vessel details from our server endpoint
 * The server handles API authentication securely
 * 
 * @param mmsi The vessel MMSI
 * @returns Promise with vessel details
 */
async function getVesselFromServerEndpoint(mmsi: string): Promise<VesselDetails> {
  try {
    const response = await fetch(`/api/vessels/lookup/${mmsi}`, defaultOptions);
    
    if (!response.ok) {
      // Handle error responses from our server
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || errorData.message || 'API request failed';
      throw new VesselAPIError(errorMessage, response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof VesselAPIError) {
      throw error;
    }
    
    // Network errors or JSON parsing errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new VesselAPIError(`Server API request failed: ${message}`, 500);
  }
}

/**
 * Get vessel details directly from MyShipTracking API
 * Note: This should only be used for testing, as it exposes the API key to the client
 * 
 * @param mmsi The vessel MMSI
 * @param apiKey The MyShipTracking API key
 * @returns Promise with vessel details
 */
async function getVesselDirectFromAPI(mmsi: string, apiKey: string): Promise<VesselDetails> {
  try {
    // Direct API call to MyShipTracking (not recommended for production)
    const response = await fetch(`https://api.myshiptracking.com/api/v2/vessel?mmsi=${mmsi}&response=extended`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // Handle API error responses
      const status = response.status;
      let errorMessage = 'API request failed';
      
      if (status === 401 || status === 403) {
        errorMessage = 'API authentication failed';
      } else if (status === 404) {
        errorMessage = `Vessel with MMSI ${mmsi} not found`;
      } else if (status === 429) {
        errorMessage = 'API rate limit exceeded';
      }
      
      throw new VesselAPIError(errorMessage, status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof VesselAPIError) {
      throw error;
    }
    
    // Network errors or JSON parsing errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new VesselAPIError(`API request failed: ${message}`, 500);
  }
}

/**
 * Batch lookup multiple vessels by MMSI numbers
 * 
 * @param mmsiList Array of MMSI numbers to look up
 * @returns Promise with array of vessel details
 */
export async function batchVesselLookup(mmsiList: string[]): Promise<VesselDetails[]> {
  try {
    // Input validation
    if (!Array.isArray(mmsiList) || mmsiList.length === 0) {
      throw new VesselAPIError('Invalid MMSI list. Must be an array of MMSI numbers.', 400);
    }
    
    // Use server endpoint to get multiple vessels
    const response = await fetch(`/api/vessels/lookup/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mmsiList })
    });
    
    if (!response.ok) {
      // Handle error responses
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || errorData.message || 'Batch lookup failed';
      throw new VesselAPIError(errorMessage, response.status);
    }
    
    const data = await response.json();
    return data.vessels || [];
  } catch (error) {
    if (error instanceof VesselAPIError) {
      throw error;
    }
    
    // Network errors or JSON parsing errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new VesselAPIError(`Batch lookup failed: ${message}`, 500);
  }
}

/**
 * Demonstration function to show API usage
 * This should only be used for testing, not in production
 */
export async function demoVesselLookup(apiKey: string): Promise<VesselDetails | null> {
  // Example MMSI - this is just a placeholder and might not be valid
  const exampleMmsi = '366943250'; // Example: a USCG vessel
  
  console.log(`Fetching details for vessel with MMSI: ${exampleMmsi}...`);
  
  try {
    const vesselInfo = await getVesselDetails(exampleMmsi, apiKey);
    console.log('Vessel details found:');
    console.log(JSON.stringify(vesselInfo, null, 2));
    return vesselInfo;
  } catch (error) {
    console.error('Demo lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}