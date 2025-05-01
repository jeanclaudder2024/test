import stationsData from '../data/stations.json';

export interface Station {
  id: string;
  country: string;
  location: string;
  latitude: string;
  longitude: string;
  unix_time: string;
  // Added properties for display purposes
  displayName: string;
  isActive: boolean;
}

/**
 * Fetch all stations from the local JSON data
 * @returns Array of station data with added properties
 */
export function fetchStations(): Station[] {
  // Filter out stations with invalid coordinates (0,0)
  const validStations = stationsData.filter(station => 
    station.latitude !== "0.00" && station.longitude !== "0.00"
  );
  
  // Add display properties to each station
  return validStations.map(station => ({
    ...station,
    displayName: station.location 
      ? `${station.location}, ${station.country.toUpperCase()}` 
      : `Station ${station.id} (${station.country.toUpperCase()})`,
    isActive: isStationActive(station.unix_time)
  }));
}

/**
 * Check if a station is active based on its last update time
 * @param unixTime Unix timestamp string of last update
 * @returns Boolean indicating if the station is active
 */
function isStationActive(unixTime: string): boolean {
  const lastUpdateTime = parseInt(unixTime);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Consider a station active if it was updated in the last week
  const oneWeek = 7 * 24 * 60 * 60; // 7 days in seconds
  return currentTime - lastUpdateTime < oneWeek;
}

/**
 * Get station details by ID
 * @param id Station ID
 * @returns Station object or undefined if not found
 */
export function getStationById(id: string): Station | undefined {
  const station = stationsData.find(station => station.id === id);
  
  if (!station) return undefined;
  
  return {
    ...station,
    displayName: station.location 
      ? `${station.location}, ${station.country.toUpperCase()}` 
      : `Station ${station.id} (${station.country.toUpperCase()})`,
    isActive: isStationActive(station.unix_time)
  };
}

/**
 * Get stations grouped by country
 * @returns Object with country codes as keys and arrays of stations as values
 */
export function getStationsByCountry(): Record<string, Station[]> {
  const stations = fetchStations();
  
  return stations.reduce((acc: Record<string, Station[]>, station) => {
    if (!acc[station.country]) {
      acc[station.country] = [];
    }
    acc[station.country].push(station);
    return acc;
  }, {});
}

export default {
  fetchStations,
  getStationById,
  getStationsByCountry
};