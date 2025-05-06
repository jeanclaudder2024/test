/**
 * Calculate the distance between two geographical coordinates using the Haversine formula
 * 
 * @param lat1 Latitude of the first point
 * @param lng1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lng2 Longitude of the second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Convert latitude and longitude from degrees to radians
  const latRad1 = (lat1 * Math.PI) / 180;
  const lngRad1 = (lng1 * Math.PI) / 180;
  const latRad2 = (lat2 * Math.PI) / 180;
  const lngRad2 = (lng2 * Math.PI) / 180;

  // Haversine formula
  const dLat = latRad2 - latRad1;
  const dLng = lngRad2 - lngRad1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  // Earth radius in kilometers
  const earthRadius = 6371;
  
  // Calculate the distance
  const distance = earthRadius * c;
  
  return distance;
}

/**
 * Check if a coordinate is within a given distance of another coordinate
 * 
 * @param lat1 Latitude of the center point
 * @param lng1 Longitude of the center point
 * @param lat2 Latitude of the point to check
 * @param lng2 Longitude of the point to check
 * @param maxDistanceKm Maximum distance in kilometers
 * @returns Boolean indicating if the second point is within the specified distance
 */
export function isWithinDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number, 
  maxDistanceKm: number
): boolean {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  return distance <= maxDistanceKm;
}