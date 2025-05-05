/**
 * Geographic utility functions for maritime applications
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 First latitude in decimal degrees
 * @param lon1 First longitude in decimal degrees
 * @param lat2 Second latitude in decimal degrees
 * @param lon2 Second longitude in decimal degrees
 * @returns Distance in nautical miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Convert decimal degrees to radians
  const toRad = (value: number): number => value * Math.PI / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Earth radius in nautical miles
  const R = 3440.07; // Nautical miles
  
  // Return distance in nautical miles
  return R * c;
}

/**
 * Calculate approximate travel time between two points
 * @param distance Distance in nautical miles
 * @param speed Speed in knots (nautical miles per hour)
 * @returns Travel time in hours
 */
export function calculateTravelTime(distance: number, speed: number): number {
  if (speed <= 0) return 0;
  return distance / speed;
}

/**
 * Convert coordinates from decimal degrees format (e.g. 40.7128, -74.0060)
 * to degrees-minutes-seconds format (e.g. 40° 42' 46" N, 74° 0' 22" W)
 * @param lat Latitude in decimal degrees
 * @param lng Longitude in decimal degrees
 * @returns Formatted coordinate string
 */
export function formatCoordinates(lat: number, lng: number): string {
  const formatDMS = (value: number, isLat: boolean): string => {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.floor((minutesDecimal - minutes) * 60);
    
    const direction = isLat
      ? (value >= 0 ? "N" : "S")
      : (value >= 0 ? "E" : "W");
      
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };
  
  return `${formatDMS(lat, true)}, ${formatDMS(lng, false)}`;
}

/**
 * Convert string coordinates to decimal degrees
 * @param latStr Latitude string
 * @param lngStr Longitude string
 * @returns Coordinates as [lat, lng] or null if invalid
 */
export function parseCoordinates(latStr: string | null | undefined, lngStr: string | null | undefined): [number, number] | null {
  if (!latStr || !lngStr) return null;
  
  try {
    const lat = parseFloat(String(latStr));
    const lng = parseFloat(String(lngStr));
    
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    
    return [lat, lng];
  } catch (error) {
    return null;
  }
}

/**
 * Determine if a position is at or near a port
 * @param lat Position latitude
 * @param lng Position longitude
 * @param portLat Port latitude
 * @param portLng Port longitude
 * @param radiusNM Radius in nautical miles (default: 5)
 * @returns True if the position is within the radius of the port
 */
export function isNearPort(lat: number, lng: number, portLat: number, portLng: number, radiusNM: number = 5): boolean {
  const distance = calculateDistance(lat, lng, portLat, portLng);
  return distance <= radiusNM;
}

/**
 * Convert a bearing in degrees to a cardinal direction
 * @param bearing Bearing in degrees (0-360)
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function bearingToCardinal(bearing: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}