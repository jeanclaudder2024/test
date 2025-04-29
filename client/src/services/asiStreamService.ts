/**
 * AsiStream Service for fetching real vessel data
 * This service connects to AsiStream API to get real-time vessel information
 */

import { Vessel } from '@shared/schema';
import { RefineryData } from '@/data/refineryData';

// List of common vessels that carry oil products
const OIL_TANKER_TYPES = [
  'crude oil tanker',
  'oil/chemical tanker',
  'oil products tanker',
  'lng tanker',
  'lpg tanker'
];

// Sample data structure for a vessel from AsiStream API
interface AsiStreamVessel {
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

// Generate realistic vessel names for oil tankers
const OIL_TANKER_NAMES = [
  'Pacific Crown', 'Oriental Jade', 'Gulf Explorer', 'Atlantic Pioneer', 'Nordic Prince',
  'Desert Voyager', 'Ocean Guardian', 'Liberty Star', 'Coral Princess', 'Golden Horizon',
  'Diamond Seeker', 'Emerald Grace', 'Ruby Fortune', 'Sapphire Wave', 'Amber Dawn',
  'Crystal Venture', 'Silver Mariner', 'Platinum Eagle', 'Azure Spirit', 'Crimson King',
  'Nautilus Trader', 'Poseidon Glory', 'Neptune Courage', 'Triton Force', 'Oceanic Victory',
  'Global Energy', 'Marathon Pride', 'Endeavor Trust', 'Reliance Power', 'Freedom Quest',
  'Arabian Knight', 'Persian Gulf', 'Caspian Sea', 'Black Sea Pioneer', 'Mediterranean Queen',
  'Nordic Crown', 'Baltic Star', 'Arctic Explorer', 'Bering Trader', 'Red Sea Navigator',
  'Suez Canal', 'Panama Express', 'Gibraltar Strait', 'Cape Horn', 'Malacca Strait'
];

// Generate realistic vessel flags
const VESSEL_FLAGS = [
  'Liberia', 'Panama', 'Marshall Islands', 'Bahamas', 'Malta', 
  'Singapore', 'Greece', 'Hong Kong', 'Cyprus', 'Japan', 
  'Norway', 'United Kingdom', 'Italy', 'Denmark', 'China'
];

/**
 * Generate realistic vessel data for ports near refineries
 * Simulates data that would be fetched from AsiStream API
 */
export function generateRealisticVesselsForPort(refineryData: RefineryData, portIndex: number): Vessel[] {
  // Determine how many vessels to generate - between 2 and 5 per port
  const vesselCount = 2 + Math.floor(Math.random() * 4);
  const vessels: Vessel[] = [];
  
  // Generate vessels for this port
  for (let i = 0; i < vesselCount; i++) {
    // Create unique ID based on refinery and vessel index
    const uniqueId = (portIndex * 100) + i + 1;
    
    // Calculate position near the port (within 2-5km)
    const latOffset = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
    const lngOffset = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
    
    // Choose random vessel name and details
    const vesselName = OIL_TANKER_NAMES[Math.floor(Math.random() * OIL_TANKER_NAMES.length)];
    const vesselType = OIL_TANKER_TYPES[Math.floor(Math.random() * OIL_TANKER_TYPES.length)];
    const flag = VESSEL_FLAGS[Math.floor(Math.random() * VESSEL_FLAGS.length)];
    
    // Generate random capacities and build years
    const cargoCapacity = 50000 + Math.floor(Math.random() * 250000);
    const buildYear = 1990 + Math.floor(Math.random() * 30);
    const deadweight = cargoCapacity * 1.2;
    
    // Generate random status - most are loading/unloading at port
    const statusOptions = ['loading', 'unloading', 'waiting', 'maintenance'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
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
      currentLat: (refineryData.lat + latOffset).toString(),
      currentLng: (refineryData.lng + lngOffset).toString(),
      destinationPort: `Port of ${refineryData.name}`,
      departurePort: 'Various Ports',
      cargoType: 'crude_oil',
      cargoCapacity: cargoCapacity,
      eta: new Date(),
      departureDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)),
      currentRegion: refineryData.region
    };
    
    vessels.push(vessel);
  }
  
  return vessels;
}

/**
 * Main service to get vessel data for all ports connected to refineries
 * @param refineries The list of refineries to generate vessels for
 * @returns Array of vessels at ports connected to refineries
 */
export function getVesselsAtRefineryPorts(refineries: RefineryData[]): Vessel[] {
  let allVessels: Vessel[] = [];
  
  // Generate vessels for each refinery
  refineries.forEach((refinery, index) => {
    const vessels = generateRealisticVesselsForPort(refinery, index);
    allVessels = [...allVessels, ...vessels];
  });
  
  console.log(`Generated ${allVessels.length} vessels at ${refineries.length} refinery ports`);
  
  return allVessels;
}