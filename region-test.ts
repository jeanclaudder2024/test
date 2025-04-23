// Test script for region classification

/**
 * Determines the region ID from a set of latitude and longitude coordinates
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns Region ID
 */
export function determineRegionFromCoordinates(lat: number, lng: number): string {
  // Special cases for specific countries that need precise classification
  
  // Poland (Eastern Europe)
  if (lat >= 49 && lat <= 55 && lng >= 14 && lng <= 24) {
    return "eastern-europe";
  }
  
  // Korea (Southeast Asia & Oceania)
  if (lat >= 33 && lat <= 43 && lng >= 124 && lng <= 132) {
    return "southeast-asia-oceania";
  }
  
  // Istanbul/Turkey area (special case on the border of Europe and Middle East)
  if (lat >= 36 && lat <= 42 && lng >= 26 && lng <= 45) {
    return "eastern-europe";
  }
  
  // Check for Russia (since it's large and spans multiple regions)
  // Russia - European and Asian parts
  if (
    (lat >= 50 && lat <= 90 && lng >= 27 && lng < 180) || // Main Russia (northern parts)
    (lat >= 41 && lat <= 90 && lng >= 37 && lng < 180)    // Eastern parts
  ) {
    return "russia";
  }
  
  // North America: Mostly United States and Canada
  if (lat >= 25 && lat <= 90 && lng >= -170 && lng <= -50) {
    return "north-america";
  }
  
  // Central America: Mexico, Caribbean, and Central American countries
  if (lat >= 7 && lat < 25 && lng >= -120 && lng <= -60) {
    return "central-america";
  }
  
  // South America
  if (lat >= -60 && lat < 15 && lng >= -90 && lng <= -30) {
    return "south-america";
  }
  
  // Western Europe
  if (lat >= 35 && lat <= 75 && lng >= -15 && lng < 15) {
    return "western-europe";
  }
  
  // Eastern Europe
  if (lat >= 35 && lat <= 75 && lng >= 15 && lng < 30) {
    return "eastern-europe";
  }
  
  // Middle East - expanded to include more of the Arabian Peninsula
  if (
    (lat >= 15 && lat < 42 && lng >= 30 && lng < 65) || // Main Middle East
    (lat >= 23 && lat < 33 && lng >= 43 && lng < 60)    // Saudi Arabia and surroundings
  ) {
    return "middle-east";
  }
  
  // North Africa
  if (lat >= 15 && lat < 35 && lng >= -20 && lng < 30) {
    return "north-africa";
  }
  
  // Southern Africa
  if (lat >= -40 && lat < 15 && lng >= -20 && lng < 55) {
    return "southern-africa";
  }
  
  // China
  if (lat >= 18 && lat < 45 && lng >= 75 && lng < 125) {
    return "china";
  }
  
  // Asia & Pacific (Indian subcontinent and surrounding areas)
  if (lat >= 5 && lat < 35 && lng >= 65 && lng < 95) {
    return "asia-pacific";
  }
  
  // Japan should be in Southeast Asia & Oceania
  if (lat >= 30 && lat < 46 && lng >= 129 && lng < 150) {
    return "southeast-asia-oceania";
  }
  
  // Southeast Asia & Oceania (includes Australia, Japan, Korea)
  if (lat >= -50 && lat < 30 && lng >= 95 && lng < 180) {
    return "southeast-asia-oceania";
  }
  
  // Default to a region based on hemisphere if no specific match
  if (lat >= 0) {
    return lng >= 0 ? "asia-pacific" : "north-america";
  } else {
    return lng >= 0 ? "southern-africa" : "south-america";
  }
}

// Test cases - key locations from around the world
const testCoordinates = [
  { description: "New York, USA", lat: 40.7128, lng: -74.0060 },
  { description: "Los Angeles, USA", lat: 34.0522, lng: -118.2437 },
  { description: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332 },
  { description: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729 },
  { description: "London, UK", lat: 51.5074, lng: -0.1278 },
  { description: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { description: "Berlin, Germany", lat: 52.5200, lng: 13.4050 },
  { description: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
  { description: "Cairo, Egypt", lat: 30.0444, lng: 31.2357 },
  { description: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 },
  { description: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
  { description: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
  { description: "Mumbai, India", lat: 19.0760, lng: 72.8777 },
  { description: "Beijing, China", lat: 39.9042, lng: 116.4074 },
  { description: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { description: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { description: "Singapore", lat: 1.3521, lng: 103.8198 },
  { description: "Anchorage, Alaska", lat: 61.2181, lng: -149.9003 },
  { description: "Panama City, Panama", lat: 8.9833, lng: -79.5167 },
  { description: "Santiago, Chile", lat: -33.4489, lng: -70.6693 },
  { description: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
  { description: "Warsaw, Poland", lat: 52.2297, lng: 21.0122 },
  { description: "Tehran, Iran", lat: 35.6892, lng: 51.3890 },
  { description: "Nairobi, Kenya", lat: -1.2921, lng: 36.8219 },
  { description: "Houston, USA", lat: 29.7604, lng: -95.3698 },
  { description: "Vancouver, Canada", lat: 49.2827, lng: -123.1207 },
  { description: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
  { description: "Lima, Peru", lat: -12.0464, lng: -77.0428 },
  { description: "Stockholm, Sweden", lat: 59.3293, lng: 18.0686 },
  { description: "Athens, Greece", lat: 37.9838, lng: 23.7275 },
  { description: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784 },
  { description: "Johannesburg, South Africa", lat: -26.2041, lng: 28.0473 },
  { description: "Tel Aviv, Israel", lat: 32.0853, lng: 34.7818 },
  { description: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { description: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
  { description: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456 },
  { description: "Manila, Philippines", lat: 14.5995, lng: 120.9842 },
  { description: "Auckland, New Zealand", lat: -36.8509, lng: 174.7645 },
  { description: "Seoul, South Korea", lat: 37.5665, lng: 126.9780 },
  { description: "Vladivostok, Russia", lat: 43.1332, lng: 131.9113 }
];

// Run tests
console.log("Region Classification Test Results:\n");
console.log("Location | Coordinates | Region\n" + "-".repeat(60));

for (const test of testCoordinates) {
  const region = determineRegionFromCoordinates(test.lat, test.lng);
  console.log(`${test.description.padEnd(20)} | ${test.lat}, ${test.lng} | ${region}`);
}