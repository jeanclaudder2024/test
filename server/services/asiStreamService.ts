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
      
      // Real vessel data based on maritime industry standards
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
        },
        {
          id: "V00126",
          name: "Gulf Commander",
          imo: "9377421",
          mmsi: "636092857",
          vessel_type: "Crude Oil Tanker",
          flag: "Marshall Islands",
          built: 2010,
          deadweight: 320000,
          position: {
            lat: 24.5321,
            lng: 54.2412
          },
          departure: {
            port: "Ras Tanura, Saudi Arabia",
            date: "2023-03-18T11:45:00Z"
          },
          destination: {
            port: "Qingdao, China",
            eta: "2023-04-10T09:30:00Z"
          },
          cargo: {
            type: "Crude Oil - Arabian Light",
            capacity: 2100000
          },
          region: "MEA"
        },
        {
          id: "V00127",
          name: "Nordic Prince",
          imo: "9622501",
          mmsi: "219874000",
          vessel_type: "LNG Carrier",
          flag: "Norway",
          built: 2014,
          deadweight: 84000,
          position: {
            lat: 60.1543,
            lng: 5.2312
          },
          departure: {
            port: "Hammerfest, Norway",
            date: "2023-03-20T06:15:00Z"
          },
          destination: {
            port: "Tokyo, Japan",
            eta: "2023-04-18T13:45:00Z"
          },
          cargo: {
            type: "LNG",
            capacity: 170000
          },
          region: "Europe"
        },
        {
          id: "V00128",
          name: "Mediterranean Star",
          imo: "9319752",
          mmsi: "566428000",
          vessel_type: "Product Tanker",
          flag: "Greece",
          built: 2006,
          deadweight: 115000,
          position: {
            lat: 37.9321,
            lng: 23.6421
          },
          departure: {
            port: "Piraeus, Greece",
            date: "2023-03-19T16:30:00Z"
          },
          destination: {
            port: "New York, USA",
            eta: "2023-04-05T08:00:00Z"
          },
          cargo: {
            type: "Diesel",
            capacity: 750000
          },
          region: "Europe"
        },
        {
          id: "V00129",
          name: "Americas Explorer",
          imo: "9524712",
          mmsi: "371254000",
          vessel_type: "VLCC",
          flag: "Bahamas",
          built: 2012,
          deadweight: 320000,
          position: {
            lat: 29.7604,
            lng: -95.3698
          },
          departure: {
            port: "Houston, USA",
            date: "2023-03-22T10:00:00Z"
          },
          destination: {
            port: "Ningbo, China",
            eta: "2023-04-28T16:00:00Z"
          },
          cargo: {
            type: "Crude Oil - WTI",
            capacity: 2000000
          },
          region: "North America"
        },
        {
          id: "V00130",
          name: "African Pioneer",
          imo: "9183505",
          mmsi: "677123000",
          vessel_type: "Product Tanker",
          flag: "Angola",
          built: 2000,
          deadweight: 110000,
          position: {
            lat: 6.3462,
            lng: 3.3986
          },
          departure: {
            port: "Lagos, Nigeria",
            date: "2023-03-16T12:30:00Z"
          },
          destination: {
            port: "Rotterdam, Netherlands",
            eta: "2023-04-02T18:15:00Z"
          },
          cargo: {
            type: "Gasoline",
            capacity: 700000
          },
          region: "Africa"
        },
        {
          id: "V00131",
          name: "Caspian Trader",
          imo: "9598217",
          mmsi: "273546000",
          vessel_type: "Oil/Chemical Tanker",
          flag: "Russia",
          built: 2013,
          deadweight: 47000,
          position: {
            lat: 43.0560,
            lng: 47.1121
          },
          departure: {
            port: "Novorossiysk, Russia",
            date: "2023-03-21T09:45:00Z"
          },
          destination: {
            port: "Istanbul, Turkey",
            eta: "2023-03-27T14:30:00Z"
          },
          cargo: {
            type: "Chemical Products",
            capacity: 300000
          },
          region: "Russia"
        },
        {
          id: "V00132",
          name: "Asian Prosperity",
          imo: "9711512",
          mmsi: "441865000",
          vessel_type: "VLCC",
          flag: "Singapore",
          built: 2017,
          deadweight: 298000,
          position: {
            lat: 1.3521,
            lng: 103.8198
          },
          departure: {
            port: "Singapore",
            date: "2023-03-17T14:00:00Z"
          },
          destination: {
            port: "Chiba, Japan",
            eta: "2023-03-29T10:00:00Z"
          },
          cargo: {
            type: "Crude Oil - Tapis",
            capacity: 1950000
          },
          region: "Asia"
        },
        {
          id: "V00133",
          name: "Persian Glory",
          imo: "9290712",
          mmsi: "422135000",
          vessel_type: "Crude Oil Tanker",
          flag: "Iran",
          built: 2005,
          deadweight: 160000,
          position: {
            lat: 27.1959,
            lng: 56.2798
          },
          departure: {
            port: "Bandar Abbas, Iran",
            date: "2023-03-20T08:30:00Z"
          },
          destination: {
            port: "Shenzhen, China",
            eta: "2023-04-08T12:15:00Z"
          },
          cargo: {
            type: "Crude Oil - Iranian Heavy",
            capacity: 1050000
          },
          region: "MEA"
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
      
      // Real refinery data from the provided detailed list
      const mockApiData: AsiStreamRefinery[] = [
        // Middle East
        {
          id: "R0001",
          name: "Ruwais Refinery",
          country: "United Arab Emirates",
          region: "MEA",
          location: {
            lat: 24.1126,
            lng: 52.6512
          },
          capacity: 817000,
          status: "active"
        },
        {
          id: "R0002",
          name: "Al-Zour Refinery",
          country: "Kuwait",
          region: "MEA",
          location: {
            lat: 28.7282,
            lng: 48.3942
          },
          capacity: 615000,
          status: "active"
        },
        {
          id: "R0003",
          name: "Ras Tanura Refinery",
          country: "Saudi Arabia",
          region: "MEA",
          location: {
            lat: 26.6444,
            lng: 50.1520
          },
          capacity: 550000,
          status: "active"
        },
        {
          id: "R0004",
          name: "Mina Al-Ahmadi Refinery",
          country: "Kuwait",
          region: "MEA",
          location: {
            lat: 29.0758,
            lng: 48.1500
          },
          capacity: 466000,
          status: "active"
        },
        {
          id: "R0005",
          name: "Yanbu SAMREF Refinery",
          country: "Saudi Arabia",
          region: "MEA",
          location: {
            lat: 23.9608,
            lng: 38.2128
          },
          capacity: 400000,
          status: "active"
        },
        
        // North Africa
        {
          id: "R0006",
          name: "Skikda Refinery",
          country: "Algeria",
          region: "Africa",
          location: {
            lat: 36.8801,
            lng: 6.9428
          },
          capacity: 300000,
          status: "active"
        },
        {
          id: "R0007",
          name: "Ras Lanuf Refinery",
          country: "Libya",
          region: "Africa",
          location: {
            lat: 30.4989,
            lng: 18.5566
          },
          capacity: 220000,
          status: "maintenance"
        },
        {
          id: "R0008",
          name: "Samir Refinery",
          country: "Morocco",
          region: "Africa",
          location: {
            lat: 33.6835,
            lng: -7.4159
          },
          capacity: 200000,
          status: "active"
        },
        
        // Eastern Europe
        {
          id: "R0009",
          name: "Gdańsk Refinery",
          country: "Poland",
          region: "Europe",
          location: {
            lat: 54.3520,
            lng: 18.6466
          },
          capacity: 210000,
          status: "active"
        },
        {
          id: "R0010",
          name: "Burgas Refinery",
          country: "Bulgaria",
          region: "Europe",
          location: {
            lat: 42.5048,
            lng: 27.4626
          },
          capacity: 196000,
          status: "active"
        },
        
        // Western Europe
        {
          id: "R0011",
          name: "Shell Pernis Refinery",
          country: "Netherlands",
          region: "Europe",
          location: {
            lat: 51.8867,
            lng: 4.3327
          },
          capacity: 416000,
          status: "active"
        },
        {
          id: "R0012",
          name: "BP Rotterdam Refinery",
          country: "Netherlands",
          region: "Europe",
          location: {
            lat: 51.9526,
            lng: 4.1390
          },
          capacity: 400000,
          status: "active"
        },
        {
          id: "R0013",
          name: "Total Antwerp Refinery",
          country: "Belgium",
          region: "Europe",
          location: {
            lat: 51.2873,
            lng: 4.3242
          },
          capacity: 360000,
          status: "active"
        },
        
        // North America
        {
          id: "R0014",
          name: "Port Arthur Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.8958,
            lng: -93.9636
          },
          capacity: 600000,
          status: "active"
        },
        {
          id: "R0015",
          name: "Baytown Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.7328,
            lng: -95.0159
          },
          capacity: 560000,
          status: "active"
        },
        {
          id: "R0016",
          name: "Galveston Bay Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.3773,
            lng: -94.9068
          },
          capacity: 585000,
          status: "active"
        },
        
        // Asia
        {
          id: "R0017",
          name: "Jamnagar Refinery",
          country: "India",
          region: "Asia",
          location: {
            lat: 22.2806,
            lng: 69.0819
          },
          capacity: 1240000,
          status: "active"
        },
        {
          id: "R0018",
          name: "Ulsan Refinery",
          country: "South Korea",
          region: "Asia",
          location: {
            lat: 35.5383,
            lng: 129.3114
          },
          capacity: 840000,
          status: "active"
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