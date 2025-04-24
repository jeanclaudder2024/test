import { InsertVessel } from "@shared/schema";
import { REGIONS, OIL_PRODUCT_TYPES } from "@shared/constants";

/**
 * Determines if a coordinate pair is likely at sea (not on land)
 * This is a simplified check using known land mass boundaries
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns Boolean indicating if the coordinates are likely at sea
 */
export function isCoordinateAtSea(lat: number, lng: number): boolean {
  // Input validation
  if (typeof lat !== 'number' || typeof lng !== 'number' || 
      isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.warn(`Invalid coordinates: ${lat}, ${lng}`);
    return false; // Invalid coordinates
  }

  // Major landmasses to exclude
  
  // North America
  if (lng >= -170 && lng <= -50 && lat >= 15 && lat <= 80) {
    // Hudson Bay
    if (lat >= 50 && lat <= 64 && lng >= -95 && lng <= -78) {
      return true;
    }
    
    // Gulf of Mexico
    if (lat >= 18 && lat <= 30 && lng >= -98 && lng <= -80) {
      return true;
    }
    
    // Gulf of St. Lawrence
    if (lat >= 45 && lat <= 50 && lng >= -67 && lng <= -60) {
      return true;
    }
    
    // Great Lakes - these are NOT sea
    if (
      (lat >= 41 && lat <= 49 && lng >= -93 && lng <= -76) || // Great Lakes general area
      (lat >= 41.5 && lat <= 44 && lng >= -87.5 && lng <= -84.5) || // Lake Michigan
      (lat >= 41 && lat <= 43 && lng >= -83.5 && lng <= -78.5) || // Lake Erie
      (lat >= 43 && lat <= 47.5 && lng >= -89.5 && lng <= -82) || // Lake Superior
      (lat >= 42.5 && lat <= 45 && lng >= -80 && lng <= -76) // Lake Ontario
    ) {
      return false;
    }
    
    // Rest of North America
    return false;
  }
  
  // South America
  if (lng >= -85 && lng <= -35 && lat >= -58 && lat <= 12) {
    // Amazon River (not ocean)
    if (lat >= -3 && lat <= 2 && lng >= -67 && lng <= -50) {
      return false;
    }
    return false;
  }
  
  // Europe and parts of Western Asia/North Africa
  if (lng >= -15 && lng <= 40 && lat >= 30 && lat <= 75) {
    // Mediterranean Sea
    if (lng >= -5 && lng <= 37 && lat >= 30 && lat <= 45) {
      return true;
    }
    
    // Baltic Sea
    if (lng >= 9 && lng <= 30 && lat >= 53 && lat <= 66) {
      return true;
    }
    
    // North Sea
    if (lng >= -4 && lng <= 9 && lat >= 51 && lat <= 62) {
      return true;
    }
    
    // Black Sea
    if (lng >= 27 && lng <= 42 && lat >= 40 && lat <= 48) {
      return true;
    }
    
    return false;
  }
  
  // Africa
  if (lng >= -20 && lng <= 50 && lat >= -35 && lat <= 35) {
    // Red Sea
    if (lng >= 32 && lng <= 44 && lat >= 12 && lat <= 30) {
      return true;
    }
    
    // Lake Victoria (not ocean)
    if (lat >= -3 && lat <= 1 && lng >= 31 && lng <= 35) {
      return false;
    }
    
    return false;
  }
  
  // Asia (mainland)
  if (lng >= 40 && lng <= 145 && lat >= 0 && lat <= 75) {
    // Sea of Japan
    if (lng >= 127 && lng <= 142 && lat >= 33 && lat <= 48) {
      return true;
    }
    
    // South China Sea
    if (lng >= 105 && lng <= 122 && lat >= 5 && lat <= 25) {
      return true;
    }
    
    // Persian Gulf
    if (lng >= 48 && lng <= 57 && lat >= 23 && lat <= 30) {
      return true;
    }
    
    // Caspian Sea
    if (lng >= 46 && lng <= 55 && lat >= 36 && lat <= 47) {
      return true;
    }
    
    // Bay of Bengal
    if (lng >= 80 && lng <= 95 && lat >= 5 && lat <= 22) {
      return true;
    }
    
    return false;
  }
  
  // Australia
  if (lng >= 110 && lng <= 155 && lat >= -45 && lat <= -10) {
    // Great Barrier Reef area
    if (lng >= 142 && lng <= 155 && lat >= -24 && lat <= -10) {
      return true;
    }
    return false;
  }
  
  // Russia & Arctic
  if (lng >= 30 && lng <= 180 && lat >= 60 && lat <= 90) {
    // Sea of Okhotsk
    if (lng >= 140 && lng <= 160 && lat >= 50 && lat <= 60) {
      return true;
    }
    return false;
  }
  
  // Indonesia & Philippines (archipelagos - we'll place ships around them)
  if (lng >= 95 && lng <= 130 && lat >= -10 && lat <= 20) {
    // Waters between the islands are fine
    if (
      (lat >= -5 && lat <= 0 && lng >= 105 && lng <= 110) || // Java Sea
      (lat >= 0 && lat <= 5 && lng >= 110 && lng <= 119) || // Celebes Sea
      (lat >= 5 && lat <= 15 && lng >= 115 && lng <= 125) || // Sulu Sea
      (lat >= -10 && lat <= -5 && lng >= 115 && lng <= 120) || // Flores Sea
      (lat >= -5 && lat <= 0 && lng >= 120 && lng <= 125) // Banda Sea
    ) {
      return true;
    }
    
    return false;
  }
  
  // Middle East major inland bodies of water
  // Dead Sea
  if (lat >= 31 && lat <= 32 && lng >= 35 && lng <= 36) {
    return false; // Not a sea for shipping
  }
  
  // Antarctica
  if (lat <= -60) {
    return false;
  }
  
  // By default, assume that other coordinates (mostly oceans) are at sea
  return true;
}

