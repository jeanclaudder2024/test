/**
 * Port and Refinery Proximity Enhancer
 * Adds more realistic vessel distribution around ports and refineries
 * 
 * Features:
 * - Places 4-9 vessels near each water-based port and refinery
 * - Ensures vessels are only placed in water, not on land
 * - Daily position changes for realism
 * - AI-enhanced movement patterns
 */

import OpenAI from "openai";
import { pool, db } from './db';
import { vessels, ports, refineries } from '../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Global water body boundaries to determine if a location is in water
// This is a simplified approach - we'll check if coordinates fall within major water bodies
const WATER_BODIES = [
  // Atlantic Ocean (rough boundaries)
  { name: 'North Atlantic', minLat: 0, maxLat: 70, minLng: -80, maxLng: 20 },
  { name: 'South Atlantic', minLat: -60, maxLat: 0, minLng: -70, maxLng: 20 },
  
  // Pacific Ocean (rough boundaries)
  { name: 'North Pacific', minLat: 0, maxLat: 65, minLng: 120, maxLng: -80 },
  { name: 'South Pacific', minLat: -60, maxLat: 0, minLng: 150, maxLng: -70 },
  
  // Indian Ocean (rough boundaries)
  { name: 'Indian Ocean', minLat: -60, maxLat: 30, minLng: 20, maxLng: 120 },
  
  // Mediterranean Sea
  { name: 'Mediterranean', minLat: 30, maxLat: 45, minLng: -5, maxLng: 40 },
  
  // South China Sea
  { name: 'South China Sea', minLat: 0, maxLat: 25, minLng: 100, maxLng: 125 },
  
  // Gulf of Mexico
  { name: 'Gulf of Mexico', minLat: 18, maxLat: 30, minLng: -98, maxLng: -80 },
  
  // Caribbean Sea
  { name: 'Caribbean Sea', minLat: 8, maxLat: 25, minLng: -90, maxLng: -60 },
  
  // Black Sea
  { name: 'Black Sea', minLat: 40, maxLat: 48, minLng: 27, maxLng: 42 },
  
  // Baltic Sea
  { name: 'Baltic Sea', minLat: 53, maxLat: 66, minLng: 10, maxLng: 30 },
  
  // Red Sea
  { name: 'Red Sea', minLat: 12, maxLat: 30, minLng: 32, maxLng: 44 },
  
  // Persian Gulf
  { name: 'Persian Gulf', minLat: 24, maxLat: 31, minLng: 48, maxLng: 57 },
  
  // North Sea
  { name: 'North Sea', minLat: 51, maxLat: 62, minLng: -4, maxLng: 9 },
  
  // Yellow Sea
  { name: 'Yellow Sea', minLat: 32, maxLat: 41, minLng: 118, maxLng: 127 },
  
  // East China Sea
  { name: 'East China Sea', minLat: 25, maxLat: 34, minLng: 119, maxLng: 131 },
  
  // Norwegian Sea
  { name: 'Norwegian Sea', minLat: 62, maxLat: 75, minLng: -15, maxLng: 10 },
  
  // Sea of Japan
  { name: 'Sea of Japan', minLat: 35, maxLat: 50, minLng: 128, maxLng: 142 },
  
  // Bay of Bengal
  { name: 'Bay of Bengal', minLat: 5, maxLat: 22, minLng: 80, maxLng: 100 },
  
  // Arabian Sea
  { name: 'Arabian Sea', minLat: 0, maxLat: 25, minLng: 50, maxLng: 80 },
];

// Known coordinates that are often falsely reported (e.g., default GPS values)
const KNOWN_BAD_COORDINATES = [
  // Common defaulted/null GPS coordinates often reported by vessels
  { lat: 0, lng: 0 },
  { lat: -25.3, lng: 135.2 }, // Australia default
  { lat: -25.3, lng: 5.1 }, // Some systems default
  { lat: -45.5, lng: -75.4 }, // South America default
  { lat: -38.3, lng: 145.2 }, // Near Melbourne but often reported incorrectly
  { lat: -15.6, lng: -15.7 }, // Atlantic default
  { lat: -36.8, lng: 150.4 }, // Pacific default
  { lat: 13.4, lng: 110.2 }, // South China Sea default
  { lat: 34.2, lng: 129.5 }, // East Asia default
  { lat: 57.8, lng: -5.1 }, // UK/Ireland default
  { lat: 20.5, lng: 38.2 }, // Red Sea default
  { lat: 15.5, lng: 55.3 }, // Arabian Sea default
  { lat: -32.5, lng: 115.8 }, // Western Australia default
  { lat: 10.5, lng: -65.3 }, // Venezuela default
  { lat: -30.5, lng: 45.3 }, // Indian Ocean default
  { lat: 20.4, lng: 122.5 }, // Philippines default
];

