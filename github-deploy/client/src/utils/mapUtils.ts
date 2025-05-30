/**
 * Map utility functions for maritime tracking
 */

/**
 * Check if a location is likely in water (not on land)
 * This uses a simplified approach to determine if coordinates are in water
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns True if the location is likely in water
 */
export function isLikelyInWater(lat: number, lng: number): boolean {
  // Check valid coordinate range
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  
  // Check for known major land masses
  
  // North America mainland
  if (lat >= 25 && lat <= 60 && lng >= -120 && lng <= -70) {
    // Exceptions for navigable waters
    if (
      (lat >= 41 && lat <= 49 && lng >= -93 && lng <= -76) || // Great Lakes
      (lat >= 29 && lat <= 31 && lng >= -91 && lng <= -89) || // Mississippi Delta
      (lat >= 37 && lat <= 40 && lng >= -77 && lng <= -75)    // Chesapeake Bay
    ) return true;
    
    return false; // Otherwise assume land
  }
  
  // Central Asia/Europe - far from coastlines
  if (lat >= 40 && lat <= 55 && lng >= 75 && lng <= 110) return false;
  
  // Central Africa/Sahara Desert
  if (lat >= 15 && lat <= 30 && lng >= 10 && lng <= 30) return false;
  
  // Central South America/Amazon
  if (lat >= -10 && lat <= 5 && lng >= -70 && lng <= -50) return false;
  
  // Central Australia
  if (lat >= -30 && lat <= -20 && lng >= 125 && lng <= 140) return false;
  
  // Major shipping lanes (definitely water)
  
  // Gulf of Mexico & Caribbean
  if (lat >= 15 && lat <= 30 && lng >= -98 && lng <= -65) return true;
  
  // Persian Gulf (oil shipping)
  if (lat >= 24 && lat <= 30 && lng >= 48 && lng <= 57) return true;
  
  // South China Sea
  if (lat >= 0 && lat <= 25 && lng >= 105 && lng <= 120) return true;
  
  // Mediterranean
  if (lat >= 30 && lat <= 45 && lng >= -5 && lng <= 36) return true;
  
  // North Sea & Baltic
  if (lat >= 50 && lat <= 62 && lng >= -4 && lng <= 25) return true;
  
  // Major oceans - these are generally safe
  if (
    // Atlantic
    (lng >= -65 && lng <= -10 && lat >= -50 && lat <= 60) ||
    // Pacific
    ((lng <= -120 || lng >= 120) && lat >= -50 && lat <= 60) ||
    // Indian Ocean
    (lng >= 45 && lng <= 100 && lat >= -40 && lat <= 25)
  ) return true;
  
  // Assume it's water unless it's far from known oceans
  // For coordinates that don't match our rules, we'll check the distance from shore
  const distanceFromShore = estimateDistanceFromShore(lat, lng);
  return distanceFromShore >= 0; // Return true if we're not definitely on land
}

/**
 * Estimate if a point is on land or water
 * This is a simplified estimation that doesn't use coastline data
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns Positive values indicate likely water, negative values indicate likely land
 */
function estimateDistanceFromShore(lat: number, lng: number): number {
  // Simple check for positions very likely in oceans (mid-ocean)
  if (
    (lng < -100 && lng > -160 && lat > -50 && lat < 50) || // Mid-Pacific
    (lng > 150 && lng < 180 && lat > -50 && lat < 50) ||   // Western Pacific
    (lng > -60 && lng < -20 && lat > -40 && lat < 40) ||   // Mid-Atlantic
    (lng > 50 && lng < 90 && lat > -30 && lat < 20)        // Indian Ocean
  ) {
    return 1; // Definitely water
  }
  
  // Check for positions definitely on large continents
  if (
    // North America interior
    (lat > 35 && lat < 50 && lng > -110 && lng < -80) ||
    // South America interior
    (lat > -20 && lat < -5 && lng > -65 && lng < -50) ||
    // Africa interior
    (lat > -10 && lat < 20 && lng > 15 && lng < 35) ||
    // Asia interior
    (lat > 30 && lat < 50 && lng > 80 && lng < 110) ||
    // Australia interior
    (lat > -30 && lat < -20 && lng > 125 && lng < 140)
  ) {
    return -1; // Definitely land
  }
  
  // For positions that didn't match our definite categories,
  // we'll use a more general approach based on longitude/latitude
  // This is still a simplification but better than nothing
  return 0.5; // Assume water by default (we prefer showing vessels rather than hiding valid ones)
}

/**
 * Checks if a vessel position is valid (in water and not on land)
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns True if vessel position is valid
 */
export function isValidVesselPosition(lat: number, lng: number): boolean {
  // First check if coordinates are reasonable
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  
  // Then check if the vessel is likely in water
  return isLikelyInWater(lat, lng);
}