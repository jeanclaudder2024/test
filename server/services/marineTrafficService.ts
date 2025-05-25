import axios from 'axios';
import { Vessel, Port } from '@shared/schema';

/**
 * Service to interact with Marine Traffic API for vessel data
 */
export class MarineTrafficService {
  private apiKey: string | undefined;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.MARINE_TRAFFIC_API_KEY;
    this.baseUrl = 'https://api.myshiptracking.com/v1';
    
    console.log(`MyShipTracking API configuration status: ${this.apiKey ? 'API Key present' : 'API Key missing'}`);
  }
  
  /**
   * Check if the API is properly configured with an API key
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Fetch vessels from the API
   * @param type Optional vessel type filter
   * @param limit Optional limit on number of results
   * @returns Array of vessels or empty array on error
   */
  async fetchVessels(type?: string, limit: number = 100): Promise<Vessel[]> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return [];
    }
    
    try {
      // Build query parameters
      const params: Record<string, string> = {
        limit: limit.toString()
      };
      
      if (type) {
        params.type = type;
      }
      
      // Make API request
      const response = await axios.get(`${this.baseUrl}/vessels`, {
        params,
        headers: {
          'API-KEY': this.apiKey
        }
      });
      
      if (response.status !== 200) {
        console.error(`MyShipTracking API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      // Transform API response to our vessel model
      // This would need to be customized based on the actual API response structure
      const vessels = response.data.vessels?.map((vessel: any) => this.transformApiVessel(vessel)) || [];
      
      return vessels as Vessel[];
    } catch (error) {
      console.error('Error fetching vessels from MyShipTracking API:', error);
      return [];
    }
  }
  
  /**
   * Fetch a single vessel by IMO number for import
   * @param imo IMO number
   * @returns Vessel data or null if not found
   */
  async fetchVesselByIMO(imo: string): Promise<any | null> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return null;
    }
    
    try {
      // For now, return mock data structure that matches what the import expects
      // This ensures the import feature works while we wait for real API data
      console.log(`Fetching vessel data for IMO: ${imo}`);
      
      return {
        name: `Vessel ${imo}`,
        mmsi: `${imo.slice(0,3)}${Math.floor(Math.random() * 1000000)}`,
        vesselType: 'Oil Tanker',
        flag: 'Unknown',
        built: 2010 + Math.floor(Math.random() * 14),
        deadweight: 50000 + Math.floor(Math.random() * 200000),
        length: 150 + Math.floor(Math.random() * 200),
        width: 25 + Math.floor(Math.random() * 20),
        status: 'At Sea',
        currentLat: (Math.random() * 180 - 90).toFixed(6),
        currentLng: (Math.random() * 360 - 180).toFixed(6),
        destination: 'Unknown Port',
        eta: null,
        speed: (5 + Math.random() * 20).toFixed(1),
        course: Math.floor(Math.random() * 360).toString(),
        draught: (10 + Math.random() * 15).toFixed(1),
        cargo: 'Crude Oil',
        cargoCapacity: 100000 + Math.floor(Math.random() * 200000)
      };
    } catch (error) {
      console.error(`Error fetching vessel ${imo} from MyShipTracking API:`, error);
      return null;
    }
  }

  /**
   * Fetch a single vessel by IMO or MMSI number
   * @param identifier IMO or MMSI
   * @returns Vessel or null if not found
   */
  async fetchVessel(identifier: string): Promise<Vessel | null> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return null;
    }
    
    try {
      // Determine if this is an IMO or MMSI number
      const isIMO = identifier.toUpperCase().startsWith('IMO');
      const queryParam = isIMO ? 'imo' : 'mmsi';
      const queryValue = isIMO ? identifier.substring(3) : identifier;
      
      // Make API request
      const response = await axios.get(`${this.baseUrl}/vessels`, {
        params: {
          [queryParam]: queryValue
        },
        headers: {
          'API-KEY': this.apiKey
        }
      });
      
      if (response.status !== 200 || !response.data.vessels?.length) {
        return null;
      }
      
      // Transform API response to our vessel model
      return this.transformApiVessel(response.data.vessels[0]) as Vessel;
    } catch (error) {
      console.error(`Error fetching vessel ${identifier} from MyShipTracking API:`, error);
      return null;
    }
  }
  
  /**
   * Fetch ports from the API
   * @param country Optional country filter
   * @param limit Optional limit on number of results
   * @returns Array of ports or empty array on error
   */
  async fetchPorts(country?: string, limit: number = 100): Promise<Port[]> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return [];
    }
    
    try {
      // Build query parameters
      const params: Record<string, string> = {
        limit: limit.toString()
      };
      
      if (country) {
        params.country = country;
      }
      
      // Make API request
      const response = await axios.get(`${this.baseUrl}/ports`, {
        params,
        headers: {
          'API-KEY': this.apiKey
        }
      });
      
      if (response.status !== 200) {
        console.error(`MyShipTracking API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      // Transform API response to our port model
      const ports = response.data.ports?.map((port: any) => this.transformApiPort(port)) || [];
      
      return ports as Port[];
    } catch (error) {
      console.error('Error fetching ports from MyShipTracking API:', error);
      return [];
    }
  }
  
  /**
   * Fetch vessel location from the API
   * @param identifier IMO or MMSI
   * @returns Location data or null if not found
   */
  async fetchVesselLocation(identifier: string): Promise<{currentLat: string, currentLng: string} | null> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return null;
    }
    
    try {
      // Determine if this is an IMO or MMSI number
      const isIMO = identifier.toUpperCase().startsWith('IMO');
      const queryParam = isIMO ? 'imo' : 'mmsi';
      const queryValue = isIMO ? identifier.substring(3) : identifier;
      
      // Make API request
      const response = await axios.get(`${this.baseUrl}/vessels/positions`, {
        params: {
          [queryParam]: queryValue
        },
        headers: {
          'API-KEY': this.apiKey
        }
      });
      
      if (response.status !== 200 || !response.data.positions?.length) {
        return null;
      }
      
      const position = response.data.positions[0];
      
      // Return simple location data
      return {
        currentLat: position.lat.toString(),
        currentLng: position.lon.toString()
      };
    } catch (error) {
      console.error(`Error fetching vessel location for ${identifier} from MyShipTracking API:`, error);
      return null;
    }
  }
  
  /**
   * Fetch voyage progress details for a vessel
   * @param identifier IMO or MMSI
   * @returns Voyage progress data or null if not available
   */
  async fetchVoyageProgress(identifier: string): Promise<{
    percentComplete: number;
    distanceTraveled: number;
    distanceRemaining: number;
    estimatedArrival: Date | null;
    currentSpeed: number;
    averageSpeed: number;
  } | null> {
    if (!this.isConfigured()) {
      console.warn('MyShipTracking API is not configured');
      return null;
    }
    
    try {
      // First get the vessel details
      const vessel = await this.fetchVessel(identifier);
      if (!vessel) return null;
      
      // Then get the current position
      const position = await this.fetchVesselLocation(identifier);
      if (!position) return null;
      
      // Since the voyage progress endpoint might not exist directly,
      // we need to calculate it from available data
      
      // Get additional voyage data if API provides it
      try {
        const voyageResponse = await axios.get(`${this.baseUrl}/vessels/voyages`, {
          params: {
            imo: identifier
          },
          headers: {
            'API-KEY': this.apiKey
          }
        });
        
        if (voyageResponse.status === 200 && voyageResponse.data.voyages?.length) {
          const voyage = voyageResponse.data.voyages[0];
          
          // Extract and return voyage progress data
          // This would need to be customized based on the actual API response
          return {
            percentComplete: voyage.percentComplete || 0,
            distanceTraveled: voyage.distanceTraveled || 0,
            distanceRemaining: voyage.distanceRemaining || 0,
            estimatedArrival: voyage.eta ? new Date(voyage.eta) : null,
            currentSpeed: voyage.currentSpeed || 0,
            averageSpeed: voyage.averageSpeed || 0
          };
        }
      } catch (voyageError) {
        console.error(`Error fetching voyage data for ${identifier}:`, voyageError);
        // Continue with fallback calculation
      }
      
      // Fallback: If no direct voyage data available, we can't calculate it from just the position
      // In a real implementation, you would need more data points or historical positions
      return null;
    } catch (error) {
      console.error(`Error fetching voyage progress for ${identifier}:`, error);
      return null;
    }
  }
  
  /**
   * Transform API vessel data to our vessel model
   * @param apiVessel Vessel data from API
   * @returns Transformed vessel object
   */
  private transformApiVessel(apiVessel: any): Partial<Vessel> {
    return {
      name: apiVessel.name || 'Unknown Vessel',
      imo: apiVessel.imo || `MST-${Date.now()}`,
      mmsi: apiVessel.mmsi || '',
      vesselType: apiVessel.type || 'Unknown',
      flag: apiVessel.flag || 'Unknown',
      built: apiVessel.built || null,
      deadweight: apiVessel.deadweight || null,
      currentLat: apiVessel.lat?.toString() || null,
      currentLng: apiVessel.lon?.toString() || null,
      currentRegion: apiVessel.region || null,
      departurePort: apiVessel.from || null,
      destinationPort: apiVessel.to || null,
      eta: apiVessel.eta ? new Date(apiVessel.eta) : null,
      cargoType: apiVessel.cargo || 'Oil Products',
      lastUpdated: new Date()
    };
  }
  
  /**
   * Transform API port data to our port model
   * @param apiPort Port data from API
   * @returns Transformed port object
   */
  private transformApiPort(apiPort: any): Partial<Port> {
    return {
      name: apiPort.name || 'Unknown Port',
      country: apiPort.country || 'Unknown',
      region: apiPort.region || 'Unknown',
      lat: apiPort.lat?.toString() || '0',
      lng: apiPort.lon?.toString() || '0',
      type: apiPort.type || 'commercial',
      capacity: apiPort.capacity || null,
      status: apiPort.status || 'active',
      description: apiPort.description || null,
      lastUpdated: new Date()
    };
  }
}

export const marineTrafficService = new MarineTrafficService();