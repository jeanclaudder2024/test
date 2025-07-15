// Direct database fix for refinery coordinates
// Run this script to update all refineries with accurate coordinates

const { updateRefineryCoordinates } = require('./server/services/refineryCoordinatesfix');
const { storage } = require('./server/storage');

async function fixRefineryCoordinates() {
  console.log("🏭 Starting refinery coordinates fix...");
  
  try {
    const result = await updateRefineryCoordinates(storage);
    console.log("✅ Refinery coordinates fixed successfully:");
    console.log(`   - Updated: ${result.updated} refineries`);
    console.log(`   - Total: ${result.total} refineries`);
    console.log("🎉 All refineries should now display in correct locations on the map!");
  } catch (error) {
    console.error("❌ Error fixing refinery coordinates:", error);
  }
  
  process.exit(0);
}

fixRefineryCoordinates();