/**
 * Utility functions for calculating distances between geographical coordinates
 */

/**
 * Calculate the distance between two points on Earth's surface
 * using the Haversine formula
 * 
 * @param lat1 - Latitude of point 1 in decimal degrees
 * @param lng1 - Longitude of point 1 in decimal degrees  
 * @param lat2 - Latitude of point 2 in decimal degrees
 * @param lng2 - Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert degrees to radians
  const lat1Rad = deg2rad(lat1);
  const lng1Rad = deg2rad(lng1);
  const lat2Rad = deg2rad(lat2);
  const lng2Rad = deg2rad(lng2);
  
  // Difference in coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLng = lng2Rad - lng1Rad;
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Convert degrees to radians
 * 
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function deg2rad(degrees: number): number {
  return degrees * (Math.PI/180);
}

/**
 * Calculate bearing between two points
 * 
 * @param lat1 - Latitude of point 1 in decimal degrees
 * @param lng1 - Longitude of point 1 in decimal degrees
 * @param lat2 - Latitude of point 2 in decimal degrees
 * @param lng2 - Longitude of point 2 in decimal degrees
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Convert degrees to radians
  const lat1Rad = deg2rad(lat1);
  const lng1Rad = deg2rad(lng1);
  const lat2Rad = deg2rad(lat2);
  const lng2Rad = deg2rad(lng2);
  
  // Calculate bearing
  const y = Math.sin(lng2Rad - lng1Rad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lng2Rad - lng1Rad);
  
  let bearing = Math.atan2(y, x);
  bearing = bearing * 180 / Math.PI; // Convert to degrees
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return bearing;
}