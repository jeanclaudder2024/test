import { InsertVessel, InsertRefinery } from "@shared/schema";

// Interface for asistream API vessel data
interface AsiStreamVessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  vessel_type: string;
  flag: string;
  built?: number;
  deadweight?: number;
  position: {
    lat: number;
    lng: number;
  };
  departure: {
    port: string;
    date: string;
  };
  destination: {
    port: string;
    eta: string;
  };
  cargo: {
    type: string;
    capacity: number;
  };
  region: string;
}

// Interface for asistream API refinery data
interface AsiStreamRefinery {
  id: string;
  name: string;
  country: string;
  region: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  status: string;
}

/**
 * Service for interacting with the asistream API
 */
export const asiStreamService = {
  /**
   * Fetch vessel data from asistream API
   */
  fetchVessels: async (): Promise<InsertVessel[]> => {
    try {
      // In a real implementation, this would make an API call to asistream
      // const response = await fetch('https://api.asistream.com/vessels', {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.ASISTREAM_API_KEY}`
      //   }
      // });
      // const data = await response.json();
      
      // For development, return mock data that resembles asistream API format
      const mockApiData: AsiStreamVessel[] = [
        {
          id: "V00124",
          name: "Aquitania Voyager",
          imo: "9732852",
          mmsi: "538005831",
          vessel_type: "Crude Oil Tanker",
          flag: "Marshall Islands",
          built: 2016,
          deadweight: 299999,
          position: {
            lat: 36.1344,
            lng: 5.4548
          },
          departure: {
            port: "Ras Tanura, Saudi Arabia",
            date: "2023-03-15T00:00:00Z"
          },
          destination: {
            port: "Houston, USA",
            eta: "2023-03-29T00:00:00Z"
          },
          cargo: {
            type: "Crude Oil - Arabian Heavy",
            capacity: 2000000
          },
          region: "Europe"
        },
        {
          id: "V00125",
          name: "Nordic Freedom",
          imo: "9256602",
          mmsi: "563119000",
          vessel_type: "Crude Oil Tanker",
          flag: "Singapore",
          built: 2005,
          deadweight: 159000,
          position: {
            lat: 28.3621,
            lng: -89.4287
          },
          departure: {
            port: "Corpus Christi, USA",
            date: "2023-03-10T00:00:00Z"
          },
          destination: {
            port: "Rotterdam, Netherlands",
            eta: "2023-03-25T00:00:00Z"
          },
          cargo: {
            type: "Crude Oil - WTI",
            capacity: 1000000
          },
          region: "North America"
        }
      ];
      
      // Transform the API data to our application format
      return mockApiData.map(vessel => ({
        name: vessel.name,
        imo: vessel.imo,
        mmsi: vessel.mmsi,
        vesselType: vessel.vessel_type,
        flag: vessel.flag,
        built: vessel.built,
        deadweight: vessel.deadweight,
        currentLat: vessel.position.lat.toString(),
        currentLng: vessel.position.lng.toString(),
        departurePort: vessel.departure.port,
        departureDate: new Date(vessel.departure.date),
        destinationPort: vessel.destination.port,
        eta: new Date(vessel.destination.eta),
        cargoType: vessel.cargo.type,
        cargoCapacity: vessel.cargo.capacity,
        currentRegion: vessel.region
      }));
    } catch (error) {
      console.error("Error fetching vessels from asistream API:", error);
      throw new Error("Failed to fetch vessel data from asistream API");
    }
  },
  
  /**
   * Fetch refinery data from asistream API
   */
  fetchRefineries: async (): Promise<InsertRefinery[]> => {
    try {
      // In a real implementation, this would make an API call to asistream
      // const response = await fetch('https://api.asistream.com/refineries', {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.ASISTREAM_API_KEY}`
      //   }
      // });
      // const data = await response.json();
      
      // For development, return mock data that resembles asistream API format
      const mockApiData: AsiStreamRefinery[] = [
        {
          id: "R0012",
          name: "Jamnagar Refinery",
          country: "India",
          region: "Asia",
          location: {
            lat: 22.346,
            lng: 69.083
          },
          capacity: 1240000,
          status: "active"
        },
        {
          id: "R0013",
          name: "Galveston Bay Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.378,
            lng: -94.907
          },
          capacity: 585000,
          status: "active"
        },
        {
          id: "R0014",
          name: "Port Arthur Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.896,
            lng: -93.962
          },
          capacity: 635000,
          status: "maintenance"
        }
      ];
      
      // Transform the API data to our application format
      return mockApiData.map(refinery => ({
        name: refinery.name,
        country: refinery.country,
        region: refinery.region,
        lat: refinery.location.lat.toString(),
        lng: refinery.location.lng.toString(),
        capacity: refinery.capacity,
        status: refinery.status
      }));
    } catch (error) {
      console.error("Error fetching refineries from asistream API:", error);
      throw new Error("Failed to fetch refinery data from asistream API");
    }
  }
};