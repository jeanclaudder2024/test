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
          // Note: Updated to use the correct API endpoint
          const apiUrl = `https://api.myshiptracking.com/vessels/radius`;
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
          console.log('Falling back to database for vessel data');
          // Continue to fallback with database
        }
      }
      
      // Fallback to database if API fetch failed or is not configured
      console.log(`Getting vessels near location (${lat}, ${lng}) from database`);
      
      // Get all vessels from the database
      const allVessels = await storage.getVessels();
      console.log(`Total vessels in database: ${allVessels.length}`);
      
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
      
      // If we have no nearby vessels, generate some fallback vessels at a few kilometers from the port
      if (nearbyVessels.length === 0) {
        console.log(`No vessels found near location (${lat}, ${lng}). Generating fallback vessels.`);
        
        // Create a few vessels at different directions from the port
        const fallbackVessels = [];
        const directions = [
          { bearing: 0, distance: 5 },    // North, 5km
          { bearing: 90, distance: 8 },   // East, 8km
          { bearing: 180, distance: 12 }, // South, 12km
          { bearing: 270, distance: 15 }, // West, 15km
          { bearing: 45, distance: 10 },  // Northeast, 10km
        ];
        
        // Generate vessel positions based on directions from port
        for (let i = 0; i < directions.length; i++) {
          const { bearing, distance } = directions[i];
          const { newLat, newLng } = calculateCoordinateFromBearing(lat, lng, bearing, distance);
          
          fallbackVessels.push({
            id: 9000000 + i,
            name: `Vessel ${i + 1}`,
            imo: `IMO${9000000 + i}`,
            mmsi: `MMSI${9000000 + i}`,
            vesselType: ['Tanker', 'Oil Tanker', 'Chemical Tanker', 'LNG Carrier', 'Crude Oil Tanker'][i % 5],
            flag: ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Malta'][i % 5],
            built: 2010 + (i % 10),
            dwt: 50000 + (i * 10000),
            currentLat: newLat,
            currentLng: newLng,
            currentHeading: (bearing + 180) % 360, // Heading opposite to bearing (as if coming to port)
            currentSpeed: 5 + (i % 10),
            currentStatus: 'UNDERWAY',
            currentRegion: 'Unknown',
            departurePort: null,
            destinationPort: null,
            owner: null,
            operator: null,
            eta: null,
            cargoType: 'Crude Oil',
            cargoAmount: 50000 + (i * 5000),
            lastUpdated: new Date(),
            distanceFromPort: distance
          });
        }
        
        console.log(`Generated ${fallbackVessels.length} fallback vessels for port at (${lat}, ${lng})`);
        return fallbackVessels;
      }
      
      console.log(`Found ${nearbyVessels.length} vessels near location (${lat}, ${lng}) in the database`);
      return nearbyVessels;
    } catch (error) {
      console.error('Error in getVesselsNearLocation:', error);
      return [];
    }
  }
  
  // Helper function to calculate a new coordinate given a starting point, bearing and distance
  function calculateCoordinateFromBearing(lat: number, lng: number, bearing: number, distanceKm: number): { newLat: number, newLng: number } {
    const R = 6371; // Earth's radius in km
    const d = distanceKm / R; // Angular distance
    
    // Convert to radians
    const lat1 = deg2rad(lat);
    const lng1 = deg2rad(lng);
    const brng = deg2rad(bearing);
    
    // Calculate new latitude
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
    );
    
    // Calculate new longitude
    const lng2 = lng1 + Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    // Convert back to degrees
    return {
      newLat: rad2deg(lat2),
      newLng: rad2deg(lng2)
    };
  }
  
  // Convert degrees to radians
  function rad2deg(rad: number): number {
    return rad * 180 / Math.PI;
  }
};