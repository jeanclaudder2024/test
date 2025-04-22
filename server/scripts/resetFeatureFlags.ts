import { db } from "../db";
import { featureFlags } from "@shared/schema";
import { subscriptionService } from "../services/subscriptionSeedService";

/**
 * Reset feature flags by removing all existing ones and reseeding
 */
async function resetFeatureFlags() {
  try {
    console.log("Starting feature flags reset...");
    
    // Delete all existing feature flags
    const deleted = await db.delete(featureFlags).returning();
    console.log(`Deleted ${deleted.length} existing feature flags.`);
    
    // Reseed with updated flags
    const result = await subscriptionService.seedFeatureFlags();
    console.log(`Reseeded feature flags: ${result.count} new flags created`);
    
    console.log("Feature flags reset completed successfully.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error resetting feature flags:", error);
    process.exit(1);
  }
}

// Run the reset function
resetFeatureFlags();