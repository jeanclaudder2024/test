import { db } from "../db";
import { progressEvents, vessels, refineries, brokers, documents } from "@shared/schema";
import { generateLargeVesselDataset } from "./vesselGenerator";
import { getAccurateRefineries } from "./refineryCoordinates";
import { isCoordinateAtSea } from "./vesselGenerator";
import { REGIONS } from "@shared/constants";

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
      .where(vessels.cargoType.like('%OIL%')
        .or(vessels.cargoType.like('%CRUDE%'))
        .or(vessels.cargoType.like('%PETROL%'))
        .or(vessels.cargoType.like('%DIESEL%'))
        .or(vessels.cargoType.like('%FUEL%'))
        .or(vessels.cargoType.like('%GAS%')));
    
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
      return isCoordinateAtSea(vessel.latitude, vessel.longitude);
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
    .where(vessels.cargoType.like('%OIL%')
      .or(vessels.cargoType.like('%CRUDE%'))
      .or(vessels.cargoType.like('%PETROL%'))
      .or(vessels.cargoType.like('%DIESEL%'))
      .or(vessels.cargoType.like('%FUEL%'))
      .or(vessels.cargoType.like('%GAS%')));
  
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
 * Add seed data for refineries if no refineries exist
 */
export async function seedRefineries(): Promise<{ count: number, seeded: boolean, active: number }> {
  // Check existing refinery count
  const existingRefineries = await db.select({ count: refineries.id }).from(refineries);
  const existingCount = existingRefineries.length > 0 ? existingRefineries.length : 0;
  
  console.log(`Checking existing refineries in database...`);
  
  // If we already have refineries, no need to seed
  if (existingCount > 0) {
    console.log(`Database already contains ${existingCount} refineries.`);
    
    // Count active refineries for reporting
    const activeRefineries = await db.select({ count: refineries.id })
      .from(refineries)
      .where(refineries.status.equals('active'));
    
    return { 
      count: existingCount, 
      seeded: false,
      active: activeRefineries[0]?.count || 0 
    };
  }
  
  // Generate refinery data
  const refineryData = getAccurateRefineries();
  
  // Insert refineries
  await db.insert(refineries).values(refineryData);
  
  // Count active refineries for reporting
  const activeRefineries = await db.select({ count: refineries.id })
    .from(refineries)
    .where(refineries.status.equals('active'));
  
  return { 
    count: refineryData.length, 
    seeded: true,
    active: activeRefineries[0]?.count || 0
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
 * Run all seed operations
 */
export async function seedAllData(): Promise<{
  refineries: { count: number, seeded: boolean, active: number },
  vessels: { count: number, seeded: boolean, oilVessels: number, totalCargo: number },
  brokers: { count: number, seeded: boolean }
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
  
  return {
    refineries: refineryResult,
    vessels: vesselResult,
    brokers: brokerResult
  };
}