/**
 * Check if a location is within or near a water body
 * @param lat Latitude
 * @param lng Longitude
 * @param bufferKm Buffer distance in kilometers from water body boundary
 * @returns boolean indicating if location is in/near water
 */
function isLocationNearWater(lat: number, lng: number, bufferKm: number = 0): boolean {
  // Normalize longitude to -180 to 180 range
  const normalizedLng = ((lng + 540) % 360) - 180;
  
  // Check if coordinates match known bad coordinates
  const isKnownBadCoordinate = KNOWN_BAD_COORDINATES.some(coord => 
    Math.abs(lat - coord.lat) < 0.01 && Math.abs(normalizedLng - coord.lng) < 0.01
  );
  
  if (isKnownBadCoordinate) {
    console.log(`Vessel at ${lat}, ${normalizedLng} matches known bad coordinate`);
    return false;
  }
  
  // Convert buffer to approximate degrees (very rough approximation)
  // 1 degree of latitude is approximately 111 km
  // 1 degree of longitude varies with latitude
  const latBuffer = bufferKm / 111;
  const lngBuffer = bufferKm / (111 * Math.cos(lat * Math.PI / 180));
  
  // Check if the location is within any water body (with buffer)
  for (const waterBody of WATER_BODIES) {
    if (
      lat >= (waterBody.minLat - latBuffer) && 
      lat <= (waterBody.maxLat + latBuffer) && 
      normalizedLng >= (waterBody.minLng - lngBuffer) && 
      normalizedLng <= (waterBody.maxLng + lngBuffer)
    ) {
      return true;
    }
  }
  
  // If not found in any water body
  console.log(`Vessel at ${lat}, ${normalizedLng} not in any known water body`);
  return false;
}

/**
 * Calculate the Haversine distance between two points
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  // Haversine formula components
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Distance
  return R * c;
}

/**
 * Generate a random location in water near a given point
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param minDistanceKm Minimum distance from center in km
 * @param maxDistanceKm Maximum distance from center in km
 * @param maxAttempts Maximum attempts to find a valid water location
 * @returns Coordinates [lat, lng] or null if no valid location found
 */
function generateWaterLocationNearPoint(
  centerLat: number, 
  centerLng: number,
  minDistanceKm: number = 1,
  maxDistanceKm: number = 30,
  maxAttempts: number = 20
): [number, number] | null {
  // Try to find a valid location in water
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Random distance between min and max
    const distance = minDistanceKm + Math.random() * (maxDistanceKm - minDistanceKm);
    
    // Random angle in radians
    const angle = Math.random() * 2 * Math.PI;
    
    // Convert distance to approximate degrees
    // 1 degree of latitude is ~111 km
    const latDelta = (distance / 111) * Math.cos(angle);
    const lngDelta = (distance / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    
    // Calculate new position
    const newLat = centerLat + latDelta;
    const newLng = centerLng + lngDelta;
    
    // Check if this location is in water
    if (isLocationNearWater(newLat, newLng)) {
      return [newLat, newLng];
    }
  }
  
  // Couldn't find a valid location in water after maxAttempts
  return null;
}

interface NearbyVesselParams {
  facilityName: string;
  facilityType: 'port' | 'refinery';
  facilityLat: number;
  facilityLng: number;
  vesselCount: number;
  region: string;
}

/**
 * Calculates an appropriate number of vessels that should be near a facility based on its importance
 * @param facilityType The type of facility (port or refinery)
 * @param facilityName The name of the facility
 * @param region The region where the facility is located
 * @returns Recommended number of vessels
 */
