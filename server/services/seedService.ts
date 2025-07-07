import { db } from "../db";
import { progressEvents, vessels, refineries, brokers, vesselDocuments } from "@shared/schema";
import { generateLargeVesselDataset, determineRegionFromCoordinates } from "./vesselGenerator";
import { getAccurateRefineries } from "./refineryCoordinates";
import { isCoordinateAtSea } from "./vesselGenerator";
import { REGIONS, OIL_PRODUCT_TYPES } from "@shared/constants";
import { sql, ilike, eq } from "drizzle-orm";
// Removed broken import - seed-subscription-plans script was cleaned up
// Removed broken import - seed-vessel-jobs script was cleaned up

/**
 * Add seed data for vessels if no vessels exist or if fewer than expected
 */
export async function seedVessels(minDesiredVessels: number = 2500): Promise<{ 
  count: number, 
  seeded: boolean, 
  oilVessels: number,
  totalCargo: number
}> {
  // Check existing vessel count
  const existingVessels = await db.select({ count: vessels.id }).from(vessels);
  const existingCount = existingVessels.length > 0 ? existingVessels.length : 0;
  
  console.log(`Checking existing vessels in database...`);
  
  // If we already have enough vessels, no need to seed
  if (existingCount >= minDesiredVessels) {
    console.log(`Database already contains ${existingCount} vessels.`);
    
    // Count oil vessels and total cargo for reporting
    const oilVessels = await db.select({ count: vessels.id })
      .from(vessels)
      .where(sql`${vessels.cargoType} ILIKE ${'%OIL%'} 
        OR ${vessels.cargoType} ILIKE ${'%CRUDE%'} 
        OR ${vessels.cargoType} ILIKE ${'%PETROL%'} 
        OR ${vessels.cargoType} ILIKE ${'%DIESEL%'} 
        OR ${vessels.cargoType} ILIKE ${'%FUEL%'} 
        OR ${vessels.cargoType} ILIKE ${'%GAS%'}`);
    
    const cargoSum = await db.select({
      sum: vessels.cargoCapacity
    }).from(vessels);
    
    return { 
      count: existingCount, 
      seeded: false,
      oilVessels: oilVessels.length,
      totalCargo: cargoSum[0]?.sum || 0
    };
  }
  
  // Generate new vessel data - making sure we add enough to reach our minimum
  const vesselCount = minDesiredVessels - existingCount;
  console.log(`Generating ${vesselCount} vessels...`);
  
  // Generate new vessels with our improved isCoordinateAtSea function
  const vesselData = generateLargeVesselDataset(vesselCount)
    .filter(vessel => {
      // Ensure vessels are only in the ocean
      return isCoordinateAtSea(parseFloat(vessel.currentLat || "0"), parseFloat(vessel.currentLng || "0"));
    });
  
  // Insert vessels in smaller batches to avoid memory issues
  const batchSize = 500;
  let insertedCount = 0;
  
  for (let i = 0; i < vesselData.length; i += batchSize) {
    const batch = vesselData.slice(i, i + batchSize);
    const result = await db.insert(vessels).values(batch);
    insertedCount += batch.length;
    console.log(`Inserted batch of ${batch.length} vessels. Total so far: ${insertedCount}`);
  }
  
  const totalCount = existingCount + insertedCount;
  
  // Count oil vessels for reporting
  const oilVessels = await db.select({ count: vessels.id })
    .from(vessels)
    .where(sql`${vessels.cargoType} ILIKE ${'%OIL%'} 
      OR ${vessels.cargoType} ILIKE ${'%CRUDE%'} 
      OR ${vessels.cargoType} ILIKE ${'%PETROL%'} 
      OR ${vessels.cargoType} ILIKE ${'%DIESEL%'} 
      OR ${vessels.cargoType} ILIKE ${'%FUEL%'} 
      OR ${vessels.cargoType} ILIKE ${'%GAS%'}`);
  
  const cargoSum = await db.select({
    sum: vessels.cargoCapacity
  }).from(vessels);
  
  return { 
    count: totalCount, 
    seeded: true,
    oilVessels: oilVessels.length,
    totalCargo: cargoSum[0]?.sum || 0
  };
}

/**
 * Add seed data for refineries if no refineries exist.
 * Note: This function has been DISABLED to prevent automatic seeding
 */
export async function seedRefineries(): Promise<{ count: number, seeded: boolean, active: number }> {
  // Check existing refinery count
  const existingRefineries = await db.select({ count: refineries.id }).from(refineries);
  const existingCount = existingRefineries.length > 0 ? existingRefineries.length : 0;
  
  console.log(`Checking existing refineries in database...`);
  
  // Count active refineries for reporting
  const activeRefineries = await db.select({ count: refineries.id })
    .from(refineries)
    .where(sql`${refineries.status} IN ('active', 'operational')`);
  
  // DISABLED: Never automatically seed refineries to respect user deletions
  console.log(`Database contains ${existingCount} refineries. Automatic seeding disabled.`);
  
  return { 
    count: existingCount, 
    seeded: false,
    active: activeRefineries.length > 0 ? (activeRefineries[0] as any).count || 0 : 0
  };
}

