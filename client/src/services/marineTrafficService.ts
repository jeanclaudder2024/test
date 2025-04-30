import axios from 'axios';
import { Vessel } from '@shared/schema';
import { REGIONS } from '@shared/constants';

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
  const typeMap: Record<string, string> = {
    'Tanker': 'Oil Tanker',
    'Crude Oil Tanker': 'Oil Tanker',
    'Oil/Chemical Tanker': 'Oil Tanker',
    'Chemical Tanker': 'Chemical Tanker',
    'LPG Tanker': 'LPG Tanker',
    'LNG Tanker': 'LNG Tanker',
    'Container Ship': 'Container Ship',
    'Bulk Carrier': 'Bulk Carrier',
    'General Cargo': 'General Cargo',
    'Passenger': 'Passenger',
    'Fishing': 'Fishing Vessel'
  };
  
  return typeMap[marineTrafficType] || 'Other';
}

/**
 * Determine region based on coordinates
 */
function determineRegion(lat: number, lng: number): string {
  // Simple region determination based on coordinates
  if (lat > 20 && lat < 72 && lng > -170 && lng < -30) {
    return 'North America';
  } else if (lat > -60 && lat < 15 && lng > -90 && lng < -30) {
    return 'South America';
  } else if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    return 'Europe';
  } else if (lat > 5 && lat < 40 && lng > 30 && lng < 80) {
    return 'Middle East';
  } else if (lat > -40 && lat < 35 && lng > -20 && lng < 55 && !(lat > 5 && lng > 30)) {
    return 'Africa';
  } else if (lat > 0 && lat < 60 && lng > 60 && lng < 180) {
    return 'Asia';
  } else if (lat > -10 && lat < 20 && lng > 90 && lng < 140) {
    return 'Southeast Asia';
  } else if (lat > -50 && lat < -10 && lng > 110 && lng < 180) {
    return 'Australia';
  }
  
  // Default region
  return 'Other';
}

/**
 * Directly fetch vessels from Marine Traffic API
 */
export async function fetchVesselsFromAPI(): Promise<Vessel[]> {
  try {
    // Fetch vessels from the Marine Traffic API
    const response = await axios.get('/api/vessels/marine-traffic');
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response from Marine Traffic API:', response.data);
      return [];
    }
    
    // Map the API response to our vessel schema
    const vessels: Vessel[] = response.data.map((vessel: MarineTrafficVesselPosition, index: number) => {
      const lat = parseFloat(vessel.LAT);
      const lng = parseFloat(vessel.LON);
      const region = determineRegion(lat, lng);
      
      return {
        id: index + 1, // Generate sequential IDs
        name: vessel.SHIP_NAME,
        imo: vessel.IMO || `IMO${Math.floor(Math.random() * 1000000)}`,
        mmsi: vessel.MMSI,
        vesselType: mapVesselType(vessel.TYPE_NAME),
        flag: vessel.FLAG || 'Unknown',
        built: null,
        deadweight: null,
        currentLat: vessel.LAT,
        currentLng: vessel.LON,
        destinationPort: vessel.DESTINATION || 'Unknown',
        departurePort: vessel.LAST_PORT || 'Unknown',
        cargoType: 'Crude Oil', // Default cargo type
        cargoCapacity: null,
        eta: vessel.ETA ? new Date(vessel.ETA) : null,
        departureDate: vessel.LAST_PORT_TIME ? new Date(vessel.LAST_PORT_TIME) : null,
        currentRegion: region,
        
        // Additional properties from Marine Traffic
        heading: vessel.HEADING,
        speed: vessel.SPEED,
        status: vessel.STATUS
      };
    });
    
    return vessels;
  } catch (error) {
    console.error('Error fetching vessels from Marine Traffic API:', error);
    return [];
  }
}

/**
 * Directly fetch refineries (this would normally come from the API, but we'll use a hardcoded list for now)
 */
export async function fetchRefineries(): Promise<any[]> {
  try {
    // In a real implementation, this would be an API call
    const response = await axios.get('/api/refineries');
    return response.data;
  } catch (error) {
    console.error('Error fetching refineries:', error);
    
    // Return a simple list of major refineries
    return [
      {
        id: 1,
        name: 'Saudi Aramco Ras Tanura',
        country: 'Saudi Arabia',
        region: 'Middle East',
        lat: '26.6444',
        lng: '50.1520',
        capacity: 550000,
        status: 'Active'
      },
      {
        id: 2,
        name: 'Port Arthur Refinery',
        country: 'United States',
        region: 'North America',
        lat: '29.8761',
        lng: '-93.9577',
        capacity: 600000,
        status: 'Active'
      },
      {
        id: 3,
        name: 'Reliance Jamnagar Refinery',
        country: 'India',
        region: 'Asia',
        lat: '22.2500',
        lng: '69.0833',
        capacity: 1240000,
        status: 'Active'
      },
      {
        id: 4,
        name: 'SK Energy Ulsan',
        country: 'South Korea',
        region: 'Asia',
        lat: '35.5472',
        lng: '129.3194',
        capacity: 840000,
        status: 'Active'
      },
      {
        id: 5,
        name: 'ExxonMobil Singapore',
        country: 'Singapore',
        region: 'Southeast Asia',
        lat: '1.2800',
        lng: '103.7000',
        capacity: 592000,
        status: 'Active'
      }
    ];
  }
}