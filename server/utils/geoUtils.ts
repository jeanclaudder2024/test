/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Convert latitude and longitude from degrees to radians
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLon1 = (lon1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const radLon2 = (lon2 * Math.PI) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in kilometers
  const R = 6371;
  
  // Calculate the distance
  const distance = R * c;
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Find the nearest object from a list based on geographic coordinates
 * @param targetLat Target latitude
 * @param targetLng Target longitude
 * @param objects List of objects that have lat and lng properties
 * @returns The nearest object and its distance
 */
export function findNearest<T extends { lat: number | string; lng: number | string }>(
  targetLat: number,
  targetLng: number,
  objects: T[]
): { object: T; distance: number } | null {
  if (!objects || objects.length === 0) {
    return null;
  }

  let nearestObject = objects[0];
  let nearestDistance = calculateDistance(
    targetLat,
    targetLng,
    typeof nearestObject.lat === 'string' ? parseFloat(nearestObject.lat) : nearestObject.lat,
    typeof nearestObject.lng === 'string' ? parseFloat(nearestObject.lng) : nearestObject.lng
  );

  for (let i = 1; i < objects.length; i++) {
    const object = objects[i];
    const distance = calculateDistance(
      targetLat,
      targetLng,
      typeof object.lat === 'string' ? parseFloat(object.lat) : object.lat,
      typeof object.lng === 'string' ? parseFloat(object.lng) : object.lng
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestObject = object;
    }
  }

  return {
    object: nearestObject,
    distance: nearestDistance
  };
}