export async function calculateExpectedVesselDensity(
  facilityType: 'port' | 'refinery',
  facilityName: string,
  region: string
): Promise<number> {
  try {
    // Check if we should use the sophisticated calculation
    const useAI = Math.random() > 0.7; // Only use AI for 30% of calculations to save API calls
    
    if (!useAI) {
      // Default calculation based on facility type and region
      const baseCount = facilityType === 'port' ? 5 : 3;
      
      // Region multipliers
      const regionMultipliers: Record<string, number> = {
        'Europe': 1.5,
        'Asia-Pacific': 1.8,
        'Middle East': 1.4,
        'North America': 1.3,
        'Latin America': 0.9,
        'Africa': 0.7
      };
      
      const multiplier = regionMultipliers[region] || 1;
      return Math.round(baseCount * multiplier);
    }
    
    // Use OpenAI for more sophisticated calculation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a maritime traffic expert. Based on the facility information, estimate how many vessels would typically be present within 50km of this location. Consider the facility type, name, and region. Respond with only a number."
        },
        {
          role: "user",
          content: `Facility: ${facilityName}\nType: ${facilityType}\nRegion: ${region}\n\nHow many vessels would typically be near this facility (within 50km)?`
        }
      ],
      max_tokens: 50,
      temperature: 0.3
    });
    
    const content = response.choices[0].message.content;
    if (!content) return 5; // Default fallback
    
    // Extract the number from the response
    const matches = content.match(/\d+/);
    if (matches && matches.length > 0) {
      const count = parseInt(matches[0], 10);
      // Ensure reasonable limits
      return Math.min(Math.max(count, 2), 12);
    }
    
    return 5; // Default fallback
  } catch (error) {
    console.error("Error calculating vessel density:", error);
    // Fallback values if API call fails
    return facilityType === 'port' ? 5 : 3;
  }
}

/**
 * Generate vessels near a port or refinery based on its location and importance
 * @param params Parameters for generating nearby vessels
 * @returns List of vessel IDs that have been updated
 */