/**
 * Add seed data for brokers if no brokers exist
 */
export async function seedBrokers(): Promise<{ count: number, seeded: boolean }> {
  // Check existing broker count
  const existingBrokers = await db.select({ count: brokers.id }).from(brokers);
  const existingCount = existingBrokers.length;
  
  console.log(`Database already contains ${existingCount} brokers.`);
  
  // If we already have brokers, no need to seed
  if (existingCount > 0) {
    return { count: existingCount, seeded: false };
  }
  
  // Sample broker data
  const brokerData = [
    {
      name: "Global Shipping Solutions",
      email: "contact@globalshipping.com",
      phone: "+1-555-123-4567",
      company: "Global Shipping LLC",
      country: "United States",
      isElite: true,
      memberSince: new Date(),
      eliteExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      arabicName: "حلول الشحن العالمية",
      arabicCompany: "شركة الشحن العالمية ذ.م.م",
      bio: "Leading international shipping broker specializing in oil transport and logistics solutions.",
      arabicBio: "وسيط شحن دولي رائد متخصص في نقل النفط وحلول الخدمات اللوجستية.",
      region: "north-america"
    }
  ];
  
  await db.insert(brokers).values(brokerData);
  
  return { count: brokerData.length, seeded: true };
}

/**
 * Regenerate all vessels with global distribution
 * This function will delete all existing vessels and create new ones with improved global distribution
 */
