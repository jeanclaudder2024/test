import axios from 'axios';
import { storage } from '../storage';
import { Vessel } from '@shared/schema';

// Calculate distance between two points on globe in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const vesselDataService = {
  // Get vessels near a specific location
  async getVesselsNearLocation(lat: number, lng: number, radiusKm: number = 150): Promise<Vessel[]> {
    try {
      // First try to get vessels from Marine Traffic API if configured
      if (process.env.MARINE_TRAFFIC_API_KEY) {
        try {
          // Try to get real-time vessel data from Marine Traffic API
          const apiUrl = `https://api.myshiptracking.com/v1/vessels`;
          const response = await axios.get(apiUrl, {
            params: {
              radius: radiusKm,
              lat: lat,
              lng: lng,
              limit: 30 // Request more vessels to account for filtering
            },
            headers: {
              'x-api-key': process.env.MARINE_TRAFFIC_API_KEY
            }
          });
          
          // Check if we got valid vessel data
          if (response.data && Array.isArray(response.data)) {
            console.log(`Retrieved ${response.data.length} vessels from MyShipTracking API near location (${lat}, ${lng})`);
            
            // Transform API data to match our schema
            const vessels = response.data.map((apiVessel: any, index: number) => {
              return {
                id: apiVessel.mmsi || 1000000 + index, // Use MMSI or generate ID
                name: apiVessel.name || `Vessel ${index}`,
                imo: apiVessel.imo || `Unknown`,
                mmsi: apiVessel.mmsi || `Unknown`,
                vesselType: apiVessel.type || 'Tanker',
                flag: apiVessel.country || 'Unknown',
                built: apiVessel.year || null,
                dwt: apiVessel.deadweight || null,
                currentLat: apiVessel.lat,
                currentLng: apiVessel.lng,
                currentHeading: apiVessel.heading || 0,
                currentSpeed: apiVessel.speed || 0,
                currentStatus: apiVessel.status || 'UNDERWAY',
                currentRegion: 'Unknown', // Would need to determine based on coordinates
                departurePort: apiVessel.departure || null,
                destinationPort: apiVessel.destination || null,
                owner: apiVessel.owner || null,
                operator: apiVessel.operator || null,
                eta: apiVessel.eta ? new Date(apiVessel.eta) : null,
                cargoType: 'Unknown',
                cargoAmount: 0,
                lastUpdated: new Date(),
                // Add the distance from port
                distanceFromPort: Math.round(calculateDistance(lat, lng, apiVessel.lat, apiVessel.lng))
              };
            });
            
            return vessels;
          }
        } catch (apiError) {
          console.error('Error fetching vessels from Marine Traffic API:', apiError);
          // Continue to fallback with database
        }
      }
      
      // Fallback to database if API fetch failed or is not configured
      console.log(`Falling back to database to find vessels near location (${lat}, ${lng})`);
      
      // Get all vessels from the database
      const allVessels = await storage.getVessels();
      
      // Filter vessels that are within the specified radius
      const nearbyVessels = allVessels.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        // Parse coordinates
        const vesselLat = typeof vessel.currentLat === 'number' 
          ? vessel.currentLat 
          : parseFloat(String(vessel.currentLat));
          
        const vesselLng = typeof vessel.currentLng === 'number' 
          ? vessel.currentLng 
          : parseFloat(String(vessel.currentLng));
          
        // Skip if coordinates are invalid
        if (isNaN(vesselLat) || isNaN(vesselLng)) return false;
        
        // Calculate distance
        const distance = calculateDistance(lat, lng, vesselLat, vesselLng);
        
        // Add distance to vessel object
        (vessel as any).distanceFromPort = Math.round(distance);
        
        // Return true if within radius
        return distance <= radiusKm;
      });
      
      // Sort by distance
      nearbyVessels.sort((a, b) => (a as any).distanceFromPort - (b as any).distanceFromPort);
      
      console.log(`Found ${nearbyVessels.length} vessels near location (${lat}, ${lng}) in the database`);
      return nearbyVessels;
    } catch (error) {
      console.error('Error in getVesselsNearLocation:', error);
      return [];
    }
  }
};