import axios from 'axios';

/**
 * AIS Stream API Service for vessel data
 * Provides reliable vessel information using AIS Stream API
 */
export class AISStreamService {
  private apiKey: string | undefined;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.AIS_STREAM_API_KEY;
    this.baseUrl = 'https://api.aisstream.io/v0';
    
    console.log(`AIS Stream API configuration status: ${this.apiKey ? 'API Key present' : 'API Key missing'}`);
  }
  
  /**
   * Check if the API is properly configured with an API key
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Fetch vessel by IMO number
   * @param imo IMO number
   * @returns Vessel data or null if not found
   */
  async fetchVesselByIMO(imo: string): Promise<any | null> {
    if (!this.isConfigured()) {
      console.warn('AIS Stream API is not configured');
      return null;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/vessels`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        params: {
          imo: imo
        }
      });
      
      if (response.data && response.data.length > 0) {
        return this.transformVesselData(response.data[0]);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching vessel by IMO ${imo} from AIS Stream:`, error);
      return null;
    }
  }
  
  /**
   * Fetch vessel by MMSI number
   * @param mmsi MMSI number
   * @returns Vessel data or null if not found
   */
  async fetchVesselByMMSI(mmsi: string): Promise<any | null> {
    if (!this.isConfigured()) {
      console.warn('AIS Stream API is not configured');
      return null;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/vessels`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        params: {
          mmsi: mmsi
        }
      });
      
      if (response.data && response.data.length > 0) {
        return this.transformVesselData(response.data[0]);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching vessel by MMSI ${mmsi} from AIS Stream:`, error);
      return null;
    }
  }
  
  /**
   * Transform AIS Stream vessel data to our vessel model
   * @param aisVessel Vessel data from AIS Stream API
   * @returns Transformed vessel object
   */
  private transformVesselData(aisVessel: any): any {
    return {
      name: aisVessel.vesselName || aisVessel.name || 'Unknown Vessel',
      imo: aisVessel.imo || '',
      mmsi: aisVessel.mmsi || '',
      vesselType: this.mapVesselType(aisVessel.vesselType || aisVessel.type),
      flag: aisVessel.flag || aisVessel.flagCountry || 'Unknown',
      built: aisVessel.builtYear || aisVessel.yearBuilt || null,
      deadweight: aisVessel.deadweight || aisVessel.dwt || null,
      currentLat: aisVessel.latitude?.toString() || aisVessel.lat?.toString() || null,
      currentLng: aisVessel.longitude?.toString() || aisVessel.lng?.toString() || null,
      cargoCapacity: aisVessel.cargoCapacity || aisVessel.capacity || null,
      course: aisVessel.course || aisVessel.heading || null,
      speed: aisVessel.speed || aisVessel.sog || null,
      draught: aisVessel.draught || aisVessel.draft || null,
      destinationPort: aisVessel.destination || null,
      eta: aisVessel.eta ? new Date(aisVessel.eta) : null,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Map AIS vessel type to our vessel type
   * @param aisType AIS vessel type code or name
   * @returns Our vessel type
   */
  private mapVesselType(aisType: any): string {
    if (!aisType) return 'OIL_TANKER';
    
    const type = aisType.toString().toLowerCase();
    
    if (type.includes('tanker') || type.includes('oil')) return 'OIL_TANKER';
    if (type.includes('cargo') || type.includes('bulk')) return 'BULK_CARRIER';
    if (type.includes('container')) return 'CONTAINER_SHIP';
    if (type.includes('lng') || type.includes('gas')) return 'LNG_CARRIER';
    
    return 'OIL_TANKER'; // Default for oil industry focus
  }
}

// Export instance
export const aisStreamService = new AISStreamService();