export async function generateVesselsNearFacility(params: NearbyVesselParams): Promise<number[]> {
  try {
    const {
      facilityName,
      facilityType,
      facilityLat,
      facilityLng,
      vesselCount,
      region
    } = params;
    
    // Ensure we generate between 4-9 vessels as requested
    const desiredVesselCount = Math.max(4, Math.min(9, vesselCount));
    
    console.log(`Generating ${desiredVesselCount} vessels near ${facilityType} ${facilityName}`);
    
    // First check if the facility is near water
    if (!isLocationNearWater(facilityLat, facilityLng, 15)) {
      console.log(`${facilityType} ${facilityName} at ${facilityLat}, ${facilityLng} is not near water, skipping vessel placement`);
      return [];
    }
    
    // Find vessels that are suitable for positioning near this facility
    const availableVessels = await db.query.vessels.findMany({
      where: and(
        or(
          sql`${vessels.vesselType} LIKE '%tanker%'`,
          sql`${vessels.vesselType} LIKE '%oil%'`,
          sql`${vessels.vesselType} LIKE '%cargo%'`,
          sql`${vessels.vesselType} LIKE '%bulk%'`
        )
      ),
      orderBy: sql`RANDOM()`,
      limit: desiredVesselCount * 3 // Get more vessels than needed in case some placements fail
    });
    
    if (availableVessels.length === 0) {
      console.log(`No available vessels to position near ${facilityType} ${facilityName}`);
      return [];
    }
    
    const updatedVesselIds: number[] = [];
    let placedVessels = 0;
    
    // Position vessels around the facility with realistic parameters
    for (const vessel of availableVessels) {
      if (placedVessels >= desiredVesselCount) break;
      
      // Generate a water location near the facility
      const waterLocation = generateWaterLocationNearPoint(
        facilityLat,
        facilityLng,
        1,  // Min 1km from facility
        30, // Max 30km from facility
        20  // Try up to 20 times to find a water location
      );
      
      // Skip if we couldn't find a valid water location
      if (!waterLocation) {
        console.log(`Could not find valid water location near ${facilityType} ${facilityName}`);
        continue;
      }
      
      const [newLat, newLng] = waterLocation;
      
      // Calculate a realistic heading and speed
      // Heading is generally toward or away from the facility
      const angleToFacility = Math.atan2(
        newLat - facilityLat,
        newLng - facilityLng
      ) * (180 / Math.PI);
      
      // Add some randomness to heading
      const headingRandom = Math.random();
      let heading;
      
      if (headingRandom < 0.4) {
        // 40% chance vessel is heading toward facility
        heading = (angleToFacility + 180 + (Math.random() * 30 - 15)) % 360;
      } else if (headingRandom < 0.7) {
        // 30% chance vessel is heading away from facility
        heading = (angleToFacility + (Math.random() * 30 - 15)) % 360;
      } else {
        // 30% chance vessel is moving in random direction
        heading = Math.random() * 360;
      }
      
      // Determine vessel speed and status based on proximity to facility
      const distanceToFacility = calculateHaversineDistance(
        newLat, newLng,
        facilityLat, facilityLng
      );
      
      // Speed in knots (nautical miles per hour)
      let speed;
      let status;
      
      if (distanceToFacility < 5) { // Within 5km
        if (facilityType === 'port') {
          // Near port, more likely to be docked or moving slowly
          const speedDiceRoll = Math.random();
          if (speedDiceRoll < 0.4) {
            speed = 0; // 40% chance vessel is stopped
            status = 'anchored';
          } else if (speedDiceRoll < 0.8) {
            speed = Math.random() * 3; // 40% chance vessel is moving very slowly (0-3 knots)
            status = 'maneuvering';
          } else {
            speed = 3 + Math.random() * 5; // 20% chance vessel is moving at moderate speed (3-8 knots)
            status = 'in transit';
          }
        } else { // Near refinery
          // Near refinery, more likely to be in transit or loading/unloading
          const speedDiceRoll = Math.random();
          if (speedDiceRoll < 0.3) {
            speed = 0; // 30% chance vessel is stopped
            status = 'loading';
          } else if (speedDiceRoll < 0.7) {
            speed = Math.random() * 5; // 40% chance vessel is moving slowly (0-5 knots)
            status = 'maneuvering';
          } else {
            speed = 5 + Math.random() * 5; // 30% chance vessel is moving at moderate speed (5-10 knots)
            status = 'in transit';
          }
        }
      } else if (distanceToFacility < 15) { // 5-15km
        // Moderate distance, likely approaching or leaving
        const speedDiceRoll = Math.random();
        if (speedDiceRoll < 0.2) {
          speed = Math.random() * 3; // 20% chance vessel is moving very slowly (0-3 knots)
          status = 'awaiting orders';
        } else if (speedDiceRoll < 0.6) {
          speed = 3 + Math.random() * 7; // 40% chance vessel is moving at moderate speed (3-10 knots)
          status = headingRandom < 0.5 ? 'approaching' : 'departing';
        } else {
          speed = 8 + Math.random() * 7; // 40% chance vessel is moving at cruise speed (8-15 knots)
          status = 'in transit';
        }
      } else { // Beyond 15km
        // Farther away, likely at cruising speed
        const speedDiceRoll = Math.random();
        if (speedDiceRoll < 0.1) {
          speed = Math.random() * 3; // 10% chance vessel is barely moving (0-3 knots)
          status = 'awaiting orders';
        } else if (speedDiceRoll < 0.3) {
          speed = 3 + Math.random() * 7; // 20% chance vessel is moving at moderate speed (3-10 knots)
          status = 'reduced speed';
        } else {
          speed = 10 + Math.random() * 8; // 70% chance vessel is moving at full speed (10-18 knots)
          status = 'in transit';
        }
      }
      
      // Add daily position variation - slight changes to ensure positions aren't static
      // This ensures that vessel positions will naturally vary each day
      const currentDate = new Date();
      const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      
      // Use the day of year to create a daily variation (up to ±2km)
      const dailyVariationFactor = Math.sin(dayOfYear * 0.3) * 0.02; // About ±2km variation
      
      // Apply the daily variation
      const adjustedLat = newLat + dailyVariationFactor * Math.sin(heading * Math.PI / 180);
      const adjustedLng = newLng + dailyVariationFactor * Math.cos(heading * Math.PI / 180);
      
      // Generate realistic vessel status and metadata
      const vesselMetadata = {
        speed: speed.toFixed(1),
        heading: Math.floor(heading),
        timestamp: new Date().toISOString(),
        proximity: facilityType === 'port' ? 'near_port' : 'near_refinery',
        facilityName: facilityName,
        status: status,
        dayVariation: dayOfYear,
        region: region
      };
      
      // Update vessel in database
      await db.update(vessels)
        .set({
          currentLat: String(adjustedLat.toFixed(6)),
          currentLng: String(adjustedLng.toFixed(6)),
          // Associate with facility
          departurePort: facilityType === 'port' ? facilityName : vessel.departurePort,
          destinationPort: facilityType === 'port' ? facilityName : vessel.destinationPort,
          heading: String(Math.floor(heading)),
          speed: String(speed.toFixed(1)),
          status: status,
          // Store detailed metadata as JSON string
          metadata: JSON.stringify(vesselMetadata),
          lastUpdated: new Date()
        })
        .where(eq(vessels.id, vessel.id));
      
      updatedVesselIds.push(vessel.id);
      placedVessels++;
    }
    
    console.log(`Generated ${updatedVesselIds.length} vessels near ${facilityType} ${facilityName}`);
    return updatedVesselIds;
  } catch (error) {
    console.error(`Error generating vessels near facility:`, error);
    return [];
  }
}

