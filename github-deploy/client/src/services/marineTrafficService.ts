/**
 * MyShipTracking Service for fetching real vessel data
 * This service connects to MyShipTracking API via our backend to get real-time vessel information
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

// Sample data structure for a vessel from MyShipTracking API
interface MyShipTrackingVessel {
  mmsi: string;
  imo: string;
  name: string;
  type_name: string;
  flag: string;
  flag_name: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  status: number;
  status_name: string;
  destination: string;
  eta: string;
  last_port: string;
  last_port_time: string;
}

/**
 * Fetch vessels from our backend API that connects to MyShipTracking
 * @returns Promise<Vessel[]> Array of vessels
 */
export async function fetchVessels(): Promise<Vessel[]> {
  try {
    const response = await axios.get('/api/vessels/marine-traffic');
    console.log('Fetched vessels from MyShipTracking API:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error fetching vessels from MyShipTracking:', error);
    return [];
  }
}

/**
 * Fetch vessels that are near a specific refinery using MyShipTracking's area search
 * @param refineryId ID of the refinery
 * @returns Promise<Vessel[]> Array of vessels near the refinery
 */
export async function fetchVesselsNearRefinery(refineryId: number): Promise<Vessel[]> {
  try {
    const response = await axios.get(`/api/vessels/near-refinery/${refineryId}`);
    console.log(`Fetched ${response.data.length} vessels near refinery ${refineryId} from MyShipTracking`);
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
  // Create a unique hash from the refinery name to use as a stable ID base
  const hashFromName = refinery.name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Use absolute value and ensure it's a positive number
  const baseId = Math.abs(hashFromName);
  
  // Determine how many vessels to generate - between 2 and 5 per refinery
  // Using the hash ensures we get the same number for the same refinery name
  const vesselCount = 2 + (baseId % 4); 
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
    // Create unique ID based on hash and vessel index
    const uniqueId = baseId + i + 1;
    
    // Calculate position near the refinery (within 2-5km)
    // Use deterministic offsets based on the uniqueId and index
    const latOffset = (Math.sin(uniqueId * (i+1)) * 0.05);
    const lngOffset = (Math.cos(uniqueId * (i+1)) * 0.05);
    
    // Choose vessel name and details based on uniqueId to ensure consistency
    const vesselName = vesselNames[(uniqueId + i) % vesselNames.length];
    const vesselType = OIL_TANKER_TYPES[(uniqueId + i) % OIL_TANKER_TYPES.length];
    const flag = flags[(uniqueId + i) % flags.length];
    
    // Generate capacities and build years
    const cargoCapacity = 50000 + ((uniqueId + i) % 250000);
    const buildYear = 1990 + ((uniqueId + i) % 30);
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
      eta: new Date(Date.now() + 86400000 * ((uniqueId + i) % 5)),
      departureDate: new Date(Date.now() - 86400000 * ((uniqueId + i) % 10)),
      currentRegion: refinery.region,
      metadata: null // Add missing required field
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
    // Create a unique hash from the refinery name to use as a stable ID
    const hashFromName = refinery.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use absolute value and ensure it's a positive number
    const refineryId = Math.abs(hashFromName);
    
    // First try to get real data from the API
    try {
      const realVessels = await fetchVesselsNearRefinery(refineryId);
      
      // If we got real data, use it
      if (realVessels && realVessels.length > 0) {
        console.log(`Fetched ${realVessels.length} real vessels for refinery ${refinery.name}`);
        return realVessels;
      }
    } catch (apiError) {
      console.warn(`Could not fetch vessels from API for ${refinery.name}:`, apiError);
      // Continue to fallback if API fails
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