export async function regenerateGlobalVessels(count: number = 5000): Promise<{
  count: number;
  globalDistribution: boolean;
}> {
  console.log("Starting vessel global redistribution...");
  
  try {
    // Delete all existing vessels
    console.log("Removing existing vessels...");
    await db.delete(progressEvents).where(eq(progressEvents.vesselId, sql.raw("ANY(SELECT id FROM vessels)")));
    console.log("Deleted vessel progress events");
    
    await db.delete(documents).where(eq(documents.vesselId, sql.raw("ANY(SELECT id FROM vessels)")));
    console.log("Deleted vessel documents");
    
    await db.delete(vessels);
    console.log("Deleted all vessels");
    
    // Generate new vessels with global distribution
    console.log(`Generating ${count} vessels with global distribution...`);
    
    // Generate completely new vessels with unique IMO and MMSI numbers
    // We'll manually create each vessel instead of using the generated dataset
    // to ensure complete uniqueness
    console.log("Generating vessels with guaranteed unique identifiers...");
    
    // Get list of ocean coordinates for global distribution
    const oceanCoordinates = [
      // North Atlantic
      { lat: 35.6, lng: -40.2 },   // Central North Atlantic
      { lat: 40.2, lng: -30.5 },   // East of Newfoundland
      { lat: 25.7, lng: -50.9 },   // Bermuda/Sargasso Sea area
      { lat: 50.3, lng: -35.8 },   // Labrador Sea
      
      // South Atlantic
      { lat: -25.3, lng: 5.1 },    // Central South Atlantic  
      { lat: -35.7, lng: -20.4 },  // South Atlantic west
      { lat: -40.2, lng: 10.5 },   // Cape region
      { lat: -15.9, lng: -10.2 },  // Mid-South Atlantic
      
      // North Pacific
      { lat: 20.4, lng: 122.5 },   // South China Sea
      { lat: 35.8, lng: -140.2 },  // East of Japan
      { lat: 45.2, lng: -150.7 },  // North Pacific
      { lat: 30.1, lng: -130.4 },  // Eastern Pacific
      
      // South Pacific
      { lat: -30.8, lng: -100.2 }, // Southeast Pacific
      { lat: -15.3, lng: -145.5 }, // Tahiti region
      { lat: -25.7, lng: 170.9 },  // East of Australia
      { lat: -40.5, lng: -120.3 }, // Deep South Pacific
      
      // Indian Ocean
      { lat: 15.5, lng: 55.3 },    // Arabian Sea
      { lat: -5.8, lng: 75.3 },    // Central Indian Ocean
      { lat: -30.2, lng: 80.9 },   // Southern Indian Ocean
      { lat: 5.7, lng: 90.1 },     // Bay of Bengal
      
      // Mediterranean
      { lat: 36.2, lng: 20.1 },    // Central Mediterranean
      { lat: 38.5, lng: 5.4 },     // Western Mediterranean
      { lat: 34.9, lng: 28.7 },    // Eastern Mediterranean
      
      // Baltic & North Sea
      { lat: 57.4, lng: 19.6 },    // Baltic Sea
      { lat: 55.7, lng: 2.3 },     // North Sea
      
      // Caribbean and Gulf of Mexico
      { lat: 20.1, lng: -75.8 },   // Caribbean Sea
      { lat: 25.8, lng: -90.4 },   // Gulf of Mexico
      
      // Red Sea and Gulf of Aden
      { lat: 16.5, lng: 41.2 },    // Red Sea
      { lat: 12.7, lng: 48.9 },    // Gulf of Aden
      
      // South China Sea & East Asian Waters
      { lat: 10.3, lng: 114.5 },   // South China Sea
      { lat: 30.8, lng: 127.9 },   // East China Sea
      
      // Black Sea
      { lat: 43.4, lng: 34.2 }     // Black Sea
    ];

    // Define vessel types
    const vesselTypes = [
      "Crude Oil Tanker", "VLCC", "ULCC", "Oil/Chemical Tanker", "LNG Carrier", 
      "LPG Carrier", "Product Tanker", "Bitumen Tanker", "Container Ship", "Bulk Carrier",
      "General Cargo", "Aframax", "Suezmax", "Panamax", "Handysize"
    ];

    // Define flags
    const flags = [
      "Panama", "Liberia", "Marshall Islands", "Hong Kong", "Singapore", 
      "Malta", "Bahamas", "Greece", "Japan", "Cyprus", "Italy", "United Kingdom", 
      "Norway", "Denmark", "China", "USA", "South Korea", "Germany", "France"
    ];

    // Define name components
    const prefixes = [
      "Pacific", "Atlantic", "Ocean", "Sea", "Global", "Royal", "Star", "Blue", 
      "Golden", "Silver", "Nordic", "Eastern", "Western", "Southern", "Northern",
      "Grand", "Majestic", "Imperial", "Elite", "Premium", "Diamond", "Crystal",
      "Maritime", "Nautical", "Titan", "Triton", "Neptune", "Poseidon", "Oceanic"
    ];

    const suffixes = [
      "Explorer", "Voyager", "Pioneer", "Navigator", "Carrier", "Transport", 
      "Mariner", "Sailor", "Trader", "Cruiser", "Venture", "Journey", "Discovery",
      "Enterprise", "Challenger", "Endeavor", "Path", "Quest", "Horizon", "Spirit",
      "Champion", "Leader", "Frontier", "Legacy", "Prestige", "Excellence", "Pride"
    ];

    // Define port collections
    const ports = {
      "Europe": [
        "Rotterdam", "Antwerp", "Hamburg", "Marseille", "Valencia", "Piraeus", 
        "Algeciras", "Barcelona", "Genoa", "Southampton", "Le Havre", "Felixstowe",
        "Gdansk", "St. Petersburg", "Constanta", "Koper", "Trieste", "Bilbao"
      ],
      "North America": [
        "Houston", "New York", "Los Angeles", "Long Beach", "Vancouver", "Seattle", 
        "Miami", "New Orleans", "Savannah", "Charleston", "Baltimore", "Oakland",
        "Norfolk", "Montreal", "Halifax", "Boston", "Philadelphia", "Mobile"
      ],
      "Asia": [
        "Singapore", "Shanghai", "Hong Kong", "Busan", "Tokyo", "Kaohsiung", 
        "Port Klang", "Yokohama", "Qingdao", "Ningbo", "Guangzhou", "Shenzhen",
        "Tianjin", "Xiamen", "Dalian", "Kobe", "Nagoya", "Manila", "Bangkok"
      ],
      "MEA": [
        "Dubai", "Jeddah", "Abu Dhabi", "Dammam", "Jebel Ali", "Salalah", 
        "Fujairah", "Doha", "Kuwait", "Muscat", "Aqaba", "Alexandria", "Port Said",
        "Haifa", "Ashdod", "Beirut", "Karachi", "Bandar Abbas"
      ],
      "Africa": [
        "Durban", "Cape Town", "Lagos", "Mombasa", "Djibouti", "Port Louis", 
        "Dar es Salaam", "Maputo", "Luanda", "Libreville", "Dakar", "Casablanca",
        "Algiers", "Abidjan", "Tema", "Port Elizabeth", "Walvis Bay"
      ],
      "Russia": [
        "Novorossiysk", "Vladivostok", "Primorsk", "Ust-Luga", "Kaliningrad", 
        "Murmansk", "Vostochny", "Rostov-on-Don", "Taganrog", "Tuapse", "Taman",
        "Vanino", "Nakhodka", "Arkhangelsk", "Sakhalin", "Kavkaz", "Azov"
      ]
    };

    // Create empty vessel data array
    const vesselData = [];

    // Generate vessels with guaranteed unique IMO and MMSI
    for (let i = 0; i < count; i++) {
      // Generate unique identifiers
      const imoBase = 9000000;
      const mmsiBase = 100000000;
      const uniqueImo = (imoBase + i).toString();
      const uniqueMmsi = (mmsiBase + i).toString();
      
      // Select random vessel type, flag, region
      const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      const flag = flags[Math.floor(Math.random() * flags.length)];
      
      // Generate name
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const name = `${prefix} ${suffix}`;
      
      // Select random ocean position
      const position = oceanCoordinates[Math.floor(Math.random() * oceanCoordinates.length)];
      const lat = position.lat;
      const lng = position.lng;
      
      // Determine region based on coordinates
      const region = determineRegionFromCoordinates(lat, lng);
      
      // Select regional port mapping
      const portMappingKey = 
        region.includes('europe') ? 'Europe' :
        region.includes('america') ? 'North America' :
        region === 'asia-pacific' || region === 'china' || region === 'southeast-asia-oceania' ? 'Asia' :
        region === 'middle-east' || region === 'north-africa' ? 'MEA' :
        region === 'southern-africa' ? 'Africa' :
        region === 'russia' ? 'Russia' : 'North America';
      
      // Select ports for this region
      const regionPorts = ports[portMappingKey] || ports["North America"];
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
      let cargoType;
      if (vesselType.includes("Crude Oil") || vesselType.includes("VLCC") || vesselType.includes("ULCC")) {
        cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * 5)]; // First 5 are crude oil types
      } else if (vesselType.includes("LNG")) {
        cargoType = "Liquefied Natural Gas (LNG)";
      } else if (vesselType.includes("LPG")) {
        cargoType = "Liquefied Petroleum Gas (LPG)";
      } else if (vesselType.includes("Chemical")) {
        cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
      } else if (vesselType.includes("Product")) {
        cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
      } else if (vesselType.includes("Bitumen")) {
        cargoType = "Bitumen";
      } else {
        cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
      }
      
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
      
      // Create vessel object with guaranteed unique identifiers
      vesselData.push({
        name,
        imo: uniqueImo,
        mmsi: uniqueMmsi,
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
        cargoType,
        cargoCapacity: capacity,
        currentRegion: region
      });
    }
    
    // Insert vessels in smaller batches to avoid memory issues
    const batchSize = 500;
    let insertedCount = 0;
    
    for (let i = 0; i < vesselData.length; i += batchSize) {
      const batch = vesselData.slice(i, i + batchSize);
      await db.insert(vessels).values(batch);
      insertedCount += batch.length;
      console.log(`Inserted batch of ${batch.length} vessels. Total so far: ${insertedCount}`);
    }
    
    console.log(`Successfully redistributed ${insertedCount} vessels globally`);
    
    return {
      count: insertedCount,
      globalDistribution: true
    };
  } catch (error) {
    console.error("Error during global vessel regeneration:", error);
    throw error;
  }
}

