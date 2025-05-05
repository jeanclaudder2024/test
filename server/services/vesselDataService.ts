import axios from 'axios';
import { storage } from '../storage';
import { Vessel } from '@shared/schema';
import { openaiService } from './openaiService';

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

function rad2deg(rad: number): number {
  return rad * 180 / Math.PI;
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

export const vesselDataService = {
  // Get port info by coordinates
  async getPortInfoByCoordinates(lat: number, lng: number): Promise<any> {
    try {
      // First, check if these coordinates match any port in our database
      const allPorts = await storage.getPorts();
      
      // Find the nearest port to these coordinates
      let closestPort = null;
      let closestDistance = Infinity;
      
      for (const port of allPorts) {
        if (!port.lat || !port.lng) continue;
        
        // Parse port coordinates
        const portLat = typeof port.lat === 'number' ? port.lat : parseFloat(String(port.lat));
        const portLng = typeof port.lng === 'number' ? port.lng : parseFloat(String(port.lng));
        
        if (isNaN(portLat) || isNaN(portLng)) continue;
        
        // Calculate distance
        const distance = calculateDistance(lat, lng, portLat, portLng);
        
        // Update closest port if this one is closer
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPort = port;
        }
      }
      
      // If we found a port within 2km, use it
      if (closestPort && closestDistance <= 2) {
        return closestPort;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting port info by coordinates:', error);
      return null;
    }
  },
  
  // Generate realistic vessels using OpenAI
  async generateRealisticVesselsWithAI(lat: number, lng: number, port: any = null): Promise<any[]> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.log('OPENAI_API_KEY not configured, skipping AI vessel generation');
        return [];
      }
      
      const portName = port?.name || 'unknown port';
      const country = port?.country || 'unknown country';
      const region = port?.region || 'unknown region';
      const portType = port?.type || 'commercial';
      
      console.log(`Requesting OpenAI to generate vessels for ${portName} (${country}, ${region})`);
      
      const prompt = `
        Generate realistic vessel data for ships currently near ${portName} in ${country} (${region}).
        
        Port type: ${portType}
        Port coordinates: (${lat}, ${lng})
        Current date: ${new Date().toISOString().split('T')[0]}
        
        Generate 5-8 vessels that would realistically be found at or approaching this port, with detailed specifications.
        Include vessels at different distances from the port (1-50km).
        For each vessel include:
        - Vessel name (realistic ship name)
        - IMO number (7-digit number)
        - MMSI number (9-digit number)
        - Vessel type (tanker, oil tanker, chemical tanker, container ship, etc.)
        - Flag country (registration country)
        - Year built (between 1990-2023)
        - Deadweight tonnage (DWT)
        - Current coordinates (latitude, longitude - realistic position near the port)
        - Current heading (0-359 degrees)
        - Current speed (0-20 knots)
        - Current status (MOORED, UNDERWAY, ANCHORED, etc.)
        - Cargo type (for tankers: crude oil, diesel, gasoline, LNG, etc.)
        - Cargo amount (metric tons)
        - Distance from port (km)
        
        Return the data as a JSON array of vessel objects.
      `;
      
      const response = await openaiService.generateCompletion(prompt, 'json');
      
      if (!response) {
        console.log('Failed to get response from OpenAI');
        return [];
      }
      
      // Try to parse the JSON response
      try {
        const vessels = JSON.parse(response);
        
        if (!Array.isArray(vessels)) {
          console.log('OpenAI did not return an array of vessels');
          return [];
        }
        
        // Transform the vessels into our schema format
        const formattedVessels = vessels.map((v: any, index: number) => {
          // Generate a unique ID
          const id = 8000000 + index;
          
          // Calculate a valid coordinate if none provided
          let vesselLat = v.latitude || v.currentLat;
          let vesselLng = v.longitude || v.currentLng;
          
          // If no valid coordinates, generate based on distance and random bearing
          if (!vesselLat || !vesselLng) {
            const bearing = Math.random() * 360;
            const distance = v.distanceFromPort || Math.random() * 20 + 2;
            const coords = calculateCoordinateFromBearing(lat, lng, bearing, distance);
            vesselLat = coords.newLat;
            vesselLng = coords.newLng;
          }
          
          return {
            id: id,
            name: v.name || `Vessel ${id}`,
            imo: v.imo || `IMO${7000000 + index}`,
            mmsi: v.mmsi || `MMSI${900000000 + index}`,
            vesselType: v.vesselType || v.type || 'Tanker',
            flag: v.flag || v.flagCountry || 'Panama',
            built: v.yearBuilt || v.built || 2010 + (index % 10),
            dwt: v.deadweightTonnage || v.dwt || 50000 + (index * 10000),
            currentLat: vesselLat,
            currentLng: vesselLng,
            currentHeading: v.heading || v.currentHeading || Math.floor(Math.random() * 360),
            currentSpeed: v.speed || v.currentSpeed || Math.floor(Math.random() * 15),
            currentStatus: v.status || v.currentStatus || 'UNDERWAY',
            currentRegion: region || 'Unknown',
            departurePort: v.departurePort || null,
            destinationPort: v.destinationPort || portName,
            owner: v.owner || null,
            operator: v.operator || null,
            eta: v.eta ? new Date(v.eta) : new Date(Date.now() + 86400000 * (1 + Math.random() * 5)),
            cargoType: v.cargoType || 'Crude Oil',
            cargoAmount: v.cargoAmount || v.cargoVolume || 50000 + (index * 5000),
            lastUpdated: new Date(),
            distanceFromPort: v.distanceFromPort || Math.floor(Math.random() * 40) + 1
          };
        });
        
        return formattedVessels;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('OpenAI response:', response);
        return [];
      }
    } catch (error) {
      console.error('Error generating vessels with AI:', error);
      return [];
    }
  },
  
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
            
            return vessels as Vessel[];
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
      
      // If we have no nearby vessels, try to generate AI-powered realistic vessels for this port
      if (nearbyVessels.length === 0) {
        console.log(`No vessels found near location (${lat}, ${lng}). Generating AI-powered vessels.`);
        
        try {
          // Try to get port details to generate more realistic vessels
          const port = await this.getPortInfoByCoordinates(lat, lng);
          console.log(`Generating realistic vessels for port: ${port?.name || 'Unknown'}`);
          
          // Use OpenAI to generate realistic vessels for this specific port
          const aiVessels = await this.generateRealisticVesselsWithAI(lat, lng, port);
          
          if (aiVessels && aiVessels.length > 0) {
            console.log(`Successfully generated ${aiVessels.length} AI-powered vessels for port ${port?.name || 'Unknown'}`);
            return aiVessels as Vessel[];
          }
        } catch (error) {
          console.error('Error generating AI vessels:', error);
          // Fall back to our basic vessel generation
        }
        
        // Fallback: Create vessels at different directions from the port
        console.log('Falling back to basic vessel generation');
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
        return fallbackVessels as Vessel[];
      }
      
      console.log(`Found ${nearbyVessels.length} vessels near location (${lat}, ${lng}) in the database`);
      return nearbyVessels;
    } catch (error) {
      console.error('Error in getVesselsNearLocation:', error);
      return [];
    }
  }
};