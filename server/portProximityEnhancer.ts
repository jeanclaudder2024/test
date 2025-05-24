/**
 * Port and Refinery Proximity Enhancer
 * Adds more realistic vessel distribution around ports and refineries
 */

import OpenAI from "openai";
import { pool, db } from './db';
import { vessels, ports, refineries } from '../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    
    // Find vessels that are distant from other facilities and can be repositioned
    const availableVessels = await db.query.vessels.findMany({
      where: and(
        or(
          eq(vessels.vesselType, "Oil Tanker"),
          eq(vessels.vesselType, "Crude Oil Tanker"),
          eq(vessels.vesselType, "Product Tanker"),
          eq(vessels.vesselType, "Cargo Ship"),
          eq(vessels.vesselType, "Container Ship")
        )
      ),
      limit: 50
    });
    
    if (availableVessels.length === 0) {
      console.log(`No available vessels to position near ${facilityType} ${facilityName}`);
      return [];
    }
    
    // Shuffle vessels to get a random selection
    const shuffled = availableVessels.sort(() => 0.5 - Math.random());
    const selectedVessels = shuffled.slice(0, vesselCount);
    
    const updatedVesselIds: number[] = [];
    
    // Position vessels around the facility with some randomness
    for (const vessel of selectedVessels) {
      // Generate a random angle and distance
      const angle = Math.random() * 2 * Math.PI;
      const distance = (0.1 + Math.random() * 0.4); // 0.1-0.5 degrees (roughly 10-50km)
      
      // Calculate new position
      const newLat = facilityLat + Math.sin(angle) * distance;
      const newLng = facilityLng + Math.cos(angle) * distance;
      
      // Skip obviously invalid positions
      if (newLat < -85 || newLat > 85 || newLng < -180 || newLng > 180) {
        continue;
      }
      
      // Update vessel
      await db.update(vessels)
        .set({
          currentLat: String(newLat.toFixed(6)),
          currentLng: String(newLng.toFixed(6)),
          // Associate with facility
          departurePort: facilityType === 'port' ? facilityName : vessel.departurePort,
          destinationPort: facilityType === 'port' ? facilityName : vessel.destinationPort,
          // Store metadata as JSON string
          metadata: JSON.stringify({
            speed: Math.round(distance < 0.2 ? (2 + Math.random() * 5) : (7 + Math.random() * 10)),
            heading: Math.round(angle * (180 / Math.PI)),
            timestamp: new Date().toISOString(),
            proximity: facilityType === 'port' ? 'near_port' : 'near_refinery',
            facilityName: facilityName,
            status: distance < 0.15 ? 'docked' : 'approaching'
          })
        })
        .where(eq(vessels.id, vessel.id));
      
      updatedVesselIds.push(vessel.id);
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
      
      // Check if this port already has vessels nearby using standard distance calculation
      const portLat = parseFloat(port.lat);
      const portLng = parseFloat(port.lng);
      
      // Get all vessels
      const allVesselsForPort = await db.query.vessels.findMany({
        where: and(
          sql`${vessels.currentLat} IS NOT NULL`,
          sql`${vessels.currentLng} IS NOT NULL`
        ),
        limit: 50
      });
      
      // Calculate distances manually and filter nearby vessels
      const nearbyVesselCount = allVesselsForPort.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const vesselLat = parseFloat(vessel.currentLat);
        const vesselLng = parseFloat(vessel.currentLng);
        
        // Skip invalid coordinates
        if (isNaN(vesselLat) || isNaN(vesselLng) || isNaN(portLat) || isNaN(portLng)) {
          return false;
        }
        
        // Calculate distance using the Haversine formula (approximate distance in km)
        const R = 6371; // Radius of the Earth in km
        const dLat = (vesselLat - portLat) * Math.PI / 180;
        const dLng = (vesselLng - portLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(portLat * Math.PI / 180) * Math.cos(vesselLat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
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
      
      // Check if this refinery already has vessels nearby using standard distance calculation
      const refineryLat = parseFloat(refinery.lat);
      const refineryLng = parseFloat(refinery.lng);
      
      // Get all vessels
      const allVesselsForRefinery = await db.query.vessels.findMany({
        where: and(
          sql`${vessels.currentLat} IS NOT NULL`,
          sql`${vessels.currentLng} IS NOT NULL`
        ),
        limit: 50
      });
      
      // Calculate distances manually and filter nearby vessels
      const nearbyVesselCount = allVesselsForRefinery.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const vesselLat = parseFloat(vessel.currentLat);
        const vesselLng = parseFloat(vessel.currentLng);
        
        // Skip invalid coordinates
        if (isNaN(vesselLat) || isNaN(vesselLng) || isNaN(refineryLat) || isNaN(refineryLng)) {
          return false;
        }
        
        // Calculate distance using the Haversine formula (approximate distance in km)
        const R = 6371; // Radius of the Earth in km
        const dLat = (vesselLat - refineryLat) * Math.PI / 180;
        const dLng = (vesselLng - refineryLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(refineryLat * Math.PI / 180) * Math.cos(vesselLat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
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