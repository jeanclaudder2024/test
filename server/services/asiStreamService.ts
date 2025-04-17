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
      
      // Generate a much larger dataset of vessels (around 1500)
      const generateManyVessels = (baseCount: number): AsiStreamVessel[] => {
        // Base template vessel data to multiply
        const templateVessels: AsiStreamVessel[] = [
        // Additional vessels - LNG Carriers
        {
          id: "V00234",
          name: "Arctic Aurora",
          imo: "9649016",
          mmsi: "236488000",
          vessel_type: "LNG Carrier",
          flag: "Norway",
          built: 2013,
          deadweight: 84800,
          position: {
            lat: 53.8647,
            lng: -0.4431
          },
          departure: {
            port: "Hammerfest, Norway",
            date: "2023-03-12T14:30:00Z"
          },
          destination: {
            port: "Tokyo, Japan",
            eta: "2023-04-05T08:00:00Z"
          },
          cargo: {
            type: "LNG",
            capacity: 155000
          },
          region: "Europe"
        },
        {
          id: "V00235",
          name: "BW Paris",
          imo: "9354572",
          mmsi: "563085000",
          vessel_type: "LNG Carrier",
          flag: "Singapore",
          built: 2009,
          deadweight: 76624,
          position: {
            lat: 28.8389,
            lng: -89.4287
          },
          departure: {
            port: "Sabine Pass, USA",
            date: "2023-03-15T09:45:00Z"
          },
          destination: {
            port: "Zeebrugge, Belgium",
            eta: "2023-03-28T16:00:00Z"
          },
          cargo: {
            type: "LNG",
            capacity: 160000
          },
          region: "North America"
        },
        {
          id: "V00236",
          name: "Gaslog Wales",
          imo: "9732163",
          mmsi: "256970000",
          vessel_type: "LNG Carrier",
          flag: "Malta",
          built: 2020,
          deadweight: 83500,
          position: {
            lat: 22.5431,
            lng: 120.3542
          },
          departure: {
            port: "Darwin, Australia",
            date: "2023-03-18T16:30:00Z"
          },
          destination: {
            port: "Shanghai, China",
            eta: "2023-03-30T10:15:00Z"
          },
          cargo: {
            type: "LNG",
            capacity: 174000
          },
          region: "Asia"
        },
        
        // Additional vessels - Chemical Tankers
        {
          id: "V00237",
          name: "Stolt Commitment",
          imo: "9368479",
          mmsi: "249847000",
          vessel_type: "Chemical Tanker",
          flag: "Liberia",
          built: 2008,
          deadweight: 37500,
          position: {
            lat: 51.3542,
            lng: 3.0201
          },
          departure: {
            port: "Antwerp, Belgium",
            date: "2023-03-19T08:15:00Z"
          },
          destination: {
            port: "New York, USA",
            eta: "2023-03-29T14:00:00Z"
          },
          cargo: {
            type: "Chemical Products - Glycols",
            capacity: 42000
          },
          region: "Europe"
        },
        {
          id: "V00238",
          name: "Chembulk Barcelona",
          imo: "9290762",
          mmsi: "538006213",
          vessel_type: "Chemical Tanker",
          flag: "Marshall Islands",
          built: 2005,
          deadweight: 33700,
          position: {
            lat: 35.0657,
            lng: 136.2215
          },
          departure: {
            port: "Busan, South Korea",
            date: "2023-03-16T10:45:00Z"
          },
          destination: {
            port: "Nagoya, Japan",
            eta: "2023-03-20T13:30:00Z"
          },
          cargo: {
            type: "Chemical Products - Phenol",
            capacity: 38000
          },
          region: "Asia"
        },
        
        // Additional vessels - Container Ships
        {
          id: "V00239",
          name: "Ever Given",
          imo: "9811000",
          mmsi: "353136000",
          vessel_type: "Container Ship",
          flag: "Panama",
          built: 2018,
          deadweight: 199000,
          position: {
            lat: 30.0328,
            lng: 32.5498
          },
          departure: {
            port: "Singapore",
            date: "2023-03-10T11:00:00Z"
          },
          destination: {
            port: "Rotterdam, Netherlands",
            eta: "2023-04-01T08:30:00Z"
          },
          cargo: {
            type: "Containerized Goods",
            capacity: 20000 // TEUs
          },
          region: "MEA"
        },
        {
          id: "V00240",
          name: "MSC Gülsün",
          imo: "9839430",
          mmsi: "372003000",
          vessel_type: "Container Ship",
          flag: "Panama",
          built: 2019,
          deadweight: 224300,
          position: {
            lat: 22.3293,
            lng: 114.1607
          },
          departure: {
            port: "Hong Kong",
            date: "2023-03-17T15:30:00Z"
          },
          destination: {
            port: "Long Beach, USA",
            eta: "2023-04-05T09:00:00Z"
          },
          cargo: {
            type: "Containerized Goods",
            capacity: 23756 // TEUs
          },
          region: "Asia"
        },
        
        // Additional vessels - Cargo Ships
        {
          id: "V00241",
          name: "Capesize Bulk",
          imo: "9459242",
          mmsi: "636005193",
          vessel_type: "Cargo Ship",
          flag: "Marshall Islands",
          built: 2010,
          deadweight: 180000,
          position: {
            lat: -32.9266,
            lng: 151.7817
          },
          departure: {
            port: "Newcastle, Australia",
            date: "2023-03-18T09:30:00Z"
          },
          destination: {
            port: "Qingdao, China",
            eta: "2023-04-03T14:00:00Z"
          },
          cargo: {
            type: "Iron Ore",
            capacity: 170000
          },
          region: "Asia"
        },
        {
          id: "V00242",
          name: "Atlantic Eagle",
          imo: "9262895",
          mmsi: "538002883",
          vessel_type: "Cargo Ship",
          flag: "Marshall Islands",
          built: 2003,
          deadweight: 75500,
          position: {
            lat: -22.8903,
            lng: -43.1957
          },
          departure: {
            port: "Santos, Brazil",
            date: "2023-03-15T12:45:00Z"
          },
          destination: {
            port: "Amsterdam, Netherlands",
            eta: "2023-03-31T16:30:00Z"
          },
          cargo: {
            type: "Soybeans",
            capacity: 72000
          },
          region: "Africa"
        },
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
      
        // Generate a large number of vessels based on templates
        const vessels: AsiStreamVessel[] = [];
        
        // Add the original template vessels first
        vessels.push(...templateVessels);
        
        // Names for generated vessels
        const prefixes = ["Pacific", "Atlantic", "Oceanic", "Global", "Star", "Royal", "Nordic", "Eastern", "Western", "Southern", "Northern"];
        const suffixes = ["Pride", "Explorer", "Pioneer", "Voyager", "Commander", "Mariner", "Navigator", "Carrier", "Trader", "Champion", "Express"];
        
        // Vessel types
        const vesselTypes = [
          "Crude Oil Tanker", "Product Tanker", "LNG Carrier", "Chemical Tanker", 
          "Container Ship", "Cargo Ship", "VLCC", "Oil/Chemical Tanker"
        ];
        
        // Country flags
        const flags = [
          "Panama", "Liberia", "Marshall Islands", "Singapore", "Hong Kong", "Malta", 
          "Bahamas", "Greece", "Japan", "Cyprus", "Norway", "UK", "Denmark"
        ];
        
        // Regions
        const regions = ["North America", "Europe", "Asia", "MEA", "Africa", "Russia"];
        
        // Ports by region
        const portsByRegion = {
          "North America": ["Houston, USA", "New York, USA", "Long Beach, USA", "Vancouver, Canada", "Corpus Christi, USA"],
          "Europe": ["Rotterdam, Netherlands", "Antwerp, Belgium", "Hamburg, Germany", "Marseille, France", "Barcelona, Spain"],
          "Asia": ["Singapore", "Shanghai, China", "Tokyo, Japan", "Busan, South Korea", "Hong Kong"],
          "MEA": ["Dubai, UAE", "Jebel Ali, UAE", "Ras Tanura, Saudi Arabia", "Fujairah, UAE", "Bandar Abbas, Iran"],
          "Africa": ["Lagos, Nigeria", "Durban, South Africa", "Port Said, Egypt", "Mombasa, Kenya", "Tangier, Morocco"],
          "Russia": ["Novorossiysk, Russia", "St. Petersburg, Russia", "Vladivostok, Russia", "Primorsk, Russia", "Murmansk, Russia"]
        };
        
        // Cargo types by vessel type
        const cargoTypesByVesselType = {
          "Crude Oil Tanker": ["Crude Oil - Arabian Light", "Crude Oil - Brent", "Crude Oil - WTI", "Crude Oil - Dubai", "Crude Oil - Urals"],
          "Product Tanker": ["Gasoline", "Diesel", "Jet Fuel", "Naphtha", "Kerosene"],
          "LNG Carrier": ["LNG", "Liquefied Natural Gas", "Natural Gas"],
          "Chemical Tanker": ["Chemical Products - Phenol", "Chemical Products - Glycols", "Chemical Products - Methanol"],
          "Container Ship": ["Containerized Goods"],
          "Cargo Ship": ["Iron Ore", "Coal", "Soybeans", "Grain", "Bauxite"],
          "VLCC": ["Crude Oil - Arabian Heavy", "Crude Oil - Basrah Heavy", "Crude Oil - Tapis"],
          "Oil/Chemical Tanker": ["Chemical Products", "Refined Products", "Mixed Cargo"]
        };
        
        // Generate the additional vessels
        for (let i = 0; i < baseCount; i++) {
          // Create variations of the template vessels
          const template = templateVessels[i % templateVessels.length];
          const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
          const region = regions[Math.floor(Math.random() * regions.length)];
          const flag = flags[Math.floor(Math.random() * flags.length)];
          
          // Generate name
          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
          const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
          const name = `${prefix} ${suffix}`;
          
          // Generate random position within the region's general area
          // This is a simplified approach - in reality, you'd want more precise coordinates
          const latOffset = Math.random() * 20 - 10; // -10 to +10
          const lngOffset = Math.random() * 20 - 10; // -10 to +10
          const baseLat = template.position.lat;
          const baseLng = template.position.lng;
          const lat = Math.max(-85, Math.min(85, baseLat + latOffset));
          const lng = Math.max(-180, Math.min(180, baseLng + lngOffset));
          
          // Select ports for this region
          const regionPorts = portsByRegion[region] || portsByRegion["North America"];
          const departurePort = regionPorts[Math.floor(Math.random() * regionPorts.length)];
          const destinationPort = regionPorts[Math.floor(Math.random() * regionPorts.length)];
          
          // Generate random dates
          const now = new Date();
          const pastOffset = Math.floor(Math.random() * 20); // 0-20 days ago
          const futureOffset = Math.floor(Math.random() * 30) + 5; // 5-35 days in future
          
          const departureDate = new Date(now);
          departureDate.setDate(departureDate.getDate() - pastOffset);
          
          const etaDate = new Date(now);
          etaDate.setDate(etaDate.getDate() + futureOffset);
          
          // Select cargo type based on vessel type
          const cargoTypes = cargoTypesByVesselType[vesselType] || ["General Cargo"];
          const cargoType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
          
          // Generate capacity based on vessel type
          let capacity;
          switch (vesselType) {
            case "Crude Oil Tanker":
              capacity = Math.floor(Math.random() * 1500000) + 500000;
              break;
            case "VLCC":
              capacity = Math.floor(Math.random() * 1000000) + 1500000;
              break;
            case "LNG Carrier":
              capacity = Math.floor(Math.random() * 100000) + 100000;
              break;
            case "Container Ship":
              capacity = Math.floor(Math.random() * 15000) + 5000;
              break;
            default:
              capacity = Math.floor(Math.random() * 500000) + 50000;
          }
          
          // Generate unique ID, IMO and MMSI
          const id = `V${(1000000 + i).toString().substring(1)}`;
          const imoNum = Math.floor(Math.random() * 1000000) + 9000000;
          const mmsiNum = Math.floor(Math.random() * 900000000) + 100000000;
          
          // Generate built year
          const builtYear = Math.floor(Math.random() * 23) + 2000; // 2000-2023
          
          // Generate deadweight based on vessel type
          let deadweight;
          switch (vesselType) {
            case "Crude Oil Tanker":
            case "VLCC":
              deadweight = Math.floor(Math.random() * 150000) + 150000;
              break;
            case "Container Ship":
              deadweight = Math.floor(Math.random() * 100000) + 100000;
              break;
            default:
              deadweight = Math.floor(Math.random() * 100000) + 30000;
          }
          
          // Create vessel object
          vessels.push({
            id,
            name,
            imo: imoNum.toString(),
            mmsi: mmsiNum.toString(),
            vessel_type: vesselType,
            flag,
            built: builtYear,
            deadweight,
            position: {
              lat,
              lng
            },
            departure: {
              port: departurePort,
              date: departureDate.toISOString()
            },
            destination: {
              port: destinationPort,
              eta: etaDate.toISOString()
            },
            cargo: {
              type: cargoType,
              capacity
            },
            region
          });
        }
        
        return vessels;
      };
      
      // Generate large vessel dataset - around 1500 vessels
      const mockApiData = generateManyVessels(1500);
      
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
        // Added more refineries from the document
        
        // Russia
        {
          id: "R0101",
          name: "Omsk Refinery",
          country: "Russia",
          region: "Russia",
          location: {
            lat: 54.9924,
            lng: 73.3686
          },
          capacity: 486000,
          status: "operational"
        },
        {
          id: "R0102",
          name: "Gazprom Neft Moscow",
          country: "Russia",
          region: "Russia",
          location: {
            lat: 55.7558,
            lng: 37.6173
          },
          capacity: 360000,
          status: "operational"
        },
        {
          id: "R0103",
          name: "Ryazan Refinery",
          country: "Russia",
          region: "Russia",
          location: {
            lat: 54.6092,
            lng: 39.7145
          },
          capacity: 340000,
          status: "maintenance"
        },
        {
          id: "R0104",
          name: "Volgograd Refinery",
          country: "Russia",
          region: "Russia",
          location: {
            lat: 48.7080,
            lng: 44.5133
          },
          capacity: 290000,
          status: "operational"
        },
        
        // Additional European refineries
        {
          id: "R0105",
          name: "Schwedt Refinery",
          country: "Germany",
          region: "Europe",
          location: {
            lat: 53.0615,
            lng: 14.2815
          },
          capacity: 240000,
          status: "operational"
        },
        {
          id: "R0106",
          name: "Hellenic Petroleum",
          country: "Greece",
          region: "Europe",
          location: {
            lat: 37.9838,
            lng: 23.7275
          },
          capacity: 150000,
          status: "operational"
        },
        {
          id: "R0107",
          name: "Milazzo Refinery",
          country: "Italy",
          region: "Europe",
          location: {
            lat: 38.2173,
            lng: 15.2420
          },
          capacity: 240000,
          status: "operational"
        },
        {
          id: "R0108",
          name: "ISAB Refinery",
          country: "Italy",
          region: "Europe",
          location: {
            lat: 37.0333,
            lng: 15.2833
          },
          capacity: 320000,
          status: "maintenance"
        },
        
        // Additional Asian refineries
        {
          id: "R0109",
          name: "SK Energy Ulsan",
          country: "South Korea",
          region: "Asia",
          location: {
            lat: 35.5384,
            lng: 129.3114
          },
          capacity: 840000,
          status: "operational"
        },
        {
          id: "R0110",
          name: "Daqing Refining",
          country: "China",
          region: "Asia",
          location: {
            lat: 46.5830,
            lng: 125.1004
          },
          capacity: 410000,
          status: "operational"
        },
        {
          id: "R0111",
          name: "Zhenhai Refinery",
          country: "China",
          region: "Asia",
          location: {
            lat: 29.9490,
            lng: 121.7178
          },
          capacity: 460000,
          status: "operational"
        },
        {
          id: "R0112",
          name: "Negishi Refinery",
          country: "Japan",
          region: "Asia",
          location: {
            lat: 35.4532,
            lng: 139.6372
          },
          capacity: 270000,
          status: "maintenance"
        },
        
        // Additional American refineries
        {
          id: "R0113",
          name: "Whiting Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 41.6590,
            lng: -87.4794
          },
          capacity: 430000,
          status: "operational"
        },
        {
          id: "R0114",
          name: "Baton Rouge Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 30.5102,
            lng: -91.1839
          },
          capacity: 502000,
          status: "operational"
        },
        {
          id: "R0115",
          name: "Deer Park Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 29.7051,
            lng: -95.1271
          },
          capacity: 340000,
          status: "operational"
        },
        {
          id: "R0116",
          name: "Pascagoula Refinery",
          country: "United States",
          region: "North America",
          location: {
            lat: 30.3658,
            lng: -88.5561
          },
          capacity: 330000,
          status: "maintenance"
        },

        // African refineries
        {
          id: "R0117",
          name: "Zawia Refinery",
          country: "Libya",
          region: "Africa",
          location: {
            lat: 32.7647,
            lng: 12.7330
          },
          capacity: 120000,
          status: "offline"
        },
        {
          id: "R0118",
          name: "Algiers Refinery",
          country: "Algeria",
          region: "Africa",
          location: {
            lat: 36.7539,
            lng: 3.0589
          },
          capacity: 60000,
          status: "operational"
        },
        {
          id: "R0119",
          name: "Port Harcourt Refinery",
          country: "Nigeria",
          region: "Africa",
          location: {
            lat: 4.7776,
            lng: 7.0984
          },
          capacity: 210000,
          status: "maintenance"
        },
        {
          id: "R0120",
          name: "Cape Town Refinery",
          country: "South Africa",
          region: "Africa",
          location: {
            lat: -33.9258,
            lng: 18.4232
          },
          capacity: 100000,
          status: "operational"
        },
        
        // MEA additional refineries
        {
          id: "R0121",
          name: "Yanbu Aramco Sinopec",
          country: "Saudi Arabia",
          region: "MEA",
          location: {
            lat: 24.0283,
            lng: 38.1088
          },
          capacity: 400000,
          status: "operational"
        },
        {
          id: "R0122",
          name: "Rabigh Refinery",
          country: "Saudi Arabia",
          region: "MEA",
          location: {
            lat: 22.7372,
            lng: 39.0326
          },
          capacity: 400000,
          status: "operational"
        },
        {
          id: "R0123",
          name: "Abadan Refinery",
          country: "Iran",
          region: "MEA",
          location: {
            lat: 30.3600,
            lng: 48.2900
          },
          capacity: 400000,
          status: "operational"
        },
        {
          id: "R0124",
          name: "Isfahan Refinery",
          country: "Iran",
          region: "MEA",
          location: {
            lat: 32.6546,
            lng: 51.6680
          },
          capacity: 375000,
          status: "maintenance"
        },
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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
          status: "operational"
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