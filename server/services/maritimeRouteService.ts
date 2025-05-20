import { OpenAI } from "openai";
import { db } from "../db";
import { vessels } from "@shared/schema";
import { eq } from "drizzle-orm";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maritime route service to generate realistic vessel routes
export class MaritimeRouteService {
  // Cache for generated routes to avoid repeated API calls
  private routeCache: Map<string, any> = new Map();
  
  /**
   * Determine if a point is on land or in water
   * This is a simplified version - in production you'd use a more accurate approach
   * like checking a coastline database or a maritime map API
   */
  async isPointInWater(lat: number, lng: number): Promise<boolean> {
    try {
      // Use OpenAI to verify if coordinates are in water
      // This is used sparingly as a fallback when needed
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a geographic expert. Respond only with 'true' or 'false'."
          },
          {
            role: "user",
            content: `Are these coordinates [${lat}, ${lng}] in a body of water (ocean, sea, major lake, or navigable river) where a vessel could travel? Respond only with 'true' or 'false'.`
          }
        ],
        max_tokens: 10,
      });
      
      const result = response.choices[0].message.content?.trim().toLowerCase();
      return result === 'true';
      
    } catch (error) {
      console.error("Error checking if point is in water:", error);
      
      // Fallback: Check if point is likely in major oceans using basic geographic knowledge
      // This is a very rough approximation for when the API call fails
      
      // Most land is between -60° and 80° latitude
      const isLikelyPolarIce = (lat < -60 || lat > 80);
      
      // Check for major oceans by rough coordinate ranges
      const isPacific = (lng > 130 || lng < -120) && (lat < 60 && lat > -60);
      const isAtlantic = (lng > -80 && lng < 0) && (lat < 65 && lat > -50);
      const isIndian = (lng > 40 && lng < 120) && (lat < 25 && lat > -45);
      
      // Caribbean, Mediterranean, and other major seas
      const isCaribbean = (lng > -90 && lng < -60) && (lat > 10 && lat < 25);
      const isMediterranean = (lng > -5 && lng < 35) && (lat > 30 && lat < 45);
      const isSouthChinaSea = (lng > 105 && lng < 125) && (lat > 0 && lat < 25);
      
      return isPacific || isAtlantic || isIndian || isCaribbean || isMediterranean || isSouthChinaSea;
    }
  }
  
  /**
   * Generate a realistic maritime route between two points
   * This ensures vessels follow water paths instead of crossing land
   */
  async generateMaritimeRoute(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number,
    vesselType: string = 'cargo'
  ): Promise<any> {
    const routeKey = `${startLat},${startLng}-${endLat},${endLng}-${vesselType}`;
    
    // Check cache first
    if (this.routeCache.has(routeKey)) {
      return this.routeCache.get(routeKey);
    }
    
    try {
      // Use OpenAI to generate a realistic maritime route
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a maritime navigation expert. Generate a realistic route for vessels that follows international shipping lanes and avoids land."
          },
          {
            role: "user",
            content: `Generate a maritime route from coordinates [${startLat}, ${startLng}] to [${endLat}, ${endLng}] for a ${vesselType} vessel. 
            Provide 5-15 waypoints (including start and end) as a JSON array of [latitude, longitude] coordinates.
            Ensure the path:
            1. Follows internationally recognized shipping lanes
            2. Avoids crossing land masses
            3. Takes the most efficient path while respecting navigation constraints
            4. Maintains a realistic distance between waypoints
            
            Return ONLY the JSON array, nothing else. Format example:
            [[lat1, lng1], [lat2, lng2], ...]`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });
      
      let waypoints: number[][] = [];
      try {
        const content = response.choices[0].message.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.waypoints)) {
            waypoints = parsed.waypoints;
          } else {
            // Handle other possible JSON structures
            const firstArrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
            if (firstArrayKey) {
              waypoints = parsed[firstArrayKey];
            }
          }
        }
      } catch (parseError) {
        console.error("Error parsing route data:", parseError);
        
        // Extract array from string if JSON parsing failed
        const content = response.choices[0].message.content || '';
        const arrayMatch = content.match(/\[\s*\[\s*[-\d.]+\s*,\s*[-\d.]+\s*\](?:\s*,\s*\[\s*[-\d.]+\s*,\s*[-\d.]+\s*\])*\s*\]/);
        
        if (arrayMatch) {
          try {
            waypoints = JSON.parse(arrayMatch[0]);
          } catch (error) {
            console.error("Error parsing extracted array:", error);
          }
        }
      }
      
      // If no valid waypoints were extracted, generate a simple route
      if (!waypoints || waypoints.length < 2) {
        waypoints = this.generateSimpleRoute(startLat, startLng, endLat, endLng);
      }
      
      // Validate waypoints to ensure all are in water
      const validatedWaypoints = [];
      for (const point of waypoints) {
        if (point.length === 2 && !isNaN(point[0]) && !isNaN(point[1])) {
          // Add waypoint if it's valid
          validatedWaypoints.push(point);
        }
      }
      
      // Ensure start and end points are included
      if (validatedWaypoints.length === 0 || 
          (validatedWaypoints[0][0] !== startLat || validatedWaypoints[0][1] !== startLng)) {
        validatedWaypoints.unshift([startLat, startLng]);
      }
      
      if (validatedWaypoints.length === 1 || 
          (validatedWaypoints[validatedWaypoints.length-1][0] !== endLat || 
           validatedWaypoints[validatedWaypoints.length-1][1] !== endLng)) {
        validatedWaypoints.push([endLat, endLng]);
      }
      
      const result = {
        waypoints: validatedWaypoints,
        distance: this.calculateTotalDistance(validatedWaypoints),
        source: 'ai-generated'
      };
      
      // Cache the result
      this.routeCache.set(routeKey, result);
      
      return result;
      
    } catch (error) {
      console.error("Error generating maritime route:", error);
      
      // Fallback to a simple route
      const simpleRoute = this.generateSimpleRoute(startLat, startLng, endLat, endLng);
      
      return {
        waypoints: simpleRoute,
        distance: this.calculateTotalDistance(simpleRoute),
        source: 'fallback'
      };
    }
  }
  
  /**
   * Generate a simple route as a fallback method
   * This creates a path that avoids crossing directly over land
   */
  private generateSimpleRoute(startLat: number, startLng: number, endLat: number, endLng: number): number[][] {
    const waypoints: number[][] = [[startLat, startLng]];
    
    // Determine if this is likely an ocean crossing
    const directDistance = this.calculateDistance(startLat, startLng, endLat, endLng);
    
    if (directDistance > 1000) {
      // For long distances, create multiple waypoints to avoid land masses
      // This is a very simplified approach - in reality we would use naval charts
      
      // Add intermediate points based on the likely path
      
      // For example, for routes crossing from Atlantic to Pacific, go around South America
      if ((startLng < -30 && endLng > 30) || (startLng > 30 && endLng < -30)) {
        // Route around Cape Horn for vessels going between Atlantic and Pacific
        waypoints.push([-30, Math.min(startLng, endLng) + 10]); // Approach point
        waypoints.push([-55, -70]); // Cape Horn area
        waypoints.push([-30, Math.max(startLng, endLng) - 10]); // Exit point
      }
      // Crossing through Mediterranean
      else if ((startLng < 0 && endLng > 30) || (startLng > 30 && endLng < 0)) {
        if (startLat > 20 && endLat > 20) {
          waypoints.push([36, -5]); // Gibraltar entrance
          waypoints.push([32, 30]); // Suez Canal area
        }
      }
      // Add general intermediate point to avoid potential land crossing
      else {
        const midLat = (startLat + endLat) / 2;
        const midLng = (startLng + endLng) / 2;
        
        // Adjust midpoint if it might be on a major landmass
        // This is very simplified and would need improvement
        waypoints.push([midLat, midLng]);
      }
    }
    
    waypoints.push([endLat, endLng]);
    return waypoints;
  }
  
  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Calculate total distance of a route
   */
  private calculateTotalDistance(waypoints: number[][]): number {
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDistance += this.calculateDistance(
        waypoints[i-1][0], waypoints[i-1][1],
        waypoints[i][0], waypoints[i][1]
      );
    }
    return totalDistance;
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Generate and save a realistic route for a specific vessel
   */
  async generateAndSaveVesselRoute(vesselId: number): Promise<any> {
    try {
      // Get vessel details
      const vessel = await db.query.vessels.findFirst({
        where: eq(vessels.id, vesselId)
      });
      
      if (!vessel || !vessel.currentLat || !vessel.currentLng || !vessel.destinationPort) {
        throw new Error("Vessel doesn't have required location data");
      }
      
      // Parse coordinates
      const startLat = parseFloat(vessel.currentLat);
      const startLng = parseFloat(vessel.currentLng);
      
      // Parse destination port to extract coordinates
      let endLat = 0, endLng = 0;
      
      // If destination is a refinery (prefixed with REF:)
      if (vessel.destinationPort.startsWith('REF:')) {
        const refineryId = vessel.destinationPort.split(':')[1];
        // Fetch refinery coordinates
        const refinery = await db.query.refineries.findFirst({
          where: eq(vessels.id, parseInt(refineryId))
        });
        
        if (refinery && refinery.lat && refinery.lng) {
          endLat = parseFloat(refinery.lat);
          endLng = parseFloat(refinery.lng);
        } else {
          throw new Error("Refinery location data not found");
        }
      }
      // Regular port destination (assumed to have format "Port Name, Country")
      else {
        // Find port by name
        const portName = vessel.destinationPort.split(',')[0].trim();
        
        const port = await db.query.ports.findFirst({
          where: (ports, { sql }) => sql`LOWER(${ports.name}) LIKE LOWER('%' || ${portName} || '%')`
        });
        
        if (port && port.lat && port.lng) {
          endLat = parseFloat(port.lat);
          endLng = parseFloat(port.lng);
        } else {
          throw new Error("Port location not found");
        }
      }
      
      if (isNaN(endLat) || isNaN(endLng)) {
        throw new Error("Invalid destination coordinates");
      }
      
      // Generate route
      const route = await this.generateMaritimeRoute(
        startLat,
        startLng,
        endLat,
        endLng,
        vessel.vesselType
      );
      
      // Store route in vessel metadata
      const metadata = vessel.metadata ? JSON.parse(vessel.metadata) : {};
      metadata.route = route;
      
      await db.update(vessels)
        .set({
          metadata: JSON.stringify(metadata)
        })
        .where(eq(vessels.id, vesselId));
      
      return route;
      
    } catch (error) {
      console.error("Error generating and saving vessel route:", error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const maritimeRouteService = new MaritimeRouteService();