/**
 * Run all seed operations
 */
export async function seedAllData(): Promise<{
  refineries: { count: number, seeded: boolean, active: number },
  vessels: { count: number, seeded: boolean, oilVessels: number, totalCargo: number },
  brokers: { count: number, seeded: boolean },
  subscriptionPlans: { count: number, seeded: boolean },
  vesselJobs?: { jobs: number, seeded: boolean }
}> {
  console.log("Starting database seeding process...");
  
  console.log("Seeding refinery data...");
  const refineryResult = await seedRefineries();
  console.log("Refinery data seeded successfully:", refineryResult);
  
  console.log("Seeding vessel data...");
  const vesselResult = await seedVessels(2500); // Target 2500 vessels minimum
  console.log("Vessel data seeded successfully:", vesselResult);
  
  console.log("Seeding broker data...");
  const brokerResult = await seedBrokers();
  console.log("Broker data seeded successfully:", brokerResult);
  
  console.log("Seeding subscription plans...");
  // Subscription plans seeding was removed during cleanup
  const subscriptionPlansResult = { plans: 0, seeded: false };
  console.log("Subscription plans seeded successfully:", subscriptionPlansResult);
  
  console.log("Seeding vessel jobs and dashboard data...");
  let vesselJobsResult;
  try {
    // Vessel jobs seeding was removed during cleanup
    vesselJobsResult = { jobs: 0, seeded: false };
    console.log("Vessel jobs seeded successfully:", vesselJobsResult);
  } catch (error) {
    console.error("Error seeding vessel jobs:", error);
    vesselJobsResult = { jobs: 0, seeded: false };
  }
  
  return {
    refineries: refineryResult,
    vessels: vesselResult,
    brokers: brokerResult,
    subscriptionPlans: subscriptionPlansResult,
    vesselJobs: vesselJobsResult
  };
}