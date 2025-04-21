import { InsertVessel } from "@shared/schema";
import { REGIONS, OIL_PRODUCT_TYPES } from "@shared/constants";

// Interface for vessel template data
interface VesselTemplate {
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

/**
 * Generate a large dataset of vessels for testing
 * @param count Number of vessels to generate
 * @returns Array of vessel data ready to be inserted
 */
export function generateLargeVesselDataset(count: number = 1500): InsertVessel[] {
  // Template vessels that serve as base models
  const templateVessels: VesselTemplate[] = [
    // LNG Carriers
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
        type: "LNG (Liquefied Natural Gas)",
        capacity: 155000
      },
      region: "Europe"
    },
    // Crude Oil Tanker
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
        type: "EXPORT BLEND CRUDE",
        capacity: 2000000
      },
      region: "Europe"
    },
    // Container Ship
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
        capacity: 20000
      },
      region: "MEA"
    },
    // Chemical Tanker
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
        type: "Base Oils",
        capacity: 42000
      },
      region: "Europe"
    },
    // Cargo Ship
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
        type: "Gasoline (Petrol / Mogas)",
        capacity: 170000
      },
      region: "Asia"
    }
  ];
  
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
  
  // Get region IDs from constants
  const regions = REGIONS.map(r => r.id);
  
  // Ports by region
  const portsByRegion: Record<string, string[]> = {
    "North America": ["Houston, USA", "New York, USA", "Long Beach, USA", "Vancouver, Canada", "Corpus Christi, USA"],
    "Europe": ["Rotterdam, Netherlands", "Antwerp, Belgium", "Hamburg, Germany", "Marseille, France", "Barcelona, Spain"],
    "Asia": ["Singapore", "Shanghai, China", "Tokyo, Japan", "Busan, South Korea", "Hong Kong"],
    "MEA": ["Dubai, UAE", "Jebel Ali, UAE", "Ras Tanura, Saudi Arabia", "Fujairah, UAE", "Bandar Abbas, Iran"],
    "Africa": ["Lagos, Nigeria", "Durban, South Africa", "Port Said, Egypt", "Mombasa, Kenya", "Tangier, Morocco"],
    "Russia": ["Novorossiysk, Russia", "St. Petersburg, Russia", "Vladivostok, Russia", "Primorsk, Russia", "Murmansk, Russia"]
  };
  
  // Cargo types by vessel type
  const cargoTypesByVesselType: Record<string, string[]> = {
    "Crude Oil Tanker": ["Crude Oil - Arabian Light", "Crude Oil - Brent", "Crude Oil - WTI", "Crude Oil - Dubai", "Crude Oil - Urals"],
    "Product Tanker": ["Gasoline", "Diesel", "Jet Fuel", "Naphtha", "Kerosene"],
    "LNG Carrier": ["LNG", "Liquefied Natural Gas", "Natural Gas"],
    "Chemical Tanker": ["Chemical Products - Phenol", "Chemical Products - Glycols", "Chemical Products - Methanol"],
    "Container Ship": ["Containerized Goods"],
    "Cargo Ship": ["Iron Ore", "Coal", "Soybeans", "Grain", "Bauxite"],
    "VLCC": ["Crude Oil - Arabian Heavy", "Crude Oil - Basrah Heavy", "Crude Oil - Tapis"],
    "Oil/Chemical Tanker": ["Chemical Products", "Refined Products", "Mixed Cargo"]
  };
  
  // Generated vessels array
  const vessels: InsertVessel[] = [];
  
  // Add original template vessels first
  templateVessels.forEach(template => {
    vessels.push({
      name: template.name,
      imo: template.imo,
      mmsi: template.mmsi,
      vesselType: template.vessel_type,
      flag: template.flag,
      built: template.built,
      deadweight: template.deadweight,
      currentLat: template.position.lat.toString(),
      currentLng: template.position.lng.toString(),
      departurePort: template.departure.port,
      departureDate: new Date(template.departure.date),
      destinationPort: template.destination.port,
      eta: new Date(template.destination.eta),
      cargoType: template.cargo.type,
      cargoCapacity: template.cargo.capacity,
      currentRegion: template.region
    });
  });
  
  // Generate additional vessels up to the requested count
  for (let i = 0; i < count - templateVessels.length; i++) {
    // Select a template as a base
    const template = templateVessels[i % templateVessels.length];
    
    // Generate vessel properties
    const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const flag = flags[Math.floor(Math.random() * flags.length)];
    
    // Generate name
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${suffix}`;
    
    // Generate random position
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
    
    // Use oil product types from constants instead of vessel-based cargo types
    const oilProductType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
    
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
    
    // Generate IMO and MMSI numbers
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
      name,
      imo: imoNum.toString(),
      mmsi: mmsiNum.toString(),
      vesselType,
      flag,
      built: builtYear,
      deadweight,
      currentLat: lat.toString(),
      currentLng: lng.toString(),
      departurePort,
      departureDate,
      destinationPort,
      eta: etaDate,
      cargoType: oilProductType,
      cargoCapacity: capacity,
      currentRegion: region
    });
  }
  
  return vessels;
}