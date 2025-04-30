/**
 * MarineTraffic Service for fetching real vessel data
 * This service connects to Marine Traffic API to get real-time vessel information
 */

import { Vessel } from '@shared/schema';
import { RefineryData } from '@/data/refineryData';
import axios from 'axios';

// List of common vessels that carry oil products
export const OIL_TANKER_TYPES = [
  'crude oil tanker',
  'oil/chemical tanker',
  'oil products tanker',
  'lng tanker',
  'lpg tanker'
];

// Sample data structure for a vessel from Marine Traffic API
interface MarineTrafficVessel {
  mmsi: string;
  imo: string;
  name: string;
  type: string;
  flag: string;
  position: {
    lat: number;
    lng: number;
  };
  course: number;
  speed: number;
  destination: string;
  eta: string;
  lastReport: string;
}

/**
 * Fetch vessels from our backend API that connects to Marine Traffic
 * @returns Promise<Vessel[]> Array of vessels
 */
export async function fetchVessels(): Promise<Vessel[]> {
  try {
    const response = await axios.get('/api/vessels/marine-traffic');
    return response.data;
  } catch (error) {
    console.error('Error fetching vessels from Marine Traffic:', error);
    return [];
  }
}

/**
 * Fetch vessels that are near a specific refinery
 * @param refineryId ID of the refinery
 * @returns Promise<Vessel[]> Array of vessels near the refinery
 */
export async function fetchVesselsNearRefinery(refineryId: number): Promise<Vessel[]> {
  try {
    const response = await axios.get(`/api/vessels/near-refinery/${refineryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vessels near refinery ID ${refineryId}:`, error);
    return [];
  }
}

/**
 * Generate realistic vessel data for ports near refineries when API data is not available
 * This is used as a fallback when MarineTraffic API calls fail or are not configured
 */
export function generateVesselsForRefinery(refinery: RefineryData): Vessel[] {
  // Determine how many vessels to generate - between 2 and 5 per refinery
  const vesselCount = 2 + Math.floor(Math.random() * 4);
  const vessels: Vessel[] = [];
  
  // Generate realistic vessel names for oil tankers
  const vesselNames = [
    'Pacific Crown', 'Oriental Jade', 'Gulf Explorer', 'Atlantic Pioneer', 'Nordic Prince',
    'Desert Voyager', 'Ocean Guardian', 'Liberty Star', 'Coral Princess', 'Golden Horizon'
  ];
  
  // Generate realistic vessel flags
  const flags = [
    'Liberia', 'Panama', 'Marshall Islands', 'Bahamas', 'Malta', 
    'Singapore', 'Greece', 'Hong Kong', 'Cyprus', 'Japan'
  ];
  
  // Generate vessels for this refinery
  for (let i = 0; i < vesselCount; i++) {
    // Create unique ID based on refinery and vessel index
    const uniqueId = (refinery.id * 100) + i + 1;
    
    // Calculate position near the refinery (within 2-5km)
    const latOffset = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
    const lngOffset = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
    
    // Choose random vessel name and details
    const vesselName = vesselNames[Math.floor(Math.random() * vesselNames.length)];
    const vesselType = OIL_TANKER_TYPES[Math.floor(Math.random() * OIL_TANKER_TYPES.length)];
    const flag = flags[Math.floor(Math.random() * flags.length)];
    
    // Generate random capacities and build years
    const cargoCapacity = 50000 + Math.floor(Math.random() * 250000);
    const buildYear = 1990 + Math.floor(Math.random() * 30);
    const deadweight = cargoCapacity * 1.2;
    
    // Parse refinery coordinates
    const refineryLat = typeof refinery.lat === 'number' 
      ? refinery.lat 
      : parseFloat(String(refinery.lat));
    
    const refineryLng = typeof refinery.lng === 'number'
      ? refinery.lng
      : parseFloat(String(refinery.lng));
    
    // Create vessel object that matches the schema definition
    const vessel: Vessel = {
      id: uniqueId,
      name: vesselName,
      imo: `IMO${9000000 + uniqueId}`,
      mmsi: `${200000000 + uniqueId}`,
      vesselType: vesselType,
      flag: flag,
      built: buildYear,
      deadweight: Math.round(deadweight),
      currentLat: (refineryLat + latOffset).toString(),
      currentLng: (refineryLng + lngOffset).toString(),
      destinationPort: `Port of ${refinery.name}`,
      departurePort: 'Various Ports',
      cargoType: 'crude_oil',
      cargoCapacity: cargoCapacity,
      eta: new Date(Date.now() + 86400000 * Math.floor(Math.random() * 5)),
      departureDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)),
      currentRegion: refinery.region
    };
    
    vessels.push(vessel);
  }
  
  return vessels;
}

/**
 * Main service function to get vessels for a refinery
 * First tries to fetch real data, falls back to generated data if that fails
 */
export async function getVesselsForRefinery(refinery: RefineryData): Promise<Vessel[]> {
  try {
    // First try to get real data from the API
    if (refinery && refinery.id) {
      const realVessels = await fetchVesselsNearRefinery(refinery.id);
      
      // If we got real data, use it
      if (realVessels && realVessels.length > 0) {
        console.log(`Fetched ${realVessels.length} real vessels for refinery ${refinery.name}`);
        return realVessels;
      }
    }
    
    // If no real data, generate fallback data
    const generatedVessels = generateVesselsForRefinery(refinery);
    console.log(`Generated ${generatedVessels.length} fallback vessels for refinery ${refinery.name}`);
    return generatedVessels;
    
  } catch (error) {
    console.error(`Error getting vessels for refinery ${refinery.name}:`, error);
    
    // In case of any error, generate fallback data
    const fallbackVessels = generateVesselsForRefinery(refinery);
    console.log(`Generated ${fallbackVessels.length} fallback vessels after error for refinery ${refinery.name}`);
    return fallbackVessels;
  }
}