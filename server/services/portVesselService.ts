import { Port, Vessel } from "@shared/schema";
import { storage } from "../storage";
import { marineTrafficService } from "./marineTrafficService";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate the distance between two points in kilometers using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Find vessels near a port using coordinates and a specified radius
 */
export async function findVesselsNearPort(
  port: Port,
  radiusKm: number = 20
): Promise<{ vessels: Vessel[]; distance: number }[]> {
  try {
    // Convert port coordinates to numbers
    const portLat = Number(port.lat);
    const portLng = Number(port.lng);
    
    if (isNaN(portLat) || isNaN(portLng)) {
      throw new Error(`Invalid port coordinates for ${port.name}`);
    }

    // First try to get vessels from MyShipTracking API for real-time data
    let vessels: Vessel[] = [];
    const useAPIData = marineTrafficService.isConfigured();
    
    if (useAPIData) {
      try {
        console.log(`Finding vessels near port ${port.name} using MyShipTracking API...`);
        vessels = await marineTrafficService.fetchVesselsNearPort(port.id, radiusKm);
        console.log(`Found ${vessels.length} vessels near port ${port.name} from MyShipTracking API`);
      } catch (error) {
        console.error(`Error fetching vessels from API near port ${port.name}:`, error);
      }
    }

    // If API failed or returned fewer than expected vessels, fall back to database
    if (vessels.length < 4) {
      console.log(`Fetching vessels from database as fallback for port ${port.name}...`);
      const allVessels = await storage.getVessels();
      
      // Filter vessels by distance to port
      const vesselsWithDistance = allVessels
        .filter(vessel => {
          if (!vessel.currentLat || !vessel.currentLng) return false;
          
          const vesselLat = typeof vessel.currentLat === 'string' 
            ? Number(vessel.currentLat) 
            : vessel.currentLat;
          
          const vesselLng = typeof vessel.currentLng === 'string' 
            ? Number(vessel.currentLng) 
            : vessel.currentLng;
            
          if (isNaN(vesselLat) || isNaN(vesselLng)) return false;
          
          const distance = calculateDistance(
            portLat, 
            portLng, 
            vesselLat, 
            vesselLng
          );
          
          return distance <= radiusKm;
        })
        .map(vessel => {
          const vesselLat = typeof vessel.currentLat === 'string' 
            ? Number(vessel.currentLat) 
            : vessel.currentLat;
          
          const vesselLng = typeof vessel.currentLng === 'string' 
            ? Number(vessel.currentLng) 
            : vessel.currentLng;
          
          const distance = calculateDistance(
            portLat, 
            portLng, 
            vesselLat, 
            vesselLng
          );
          
          return { vessel, distance };
        })
        .sort((a, b) => a.distance - b.distance);
        
      // Add these vessels if we don't have enough from API
      if (vesselsWithDistance.length > 0) {
        // Merge with any API vessels we might have, avoiding duplicates
        const existingVesselIds = new Set(vessels.map(v => v.id));
        vesselsWithDistance.forEach(({ vessel, distance }) => {
          if (!existingVesselIds.has(vessel.id)) {
            vessels.push(vessel);
            existingVesselIds.add(vessel.id);
          }
        });
      }
    }

    // If we still don't have enough vessels (at least 4), use OpenAI to intelligently generate realistic vessels
    if (vessels.length < 4 && process.env.OPENAI_API_KEY) {
      try {
        console.log(`Generating realistic vessels for port ${port.name} using OpenAI...`);
        const additionalVessels = await generateRealisticVesselsNearPort(port, 9 - vessels.length);
        vessels = [...vessels, ...additionalVessels];
        console.log(`Generated ${additionalVessels.length} vessels for port ${port.name}`);
      } catch (error) {
        console.error(`Error generating vessels using OpenAI:`, error);
      }
    }

    // Calculate distance for all vessels and limit to 9 vessels maximum
    return vessels
      .filter(vessel => vessel.currentLat && vessel.currentLng)
      .map(vessel => {
        const vesselLat = typeof vessel.currentLat === 'string' 
          ? Number(vessel.currentLat) 
          : vessel.currentLat;
        
        const vesselLng = typeof vessel.currentLng === 'string' 
          ? Number(vessel.currentLng) 
          : vessel.currentLng;
        
        const distance = calculateDistance(
          portLat, 
          portLng, 
          vesselLat, 
          vesselLng
        );
        
        return { vessels: vessel, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 9); // Return at most 9 vessels
  } catch (error) {
    console.error(`Error finding vessels near port ${port.name}:`, error);
    return [];
  }
}

/**
 * Use OpenAI to generate realistic vessel data near a specific port
 */
async function generateRealisticVesselsNearPort(port: Port, count: number): Promise<Vessel[]> {
  // Skip if OpenAI API key is not configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured for vessel generation");
    return [];
  }
  
  try {
    // Construct a prompt that will generate realistic vessel data based on the port type and location
    const prompt = `
      Generate ${count} realistic vessels that would likely be near the port of ${port.name} in ${port.country}, which is a ${port.type || 'commercial'} port.
      
      Port coordinates: Latitude ${port.lat}, Longitude ${port.lng}
      Port region: ${port.region}
      
      For each vessel, provide the following data in JSON format:
      - name: Realistic vessel name based on the typical naming conventions for vessels from major shipping companies
      - vesselType: Type of vessel (e.g., "Oil Tanker", "Container Ship", "Bulk Carrier", etc.) appropriate for this port
      - imoNumber: A valid 7-digit IMO number
      - flag: Country flag registration appropriate for this type of vessel and trade route
      - currentLat: Latitude coordinate within 20km of the port (${port.lat})
      - currentLng: Longitude coordinate within 20km of the port (${port.lng})
      - speed: Current speed in knots (typically 0-3 knots when near port, or 0 if docked)
      - status: "Anchored", "Underway", or "Moored"
      - cargo: Cargo type appropriate for this vessel and port (oil products for oil ports, containers for commercial ports, etc.)
      - cargoCapacity: Realistic cargo capacity in tons for this vessel type
      
      Return as a JSON array of vessel objects, ensuring coordinates are within 20km of the port and vessel details are appropriate for this specific port type and region.
    `;

    // Use OpenAI to generate the vessel data
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a maritime data expert who provides realistic vessel information based on port characteristics. Your response should be properly formatted JSON only, with no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const generatedData = JSON.parse(response.choices[0].message.content);
    
    if (!generatedData.vessels || !Array.isArray(generatedData.vessels)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Transform the generated data into Vessel objects compatible with our schema
    return generatedData.vessels.map((vesselData: any, index: number) => {
      // Generate a unique ID by using a negative number (to avoid conflicts with DB IDs)
      const id = -(port.id * 1000 + index);
      
      return {
        id,
        name: vesselData.name,
        vesselType: vesselData.vesselType,
        imoNumber: vesselData.imoNumber?.toString() || Math.floor(1000000 + Math.random() * 9000000).toString(),
        flag: vesselData.flag,
        mmsi: Math.floor(100000000 + Math.random() * 900000000).toString(),
        callSign: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
        currentLat: vesselData.currentLat,
        currentLng: vesselData.currentLng,
        speed: vesselData.speed || Math.floor(Math.random() * 3),
        status: vesselData.status || "Anchored",
        destination: port.name,
        eta: null, // Already at port or very close
        cargo: vesselData.cargo || (port.type === 'oil' ? 'Crude Oil' : 'General Cargo'),
        cargoCapacity: vesselData.cargoCapacity || 50000 + Math.floor(Math.random() * 50000),
        draught: 10 + Math.floor(Math.random() * 10),
        length: 100 + Math.floor(Math.random() * 200),
        width: 15 + Math.floor(Math.random() * 30),
        yearBuilt: 1990 + Math.floor(Math.random() * 35),
        departurePort: null,
        departureTime: null,
        destinationPort: null,
        course: Math.floor(Math.random() * 360),
        lastUpdated: new Date(),
        owner: `${['Global', 'Trans-Ocean', 'Pacific', 'Atlantic', 'Maritime'][Math.floor(Math.random() * 5)]} ${['Shipping', 'Carriers', 'Marine', 'Lines', 'Transport'][Math.floor(Math.random() * 5)]}`,
        aisSource: "synthetic"
      };
    });
  } catch (error) {
    console.error("Error generating vessels with OpenAI:", error);
    return [];
  }
}

// Export the port vessel service
export const portVesselService = {
  findVesselsNearPort,
  calculateDistance,
};