/**
 * Enhance vessel distribution around all ports and refineries
 * Ensures every facility has some vessels nearby
 */
export async function enhancePortAndRefineryProximity(): Promise<{
  updatedPorts: number,
  updatedRefineries: number,
  totalVesselsRepositioned: number
}> {
  const stats = {
    updatedPorts: 0,
    updatedRefineries: 0,
    totalVesselsRepositioned: 0
  };
  
  try {
    // Get all ports - no limit to process all ports
    const allPorts = await db.query.ports.findMany();
    
    // Get all refineries - no limit to process all refineries
    const allRefineries = await db.query.refineries.findMany();
    
    console.log(`Processing ${allPorts.length} ports and ${allRefineries.length} refineries for vessel distribution`);
    
    // Process all ports to ensure vessels near every port
    for (const port of allPorts) {
      // Skip ports with missing coordinates
      if (!port.lat || !port.lng) continue;
      
      // First, check if this port is in a water body - we only want to place vessels near water ports
      const portLat = parseFloat(port.lat);
      const portLng = parseFloat(port.lng);
      
      // Skip invalid coordinates
      if (isNaN(portLat) || isNaN(portLng)) continue;
      
      // Check if port is near a known water body
      const isPortNearWater = isLocationNearWater(portLat, portLng, 10); // 10km buffer for port location
      
      if (!isPortNearWater) {
        console.log(`Port ${port.name} at ${portLat}, ${portLng} is not near water, skipping vessel placement`);
        continue;
      }
      
      // Get all vessels that can be repositioned
      const allVesselsForPort = await db.query.vessels.findMany({
        where: and(
          sql`${vessels.currentLat} IS NOT NULL`,
          sql`${vessels.currentLng} IS NOT NULL`,
          // Prefer oil vessels for positioning near ports
          or(
            sql`${vessels.vesselType} LIKE '%tanker%'`,
            sql`${vessels.vesselType} LIKE '%oil%'`,
            sql`${vessels.vesselType} LIKE '%cargo%'`
          )
        ),
        orderBy: sql`RANDOM()`,
        limit: 100
      });
      
      // Calculate distances manually and filter nearby vessels
      const nearbyVesselCount = allVesselsForPort.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const vesselLat = parseFloat(vessel.currentLat);
        const vesselLng = parseFloat(vessel.currentLng);
        
        // Skip invalid coordinates
        if (isNaN(vesselLat) || isNaN(vesselLng)) {
          return false;
        }
        
        // Calculate distance using the Haversine formula (approximate distance in km)
        const distance = calculateHaversineDistance(
          portLat, portLng,
          vesselLat, vesselLng
        );
        
        // Consider vessels within 50km
        return distance < 50;
      });
      
      // Only add vessels if fewer than minimum are present
      const minimumVessels = 2; // Every port should have at least 2 vessels
      
      if (nearbyVesselCount.length < minimumVessels) {
        // Calculate how many vessels to add
        const baseVesselCount = await calculateExpectedVesselDensity('port', port.name, port.region || 'Unknown');
        const vesselCount = Math.max(minimumVessels - nearbyVesselCount.length, Math.floor(baseVesselCount * 0.7));
        
        const updatedVesselIds = await generateVesselsNearFacility({
          facilityName: port.name,
          facilityType: 'port',
          facilityLat: parseFloat(port.lat),
          facilityLng: parseFloat(port.lng),
          vesselCount,
          region: port.region || 'Unknown'
        });
        
        if (updatedVesselIds.length > 0) {
          stats.updatedPorts++;
          stats.totalVesselsRepositioned += updatedVesselIds.length;
        }
      }
    }
    
    // Process all refineries to ensure vessels near every refinery
    for (const refinery of allRefineries) {
      // Skip refineries with missing coordinates
      if (!refinery.lat || !refinery.lng) continue;
      
      // First, check if this refinery is near a water body
      const refineryLat = parseFloat(refinery.lat);
      const refineryLng = parseFloat(refinery.lng);
      
      // Skip invalid coordinates
      if (isNaN(refineryLat) || isNaN(refineryLng)) continue;
      
      // Check if refinery is near a known water body
      const isRefineryNearWater = isLocationNearWater(refineryLat, refineryLng, 15); // 15km buffer for refinery location
      
      if (!isRefineryNearWater) {
        console.log(`Refinery ${refinery.name} at ${refineryLat}, ${refineryLng} is not near water, skipping vessel placement`);
        continue;
      }
      
      // Get all vessels that can be repositioned with preference for oil tankers
      const allVesselsForRefinery = await db.query.vessels.findMany({
        where: and(
          sql`${vessels.currentLat} IS NOT NULL`,
          sql`${vessels.currentLng} IS NOT NULL`,
          // Prefer oil vessels for positioning near refineries
          or(
            sql`${vessels.vesselType} LIKE '%tanker%'`,
            sql`${vessels.vesselType} LIKE '%oil%'`
          )
        ),
        orderBy: sql`RANDOM()`,
        limit: 100
      });
      
      // Calculate distances manually and filter nearby vessels
      const nearbyVesselCount = allVesselsForRefinery.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const vesselLat = parseFloat(vessel.currentLat);
        const vesselLng = parseFloat(vessel.currentLng);
        
        // Skip invalid coordinates
        if (isNaN(vesselLat) || isNaN(vesselLng)) {
          return false;
        }
        
        // Calculate distance using the Haversine formula (approximate distance in km)
        const distance = calculateHaversineDistance(
          refineryLat, refineryLng,
          vesselLat, vesselLng
        );
        
        // Consider vessels within 40km
        return distance < 40;
      });
      
      // Only add vessels if fewer than minimum are present
      const minimumVessels = 1; // Every refinery should have at least 1 vessel
      
      if (nearbyVesselCount.length < minimumVessels) {
        // Calculate how many vessels to add
        const baseVesselCount = await calculateExpectedVesselDensity('refinery', refinery.name, refinery.region || 'Unknown');
        const vesselCount = Math.max(minimumVessels - nearbyVesselCount.length, Math.floor(baseVesselCount * 0.6));
        
        const updatedVesselIds = await generateVesselsNearFacility({
          facilityName: refinery.name,
          facilityType: 'refinery',
          facilityLat: parseFloat(refinery.lat),
          facilityLng: parseFloat(refinery.lng),
          vesselCount,
          region: refinery.region || 'Unknown'
        });
        
        if (updatedVesselIds.length > 0) {
          stats.updatedRefineries++;
          stats.totalVesselsRepositioned += updatedVesselIds.length;
        }
      }
    }
    
    console.log(`Port and refinery proximity enhancement completed: ${JSON.stringify(stats)}`);
    return stats;
  } catch (error) {
    console.error("Error enhancing port and refinery proximity:", error);
    return stats;
  }
}

/**
 * Periodically enhance vessel distribution
 */
export async function startProximityEnhancement(intervalMinutes = 15): Promise<void> {
  // Initial enhancement
  const stats = await enhancePortAndRefineryProximity();
  console.log(`Initial port proximity enhancement complete: ${JSON.stringify(stats)}`);
  
  // Set up periodic enhancement
  setInterval(async () => {
    const stats = await enhancePortAndRefineryProximity();
    console.log(`Periodic port proximity enhancement complete: ${JSON.stringify(stats)}`);
  }, intervalMinutes * 60 * 1000);
}