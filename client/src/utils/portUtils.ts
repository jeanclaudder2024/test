import { apiRequest } from "@/lib/queryClient";

/**
 * Fetches port coordinates by port name
 * @param portName Name of the port to look up
 * @returns Tuple of [latitude, longitude] or null if not found
 */
export async function getPortCoordinates(portName: string): Promise<[number, number] | null> {
  if (!portName) return null;
  
  try {
    // Call the port search API
    const response = await apiRequest(
      `/api/ports/search?name=${encodeURIComponent(portName)}`
    ) as { id: number; name: string; lat: string; lng: string; }[];
    
    // Check if we got any matches
    if (response && response.length > 0 && response[0].lat && response[0].lng) {
      const port = response[0];
      return [parseFloat(port.lat), parseFloat(port.lng)];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching port coordinates:", error);
    return null;
  }
}

/**
 * Calculates the great-circle distance between two points on Earth
 * @param lat1 Latitude of first point (degrees)
 * @param lng1 Longitude of first point (degrees)
 * @param lat2 Latitude of second point (degrees)
 * @param lng2 Longitude of second point (degrees)
 * @returns Distance in nautical miles
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  // Convert degrees to radians
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  
  const rlat1 = toRadians(lat1);
  const rlng1 = toRadians(lng1);
  const rlat2 = toRadians(lat2);
  const rlng2 = toRadians(lng2);
  
  // Haversine formula for great-circle distance
  const dlat = rlat2 - rlat1;
  const dlng = rlng2 - rlng1;
  
  const a = 
    Math.sin(dlat/2) * Math.sin(dlat/2) +
    Math.cos(rlat1) * Math.cos(rlat2) * 
    Math.sin(dlng/2) * Math.sin(dlng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Radius of Earth in nautical miles
  const R = 3440; // nautical miles
  
  return R * c;
}

/**
 * Calculates the estimated time of arrival based on distance and speed
 * @param distanceNM Distance in nautical miles
 * @param speedKnots Speed in knots
 * @returns ETA in hours
 */
export function calculateETA(distanceNM: number, speedKnots: number): number {
  if (!speedKnots) return 0;
  return distanceNM / speedKnots;
}

/**
 * Formats distance in nautical miles to a readable string
 * @param distance Distance in nautical miles
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return "< 0.1 nm";
  }
  
  if (distance < 10) {
    return `${distance.toFixed(1)} nm`;
  }
  
  return `${Math.round(distance)} nm`;
}