/**
 * Determines the region ID from a set of latitude and longitude coordinates
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns Region ID from REGIONS constant
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
      region: "western-europe"
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
      region: "western-europe"
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
      region: "middle-east"
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
      region: "western-europe"
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
      region: "southeast-asia-oceania"
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
  
  // Add original template vessels first, ensuring they're positioned at sea
  templateVessels.forEach(template => {
    // Check if the vessel's position is at sea
    let lat = template.position.lat;
    let lng = template.position.lng;
    
    // If the position is on land, reposition to a nearby sea location
    if (!isCoordinateAtSea(lat, lng)) {
      // Use predefined ocean coordinates as a fallback
      const oceanCoordinates = [
        { lat: 35.6, lng: -40.2 },  // North Atlantic
        { lat: -25.3, lng: 5.1 },   // South Atlantic
        { lat: 20.4, lng: 122.5 },  // North Pacific
        { lat: -30.8, lng: -100.2 }, // South Pacific
        { lat: 15.5, lng: 55.3 },   // Indian Ocean
        { lat: 36.2, lng: 20.1 }    // Mediterranean
      ];
      const safeCoord = oceanCoordinates[Math.floor(Math.random() * oceanCoordinates.length)];
      lat = safeCoord.lat;
      lng = safeCoord.lng;
    }
    
    // Get appropriate region based on new coordinates if needed
    const region = isCoordinateAtSea(template.position.lat, template.position.lng) 
      ? template.region 
      : determineRegionFromCoordinates(lat, lng);
    
    vessels.push({
      name: template.name,
      imo: template.imo,
      mmsi: template.mmsi,
      vesselType: template.vessel_type,
      flag: template.flag,
      built: template.built,
      deadweight: template.deadweight,
      currentLat: lat.toString(),
      currentLng: lng.toString(),
      departurePort: template.departure.port,
      departureDate: new Date(template.departure.date),
      destinationPort: template.destination.port,
      eta: new Date(template.destination.eta),
      cargoType: template.cargo.type,
      cargoCapacity: template.cargo.capacity,
      currentRegion: region
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
    
    // Generate random position that's at sea (not on land)
    let lat, lng;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      const latOffset = Math.random() * 20 - 10; // -10 to +10
      const lngOffset = Math.random() * 20 - 10; // -10 to +10
      const baseLat = template.position.lat;
      const baseLng = template.position.lng;
      lat = Math.max(-85, Math.min(85, baseLat + latOffset));
      lng = Math.max(-180, Math.min(180, baseLng + lngOffset));
      attempts++;
    } while (!isCoordinateAtSea(lat, lng) && attempts < maxAttempts);
    
    // If we couldn't find a sea coordinate after max attempts, use predefined safe coordinates
    if (!isCoordinateAtSea(lat, lng)) {
      // Use predefined ocean coordinates as a fallback
      const oceanCoordinates = [
        { lat: 35.6, lng: -40.2 },  // North Atlantic
        { lat: -25.3, lng: 5.1 },   // South Atlantic
        { lat: 20.4, lng: 122.5 },  // North Pacific
        { lat: -30.8, lng: -100.2 }, // South Pacific
        { lat: 15.5, lng: 55.3 },   // Indian Ocean
        { lat: 36.2, lng: 20.1 }    // Mediterranean
      ];
      const safeCoord = oceanCoordinates[Math.floor(Math.random() * oceanCoordinates.length)];
      lat = safeCoord.lat;
      lng = safeCoord.lng;
    }
    
    // Determine the region based on coordinates
    const mappedRegion = determineRegionFromCoordinates(lat, lng);
    
    // Map our new region IDs to old region port mapping keys
    const portMappingKey = 
      mappedRegion.includes('europe') ? 'Europe' :
      mappedRegion.includes('america') ? 'North America' :
      mappedRegion === 'asia-pacific' || mappedRegion === 'china' || mappedRegion === 'southeast-asia-oceania' ? 'Asia' :
      mappedRegion === 'middle-east' || mappedRegion === 'north-africa' ? 'MEA' :
      mappedRegion === 'southern-africa' ? 'Africa' :
      mappedRegion === 'russia' ? 'Russia' : 'North America';
    
    // Select ports for this region
    const regionPorts = portsByRegion[portMappingKey] || portsByRegion["North America"];
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
      currentRegion: mappedRegion // Use the mapped region based on coordinates
    });
  }
  
  return vessels;
}