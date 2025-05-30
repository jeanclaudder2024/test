// Import removed as we're using local data generation

// Types for vessel data
export interface VesselEnhancedData {
  currentCargo?: string;
  cargoCapacity?: string;
  estArrivalDate?: string;
  estDepartureDate?: string;
  voyageNotes?: string;
  captain?: string;
  ownerCompany?: string;
  yearBuilt?: string;
  previousVoyages?: string[];
  technicalSpecifications?: {
    propulsionType?: string;
    enginePower?: string;
    maxSpeed?: string;
    fuelType?: string;
  };
  safetyRating?: string;
  isTracked?: boolean;
}

/**
 * Generate realistic vessel data based on vessel type and other attributes
 * @param vesselType The type of vessel (e.g. "Oil Tanker", "Container Ship")
 * @param vesselName The name of the vessel
 * @param flag The flag country of the vessel
 * @param region The current region of the vessel
 * @returns Enhanced vessel data
 */
export async function generateVesselData(
  vesselType: string,
  vesselName: string,
  flag: string,
  region: string
): Promise<VesselEnhancedData> {
  // Use deterministic data generation based on vessel name to ensure consistency
  const nameSum = vesselName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Helper function to get a consistent random number based on vessel name
  const getConsistentRandom = (min: number, max: number, offset = 0) => {
    const randomValue = (nameSum + offset) % 100 / 100; // 0-1 range
    return Math.floor(min + randomValue * (max - min));
  };
  
  // Helper function to get a date offset by a number of days (consistent per vessel)
  const getDateOffset = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Generate cargo based on vessel type
  let currentCargo = "General Cargo";
  if (vesselType.toLowerCase().includes("tanker") || vesselType.toLowerCase().includes("oil")) {
    const oilCargos = ["Crude Oil", "Light Crude", "Heavy Crude", "Refined Petroleum", "Diesel", "Gasoline", "Jet Fuel", "LNG", "LPG"];
    currentCargo = oilCargos[getConsistentRandom(0, oilCargos.length)];
  } else if (vesselType.toLowerCase().includes("container")) {
    const containerCargos = ["Mixed Containers", "Consumer Goods", "Electronics", "Machinery", "Textiles", "Furniture", "Auto Parts", "Perishable Goods"];
    currentCargo = containerCargos[getConsistentRandom(0, containerCargos.length)];
  } else if (vesselType.toLowerCase().includes("bulk")) {
    const bulkCargos = ["Coal", "Iron Ore", "Grain", "Bauxite", "Cement", "Phosphate", "Steel", "Timber"];
    currentCargo = bulkCargos[getConsistentRandom(0, bulkCargos.length)];
  }
  
  // Generate owner company based on flag
  const companyTypes = ["Shipping", "Marine", "Maritime", "Transport", "Cargo", "Lines", "Tankers", "Navigation"];
  const companyType = companyTypes[getConsistentRandom(0, companyTypes.length)];
  
  // Generate voyage notes
  const voyageStatuses = [
    "Proceeding on schedule",
    "Slight delay due to port congestion",
    "Weather conditions favorable",
    "Taking longer northern route due to sea conditions",
    "Maintaining optimal speed to conserve fuel",
    "Completed customs clearance at last port",
    "Recently refueled at previous port",
    "On standard shipping lane",
    "Avoiding storm system to the east"
  ];
  
  // Generate technical specifications
  const enginePower = vesselType.toLowerCase().includes("tanker") ? 
    `${getConsistentRandom(15000, 30000)} kW` : 
    `${getConsistentRandom(8000, 20000)} kW`;
  
  const maxSpeed = `${getConsistentRandom(14, 26)} knots`;
  
  const fuelTypes = ["Marine Diesel Oil", "Heavy Fuel Oil", "Marine Gas Oil", "Low Sulfur Fuel Oil", "LNG"];
  const fuelType = fuelTypes[getConsistentRandom(0, fuelTypes.length)];
  
  const propulsionTypes = ["Diesel-Electric", "Diesel Direct Drive", "Diesel-Mechanical", "Steam Turbine", "Gas Turbine"];
  const propulsionType = propulsionTypes[getConsistentRandom(0, propulsionTypes.length)];
  
  // Generate captain's name
  const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Carlos", "Andreas", "Sergei", "Hiroshi", "Li", "Mohammed"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Miller", "Garcia", "Petrov", "Nakamura", "Chen", "Müller", "Rossi", "Singh"];
  const captain = `Capt. ${firstNames[getConsistentRandom(0, firstNames.length)]} ${lastNames[getConsistentRandom(0, lastNames.length, 100)]}`;
  
  // Generate arrival and departure dates
  const arrivalDays = getConsistentRandom(2, 14);
  const departureDays = getConsistentRandom(-7, -1);
  
  // Previously visited ports based on region
  const previousVoyages = [];
  if (region === "Europe") {
    previousVoyages.push("Rotterdam, Netherlands", "Hamburg, Germany", "Antwerp, Belgium");
  } else if (region === "Asia-Pacific") {
    previousVoyages.push("Singapore", "Shanghai, China", "Busan, South Korea");
  } else if (region === "North America") {
    previousVoyages.push("Houston, USA", "Los Angeles, USA", "Vancouver, Canada");
  } else if (region === "Middle East") {
    previousVoyages.push("Dubai, UAE", "Jeddah, Saudi Arabia", "Doha, Qatar");
  } else {
    previousVoyages.push("Cape Town, South Africa", "Santos, Brazil", "Alexandria, Egypt");
  }
  
  // Return the generated data
  return {
    currentCargo,
    cargoCapacity: vesselType.includes("Tanker") ? 
      `${getConsistentRandom(80, 320) * 1000} DWT` : 
      `${getConsistentRandom(1, 21) * 1000} TEU`,
    estArrivalDate: getDateOffset(arrivalDays),
    estDepartureDate: getDateOffset(departureDays),
    voyageNotes: voyageStatuses[getConsistentRandom(0, voyageStatuses.length)],
    captain,
    ownerCompany: `${flag} ${companyType}`,
    yearBuilt: `${getConsistentRandom(1990, 2023)}`,
    previousVoyages: previousVoyages.slice(0, getConsistentRandom(1, previousVoyages.length + 1)),
    technicalSpecifications: {
      propulsionType,
      enginePower,
      maxSpeed,
      fuelType
    },
    safetyRating: `${getConsistentRandom(3, 6)}/5`,
    isTracked: true
  };
}

// Cache for storing generated vessel data to avoid repeated API calls
const vesselDataCache = new Map<number, VesselEnhancedData>();

/**
 * Gets enhanced data for a vessel, either from cache or by generating new data
 */
export async function getEnhancedVesselData(
  vesselId: number,
  vesselType: string,
  vesselName: string,
  flag: string,
  region: string
): Promise<VesselEnhancedData> {
  // Check if data exists in cache
  if (vesselDataCache.has(vesselId)) {
    return vesselDataCache.get(vesselId)!;
  }
  
  // Generate new data
  const data = await generateVesselData(vesselType, vesselName, flag, region);
  
  // Store in cache
  vesselDataCache.set(vesselId, data);
  
  return data;
}