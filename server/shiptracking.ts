import axios from 'axios';
import { Request, Response } from 'express';

// Environment variables should be properly set
const API_KEY = process.env.MYSHIPTRACKING_API_KEY;
const API_BASE_URL = 'https://api.myshiptracking.com/api/v2';

// Interface for vessel details
interface VesselDetails {
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
 * Route handler to get vessel details by MMSI
 */
export async function getVesselByMmsi(req: Request, res: Response) {
  const { mmsi } = req.params;
  
  // Validate MMSI format
  if (!mmsi || !/^\d{9}$/.test(mmsi)) {
    return res.status(400).json({ 
      error: 'Invalid MMSI format. Must be a 9-digit number.' 
    });
  }

  // Verify API key is available
  if (!API_KEY) {
    console.error('MyShipTracking API key not found in environment variables');
    return res.status(500).json({ 
      error: 'API key configuration missing on server' 
    });
  }
  
  try {
    // Make the API request with the server's API key
    const response = await axios.get(`${API_BASE_URL}/vessel`, {
      params: {
        mmsi,
        response: 'extended'
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the vessel data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching vessel data from MyShipTracking API:', error);
    
    // Handle specific API errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 401 || status === 403) {
        return res.status(401).json({ error: 'API authentication failed' });
      } else if (status === 404) {
        return res.status(404).json({ error: `Vessel with MMSI ${mmsi} not found` });
      } else if (status === 429) {
        return res.status(429).json({ error: 'API rate limit exceeded' });
      }
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Failed to fetch vessel details from external API' 
    });
  }
}

/**
 * Route handler to get multiple vessels by MMSI numbers
 */
export async function getBatchVesselDetails(req: Request, res: Response) {
  const { mmsiList } = req.body;
  
  // Validate input
  if (!Array.isArray(mmsiList) || mmsiList.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request. Expected an array of MMSI numbers.' 
    });
  }
  
  // Limit batch size to avoid excessive API usage
  const MAX_BATCH_SIZE = 10;
  const safeMmsiList = mmsiList.slice(0, MAX_BATCH_SIZE);
  
  // Verify API key
  if (!API_KEY) {
    console.error('MyShipTracking API key not found in environment variables');
    return res.status(500).json({ 
      error: 'API key configuration missing on server' 
    });
  }
  
  try {
    // Make concurrent requests for all vessels
    const promises = safeMmsiList.map(async (mmsi) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/vessel`, {
          params: {
            mmsi,
            response: 'extended'
          },
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      } catch (error) {
        // Log error but continue with other requests
        console.error(`Error fetching vessel MMSI ${mmsi}:`, error);
        return null;
      }
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    // Filter out failed requests
    const validResults = results.filter(result => result !== null);
    
    res.json({
      total: validResults.length,
      requested: safeMmsiList.length,
      vessels: validResults
    });
  } catch (error) {
    console.error('Error processing batch vessel request:', error);
    res.status(500).json({ 
      error: 'Failed to process batch vessel request' 
    });
  }
}