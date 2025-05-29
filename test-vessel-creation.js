// Test vessel creation to Supabase database
import { db } from "./server/db.js";
import { vessels } from "./shared/schema.js";

async function testVesselCreation() {
  try {
    console.log("🚢 Testing vessel creation in Supabase...");
    
    const testVessel = {
      name: "Test Oil Tanker 001",
      imo: "9123456",
      mmsi: "123456789",
      vesselType: "Oil Tanker",
      flag: "Panama",
      currentLat: "25.0330",
      currentLng: "55.1653",
      status: "underway",
      speed: "12",
      cargoType: "Crude Oil",
      cargoCapacity: 150000
    };

    console.log("Creating test vessel:", testVessel);
    
    const result = await db.insert(vessels).values(testVessel).returning();
    
    console.log("✅ Vessel created successfully in Supabase!");
    console.log("Created vessel ID:", result[0].id);
    console.log("Vessel data:", result[0]);
    
    // Query back to verify
    const allVessels = await db.select().from(vessels);
    console.log(`📊 Total vessels in database: ${allVessels.length}`);
    
    return result[0];
  } catch (error) {
    console.error("❌ Error creating vessel:", error);
    throw error;
  }
}

testVesselCreation();