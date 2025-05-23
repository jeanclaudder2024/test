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
   * Using multiple methods to ensure accuracy
   */
  async isPointInWater(lat: number, lng: number): Promise<boolean> {
    // First, check against known landmass coordinate ranges
    // This is a fast initial filter that doesn't require API calls
    if (this.isDefinitelyLand(lat, lng)) {
      return false;
    }
    
    if (this.isDefinitelyWater(lat, lng)) {
      return true;
    }
    
    try {
      // For ambiguous points, use OpenAI for more accurate determination
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a marine navigation expert. Your sole task is to determine if specific GPS coordinates are in navigable water for ships. Respond only with 'true' or 'false'."
          },
          {
            role: "user",
            content: `Are the coordinates [${lat}, ${lng}] in navigable water where maritime vessels can travel? Consider oceans, seas, major lakes, and navigable rivers. Respond only with 'true' or 'false' - nothing else.`
          }
        ],
        max_tokens: 10,
        temperature: 0.1, // Low temperature for more deterministic response
      });
      
      const result = response.choices[0].message.content?.trim().toLowerCase();
      return result === 'true';
      
    } catch (error) {
      console.error("Error checking if point is in water using AI:", error);
      
      // If OpenAI call fails, use our enhanced geographic database approach
      return this.fallbackWaterCheck(lat, lng);
    }
  }
  
  /**
   * Check if coordinates are definitely on major landmasses
   * This uses known continental/land boundaries
   */
  private isDefinitelyLand(lat: number, lng: number): boolean {
    // Define major continental landmasses
    
    // North America
    if ((lng > -140 && lng < -52) && (lat > 25 && lat < 70)) {
      // Exclude Great Lakes
      const inGreatLakes = (
        (lng > -93 && lng < -76) && (lat > 41 && lat < 49)
      );
      
      // Exclude Gulf of Mexico
      const inGulfOfMexico = (
        (lng > -98 && lng < -81) && (lat > 18 && lat < 30)
      );
      
      if (!inGreatLakes && !inGulfOfMexico) {
        // Check some known land regions
        // Central North America
        if ((lng > -120 && lng < -80) && (lat > 30 && lat < 60)) {
          return true;
        }
        
        // Mexico Central Area
        if ((lng > -110 && lng < -90) && (lat > 15 && lat < 30)) {
          return true;
        }
      }
    }
    
    // South America
    if ((lng > -82 && lng < -35) && (lat > -58 && lat < 12)) {
      // Central South America (Amazon is navigable so we exclude parts)
      if ((lng > -70 && lng < -50) && (lat > -30 && lat < 0)) {
        return true;
      }
      // Andes region
      if ((lng > -75 && lng < -65) && (lat > -40 && lat < 5)) {
        return true;
      }
    }
    
    // Europe (excluding seas)
    if ((lng > -10 && lng < 40) && (lat > 36 && lat < 70)) {
      // Central Europe
      if ((lng > 0 && lng < 30) && (lat > 45 && lat < 65)) {
        return true;
      }
      // Iberian Peninsula
      if ((lng > -10 && lng < 5) && (lat > 36 && lat < 44)) {
        return true;
      }
    }
    
    // Africa
    if ((lng > -18 && lng < 52) && (lat > -35 && lat < 37)) {
      // Central Africa
      if ((lng > 10 && lng < 40) && (lat > -10 && lat < 20)) {
        return true;
      }
      // Sahara Desert
      if ((lng > -10 && lng < 30) && (lat > 15 && lat < 30)) {
        return true;
      }
    }
    
    // Asia
    if ((lng > 60 && lng < 150) && (lat > 10 && lat < 60)) {
      // Central Asia
      if ((lng > 65 && lng < 90) && (lat > 35 && lat < 50)) {
        return true;
      }
      // Himalayan region
      if ((lng > 70 && lng < 95) && (lat > 25 && lat < 40)) {
        return true;
      }
      // Central China
      if ((lng > 100 && lng < 120) && (lat > 25 && lat < 45)) {
        return true;
      }
    }
    
    // Australia
    if ((lng > 113 && lng < 153) && (lat > -43 && lat < -10)) {
      // Central Australia (Desert)
      if ((lng > 120 && lng < 140) && (lat > -30 && lat < -20)) {
        return true;
      }
    }
    
    // Antarctica
    if (lat < -60) {
      return true;
    }
    
    // Greenland
    if ((lng > -60 && lng < -20) && (lat > 60 && lat < 83)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if coordinates are definitely in major water bodies
   */
  private isDefinitelyWater(lat: number, lng: number): boolean {
    // Middle of major oceans - definitely water
    
    // Pacific Ocean (Central)
    if ((lng > -180 && lng < -100) && (lat > -50 && lat < 50)) {
      return true;
    }
    
    if ((lng > 140 && lng < 180) && (lat > -50 && lat < 50)) {
      return true;
    }
    
    // Atlantic Ocean (Central)
    if ((lng > -70 && lng < -20) && (lat > -40 && lat < 40)) {
      return true;
    }
    
    // Indian Ocean (Central)
    if ((lng > 50 && lng < 100) && (lat > -40 && lat < 20)) {
      return true;
    }
    
    // Southern Ocean
    if (lat < -50 && lat > -60) {
      return true;
    }
    
    // Arctic Ocean (not covered by land)
    if (lat > 80 && (lng > -180 && lng < 180)) {
      // Exclude known land
      if (!((lng > -60 && lng < -20) && (lat > 60 && lat < 83))) { // Not Greenland
        return true;
      }
    }
    
    // Mediterranean Sea (Central)
    if ((lng > 5 && lng < 30) && (lat > 31 && lat < 45)) {
      return true;
    }
    
    // Caribbean Sea
    if ((lng > -85 && lng < -65) && (lat > 12 && lat < 23)) {
      return true;
    }
    
    // South China Sea
    if ((lng > 110 && lng < 120) && (lat > 5 && lat < 20)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Fallback method to check if point is in water
   * Uses geographic knowledge when API is unavailable
   */
  private fallbackWaterCheck(lat: number, lng: number): boolean {
    // Major oceans by rough coordinate ranges
    
    // Pacific Ocean
    const isPacific = (
      ((lng > 140 || lng < -120) && (lat < 60 && lat > -60)) ||
      ((lng > -180 && lng < -90) && (lat < 60 && lat > -50))
    );
    
    // Atlantic Ocean
    const isAtlantic = (
      ((lng > -80 && lng < -10) && (lat < 65 && lat > -50)) ||
      ((lng > -65 && lng < -10) && (lat < 65 && lat > -50))
    );
    
    // Indian Ocean
    const isIndian = (lng > 40 && lng < 120) && (lat < 25 && lat > -45);
    
    // Arctic Ocean
    const isArctic = lat > 65;
    
    // Southern Ocean
    const isSouthern = lat < -50;
    
    // Mediterranean, Black Sea, and Caspian Sea
    const isMediterranean = (lng > -5 && lng < 42) && (lat > 30 && lat < 47);
    
    // Gulf of Mexico
    const isGulfOfMexico = (lng > -98 && lng < -80) && (lat > 18 && lat < 30);
    
    // Caribbean Sea
    const isCaribbean = (lng > -85 && lng < -60) && (lat > 10 && lat < 25);
    
    // South China Sea
    const isSouthChinaSea = (lng > 105 && lng < 125) && (lat > 0 && lat < 25);
    
    // Bay of Bengal
    const isBayOfBengal = (lng > 80 && lng < 100) && (lat > 5 && lat < 22);
    
    // Arabian Sea
    const isArabianSea = (lng > 55 && lng < 78) && (lat > 5 && lat < 25);
    
    // Red Sea
    const isRedSea = (lng > 32 && lng < 44) && (lat > 12 && lat < 30);
    
    // Persian Gulf
    const isPersianGulf = (lng > 47 && lng < 57) && (lat > 23 && lat < 30);
    
    return isPacific || isAtlantic || isIndian || isArctic || isSouthern || 
           isMediterranean || isGulfOfMexico || isCaribbean || isSouthChinaSea || 
           isBayOfBengal || isArabianSea || isRedSea || isPersianGulf;
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
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `You are a maritime navigation expert with detailed knowledge of international shipping lanes, naval navigation, and maritime geography.
            
            Your task is to create realistic vessel routes that strictly follow water paths. Never allow vessels to cross over land - ensure all waypoints are in navigable water.
            
            Use your knowledge of:
            1. Major shipping lanes and standard maritime routes
            2. Ocean and sea geography
            3. Navigable rivers, canals, and straits
            4. Maritime choke points (Suez Canal, Panama Canal, Strait of Hormuz, etc.)
            5. Vessel draft and size limitations for different waterways`
          },
          {
            role: "user",
            content: `Generate a realistic maritime route from [${startLat}, ${startLng}] to [${endLat}, ${endLng}] for a ${vesselType} vessel.
            
            I need a JSON object with a "waypoints" array containing 5-15 coordinate pairs in the format [latitude, longitude].
            
            IMPORTANT REQUIREMENTS:
            1. The vessel MUST STAY IN WATER AT ALL TIMES - never cross land
            2. Follow established shipping routes where available
            3. Navigate through canals/straits when appropriate
            4. The first waypoint must be exactly [${startLat}, ${startLng}]
            5. The last waypoint must be exactly [${endLat}, ${endLng}]
            6. Space waypoints appropriately (roughly 100-500km apart for long voyages)
            
            Example format of your response:
            {
              "waypoints": [
                [starting_lat, starting_lng],
                [intermediate_lat1, intermediate_lng1],
                ...
                [destination_lat, destination_lng]
              ]
            }`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more deterministic responses
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
        try {
          const content = response.choices[0].message.content || '';
          const arrayMatch = content.match(/\[\s*\[\s*[-\d.]+\s*,\s*[-\d.]+\s*\](?:\s*,\s*\[\s*[-\d.]+\s*,\s*[-\d.]+\s*\])*\s*\]/);
          
          if (arrayMatch) {
            waypoints = JSON.parse(arrayMatch[0]);
          }
        } catch (error) {
          console.error("Error parsing extracted array:", error);
        }
      }
      
      // If no valid waypoints were extracted, generate a simple route
      if (!waypoints || waypoints.length < 2) {
        waypoints = this.generateSmartRoute(startLat, startLng, endLat, endLng, vesselType);
      }
      
      // Validate waypoints to ensure all are in water
      const validatedWaypoints: number[][] = [];
      for (const point of waypoints) {
        if (point.length === 2 && !isNaN(point[0]) && !isNaN(point[1])) {
          // Only add points that are in water or maritime passages
          // This ensures vessels never appear over land
          const isInWater = await this.isPointInWater(point[0], point[1]);
          if (isInWater) {
            validatedWaypoints.push(point);
          } else {
            console.log(`Skipping land point: [${point[0]}, ${point[1]}]`);
          }
        }
      }
      
      // If we don't have enough valid waypoints, use our smart route generator
      if (validatedWaypoints.length < 2) {
        const backupWaypoints = this.generateSmartRoute(startLat, startLng, endLat, endLng, vesselType);
        return {
          waypoints: backupWaypoints,
          distance: this.calculateTotalDistance(backupWaypoints),
          source: 'backup',
          note: 'Used backup route generator due to validation failures'
        };
      }
      
      // Ensure start and end points are included
      if (validatedWaypoints[0][0] !== startLat || validatedWaypoints[0][1] !== startLng) {
        validatedWaypoints.unshift([startLat, startLng]);
      }
      
      if (validatedWaypoints[validatedWaypoints.length-1][0] !== endLat || 
          validatedWaypoints[validatedWaypoints.length-1][1] !== endLng) {
        validatedWaypoints.push([endLat, endLng]);
      }
      
      const result = {
        waypoints: validatedWaypoints,
        distance: this.calculateTotalDistance(validatedWaypoints),
        source: 'ai-generated',
        vesselType: vesselType,
        createdAt: new Date().toISOString()
      };
      
      // Cache the result
      this.routeCache.set(routeKey, result);
      
      return result;
      
    } catch (error) {
      console.error("Error generating maritime route:", error);
      
      // Fallback to a smart route instead of the simple one
      const smartRoute = this.generateSmartRoute(startLat, startLng, endLat, endLng, vesselType);
      
      return {
        waypoints: smartRoute,
        distance: this.calculateTotalDistance(smartRoute),
        source: 'fallback',
        vesselType: vesselType
      };
    }
  }
  
  /**
   * Generate a smarter route with awareness of major waterways
   * This is more sophisticated than the simple route
   * and works as a fallback when AI route generation fails
   */
  private generateSmartRoute(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number, 
    vesselType: string
  ): number[][] {
    const waypoints: number[][] = [[startLat, startLng]];
    
    // Calculate the direct distance and bearing
    const directDistance = this.calculateDistance(startLat, startLng, endLat, endLng);
    const bearing = this.calculateBearing(startLat, startLng, endLat, endLng);
    
    // Different routing strategies based on distance
    if (directDistance > 3000) {
      // Long distance voyage - use major sea lanes with intermediate points
      this.addOceanWaypoints(waypoints, startLat, startLng, endLat, endLng, bearing, directDistance);
    } else if (directDistance > 1000) {
      // Medium distance - add some intermediate waypoints
      this.addRegionalWaypoints(waypoints, startLat, startLng, endLat, endLng, bearing, directDistance);
    } else {
      // Shorter routes - avoid land while taking a more direct path
      this.addCoastalWaypoints(waypoints, startLat, startLng, endLat, endLng, bearing, directDistance);
    }
    
    // Add destination
    waypoints.push([endLat, endLng]);
    
    return waypoints;
  }
  
  /**
   * Add waypoints for ocean crossing routes
   */
  private addOceanWaypoints(
    waypoints: number[][], 
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number,
    bearing: number,
    distance: number
  ): void {
    // Determine the type of crossing
    
    // Check for trans-Pacific
    if ((startLng < -120 && endLng > 120) || (startLng > 120 && endLng < -120)) {
      // Add Pacific crossing waypoints through safe waters
      if (startLat > 0 && endLat > 0) {
        // Northern Pacific
        waypoints.push([35, -170]);
        waypoints.push([40, 170]);
      } else {
        // Southern Pacific
        waypoints.push([-5, -160]);
        waypoints.push([-15, 170]);
      }
    }
    // Check for trans-Atlantic
    else if ((startLng < -30 && endLng > -10) || (startLng > -10 && endLng < -30)) {
      // Atlantic crossing
      if (startLat > 0 && endLat > 0) {
        // Northern Atlantic
        waypoints.push([40, -40]);
      } else {
        // Southern Atlantic
        waypoints.push([-20, -30]);
      }
    }
    // Check for routes crossing from Atlantic to Indian Ocean
    else if ((startLng < 20 && endLng > 50) || (startLng > 50 && endLng < 20)) {
      // Route around Africa through Cape of Good Hope
      waypoints.push([0, 0]); // Equatorial point
      waypoints.push([-30, 20]); // South of Africa
    }
    // Check for Europe to Asia via Suez Canal
    else if ((startLng < 40 && endLng > 70) || (startLng > 70 && endLng < 40)) {
      if (startLat > 20 && endLat > 0) {
        // Mediterranean to Suez to Indian Ocean
        waypoints.push([36, 15]); // Mediterranean
        waypoints.push([30, 32]); // Suez entrance
        waypoints.push([12, 45]); // Red Sea exit
        waypoints.push([10, 60]); // Indian Ocean
      }
    }
    // Check for Panama Canal transit
    else if ((Math.abs(startLng - endLng) > 50) && 
            ((startLat > 0 && endLat > 0) || (startLat < 0 && endLat < 0))) {
      // Route through Panama if sensible
      if ((startLng < -80 && endLng > -80) || (startLng > -80 && endLng < -80)) {
        waypoints.push([15, -80]); // Caribbean approach
        waypoints.push([9, -79.5]); // Panama Canal
        waypoints.push([5, -85]); // Pacific exit
      }
    }
    
    // If no specific sea route was identified, use generic ocean waypoints 
    if (waypoints.length < 2) {
      // Add intermediate ocean points based on distance
      const numPoints = Math.min(4, Math.max(2, Math.floor(distance / 1000)));
      
      for (let i = 1; i < numPoints; i++) {
        // Create waypoints along a great circle route
        const fraction = i / numPoints;
        const intermediateLat = startLat + fraction * (endLat - startLat);
        const intermediateLng = startLng + fraction * (endLng - startLng);
        
        waypoints.push([intermediateLat, intermediateLng]);
      }
    }
  }
  
  /**
   * Add waypoints for regional routes (medium distance)
   */
  private addRegionalWaypoints(
    waypoints: number[][], 
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number,
    bearing: number,
    distance: number
  ): void {
    // For medium routes, add 2-3 intermediate points
    const numPoints = Math.min(3, Math.max(2, Math.floor(distance / 500)));
    
    for (let i = 1; i < numPoints; i++) {
      const fraction = i / numPoints;
      const intermediateLat = startLat + fraction * (endLat - startLat);
      const intermediateLng = startLng + fraction * (endLng - startLng);
      
      waypoints.push([intermediateLat, intermediateLng]);
    }
  }
  
  /**
   * Add waypoints for coastal routes (shorter distance)
   */
  private addCoastalWaypoints(
    waypoints: number[][], 
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number,
    bearing: number,
    distance: number
  ): void {
    // For coastal routes, we may just need 1-2 additional points
    if (distance > 500) {
      // Add a midpoint
      const midLat = (startLat + endLat) / 2;
      const midLng = (startLng + endLng) / 2;
      waypoints.push([midLat, midLng]);
    }
    
    // For very short routes, just use start and end points (handled by caller)
  }
  
  /**
   * Calculate bearing between two points
   */
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const lat1Rad = this.deg2rad(lat1);
    const lat2Rad = this.deg2rad(lat2);
    const lngDiffRad = this.deg2rad(lng2 - lng1);
    
    const y = Math.sin(lngDiffRad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lngDiffRad);
    
    let bearingRad = Math.atan2(y, x);
    let bearingDeg = bearingRad * 180 / Math.PI;
    
    // Normalize to 0-360
    bearingDeg = (bearingDeg + 360) % 360;
    
    return bearingDeg;
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
          // If port not found, use a fallback 200km ahead in the vessel's direction
          const bearingRad = (vessel.heading || 0) * Math.PI / 180;
          const distance = 200; // km
          const R = 6371; // Earth radius in km
          
          // Approximate destination coordinates using simple formula
          endLat = startLat + (distance / R) * Math.cos(bearingRad) * (180 / Math.PI);
          endLng = startLng + (distance / R) * Math.sin(bearingRad) * (180 / Math.PI) / Math.cos(startLat * Math.PI / 180);
          
          console.log(`Port '${portName}' not found, using fallback destination at ${endLat.toFixed(4)},${endLng.toFixed(4)}`);
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