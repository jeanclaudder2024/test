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
  
  // Extended list of vessel types for greater variety
  const vesselTypes = [
    "Crude Oil Tanker",
    "Product Tanker", 
    "LNG Carrier", 
    "Chemical Tanker",
    "Container Ship", 
    "Cargo Ship", 
    "VLCC (Very Large Crude Carrier)",
    "ULCC (Ultra Large Crude Carrier)",
    "Aframax Tanker",
    "Suezmax Tanker",
    "Panamax Tanker",
    "Shuttle Tanker",
    "Bunker Tanker",
    "Bulk Carrier",
    "Oil/Chemical Tanker",
    "LPG Carrier",
    "Asphalt/Bitumen Tanker"
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
  
  // Use standardized OIL_PRODUCT_TYPES from constants.ts
  // Creating a grouping of vessel types to cargo types mapping
  const vesselToOilProductMapping: Record<string, string[]> = {
    "Crude Oil Tanker": OIL_PRODUCT_TYPES.filter(type => type.includes('CRUDE')),
    "Product Tanker": OIL_PRODUCT_TYPES.filter(type => 
      type.includes('GASOLINE') || 
      type.includes('DIESEL') || 
      type.includes('JET FUEL') || 
      type.includes('KEROSENE')
    ),
    "LNG Carrier": OIL_PRODUCT_TYPES.filter(type => 
      type.includes('LNG') || 
      type.includes('GAS')
    ),
    "Chemical Tanker": OIL_PRODUCT_TYPES.filter(type => 
      type.includes('CHEMICAL') || 
      type.includes('METHANOL')
    ),
    "VLCC (Very Large Crude Carrier)": OIL_PRODUCT_TYPES.filter(type => type.includes('CRUDE')),
    "ULCC (Ultra Large Crude Carrier)": OIL_PRODUCT_TYPES.filter(type => type.includes('CRUDE')),
    "Aframax Tanker": [...OIL_PRODUCT_TYPES.filter(type => type.includes('CRUDE')), ...OIL_PRODUCT_TYPES.filter(type => type.includes('FUEL OIL'))],
    "Suezmax Tanker": [...OIL_PRODUCT_TYPES.filter(type => type.includes('CRUDE')), ...OIL_PRODUCT_TYPES.filter(type => type.includes('FUEL OIL'))],
    "Panamax Tanker": OIL_PRODUCT_TYPES.filter(type => 
      type.includes('GASOLINE') || 
      type.includes('DIESEL') || 
      type.includes('FUEL OIL')
    ),
    "Oil/Chemical Tanker": [...OIL_PRODUCT_TYPES.filter(type => type.includes('CHEMICAL')), ...OIL_PRODUCT_TYPES.filter(type => !type.includes('CRUDE') && !type.includes('LNG'))],
    "LPG Carrier": OIL_PRODUCT_TYPES.filter(type => type.includes('LPG') || type.includes('PROPANE')),
    "Asphalt/Bitumen Tanker": OIL_PRODUCT_TYPES.filter(type => type.includes('BITUMEN') || type.includes('ASPHALT'))
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
    
    // Use appropriate oil product types based on vessel type
    let possibleCargoTypes = vesselToOilProductMapping[vesselType] || OIL_PRODUCT_TYPES;
    
    // If no specific mapping or empty mapping, use a random oil product type
    if (!possibleCargoTypes || possibleCargoTypes.length === 0) {
      possibleCargoTypes = OIL_PRODUCT_TYPES;
    }
    
    // Select a random cargo type from the appropriate list
    const oilProductType = possibleCargoTypes[Math.floor(Math.random() * possibleCargoTypes.length)];
    
    // Generate capacity based on vessel type
    let capacity;
    if (vesselType.includes("Crude Oil") || vesselType.includes("Oil/Chemical")) {
      capacity = Math.floor(Math.random() * 1500000) + 500000;
    } else if (vesselType.includes("VLCC") || vesselType.includes("ULCC")) {
      capacity = Math.floor(Math.random() * 1000000) + 1500000;
    } else if (vesselType.includes("Aframax") || vesselType.includes("Suezmax")) {
      capacity = Math.floor(Math.random() * 750000) + 750000;
    } else if (vesselType.includes("LNG") || vesselType.includes("LPG")) {
      capacity = Math.floor(Math.random() * 100000) + 100000;
    } else if (vesselType.includes("Container") || vesselType.includes("Cargo")) {
      capacity = Math.floor(Math.random() * 15000) + 5000;
    } else if (vesselType.includes("Bitumen") || vesselType.includes("Asphalt")) {
      capacity = Math.floor(Math.random() * 300000) + 100000;
    } else if (vesselType.includes("Product") || vesselType.includes("Panamax")) {
      capacity = Math.floor(Math.random() * 600000) + 200000;
    } else {
      capacity = Math.floor(Math.random() * 500000) + 50000;
    }
    
    // Generate IMO and MMSI numbers
    const imoNum = Math.floor(Math.random() * 1000000) + 9000000;
    const mmsiNum = Math.floor(Math.random() * 900000000) + 100000000;
    
    // Generate built year
    const builtYear = Math.floor(Math.random() * 23) + 2000; // 2000-2023
    
    // Generate deadweight based on vessel type
    let deadweight;
    if (vesselType.includes("VLCC") || vesselType.includes("ULCC")) {
      deadweight = Math.floor(Math.random() * 150000) + 250000;
    } else if (vesselType.includes("Crude Oil")) {
      deadweight = Math.floor(Math.random() * 150000) + 150000;
    } else if (vesselType.includes("Aframax")) {
      deadweight = Math.floor(Math.random() * 40000) + 80000;
    } else if (vesselType.includes("Suezmax")) {
      deadweight = Math.floor(Math.random() * 60000) + 120000;
    } else if (vesselType.includes("Panamax")) {
      deadweight = Math.floor(Math.random() * 30000) + 60000;
    } else if (vesselType.includes("Container") || vesselType.includes("Cargo")) {
      deadweight = Math.floor(Math.random() * 100000) + 100000;
    } else {
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