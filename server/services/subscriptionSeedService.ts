import { db } from "../db";
import { 
  subscriptionPlans, 
  featureFlags,
  InsertSubscriptionPlan,
  InsertFeatureFlag
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed default subscription plans if none exist
 */
export async function seedSubscriptionPlans(): Promise<{ count: number, seeded: boolean }> {
  try {
    // Check if any plans already exist
    const existingPlans = await db.select({ count: db.fn.count() }).from(subscriptionPlans);
    const count = Number(existingPlans[0]?.count || 0);
    
    if (count > 0) {
      console.log(`Database already contains ${count} subscription plans.`);
      return { count, seeded: false };
    }
    
    console.log("No subscription plans in database. Adding default plans...");
    
    // Default plans
    const defaultPlans: InsertSubscriptionPlan[] = [
      {
        name: "Free",
        description: "Basic access to vessel tracking",
        price: "0",
        interval: "monthly",
        features: ["Basic vessel tracking", "View vessel details", "Region filtering"],
        stripePriceId: null,
        isActive: true
      },
      {
        name: "Standard",
        description: "Enhanced access with document generation",
        price: "19.99",
        interval: "monthly",
        features: [
          "All Free features",
          "Document generation",
          "Advanced vessel filtering",
          "Refinery data access"
        ],
        stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID || null,
        isActive: true
      },
      {
        name: "Premium",
        description: "Full access to all features including AI Assistant",
        price: "49.99",
        interval: "monthly",
        features: [
          "All Standard features",
          "AI Assistant",
          "Unlimited document generation",
          "Priority support",
          "Data export"
        ],
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || null,
        isActive: true
      }
    ];
    
    // Insert default plans
    const result = await db.insert(subscriptionPlans).values(defaultPlans).returning();
    console.log(`Added ${result.length} subscription plans.`);
    
    return { count: result.length, seeded: true };
    
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
    throw error;
  }
}

/**
 * Seed default feature flags if none exist
 */
export async function seedFeatureFlags(): Promise<{ count: number, seeded: boolean }> {
  try {
    // Check if any feature flags already exist
    const existingFlags = await db.select({ count: db.fn.count() }).from(featureFlags);
    const count = Number(existingFlags[0]?.count || 0);
    
    if (count > 0) {
      console.log(`Database already contains ${count} feature flags.`);
      return { count, seeded: false };
    }
    
    console.log("No feature flags in database. Adding default flags...");
    
    // Default feature flags
    const defaultFlags: InsertFeatureFlag[] = [
      {
        featureName: "vessel_tracking",
        description: "Basic vessel tracking functionality",
        isEnabled: true,
        requiredSubscription: null // Available on all plans
      },
      {
        featureName: "vessel_filtering",
        description: "Advanced vessel filtering and search",
        isEnabled: true,
        requiredSubscription: null // Available on all plans
      },
      {
        featureName: "document_generation",
        description: "Generate shipping documents",
        isEnabled: true,
        requiredSubscription: "Standard" // Requires at least Standard plan
      },
      {
        featureName: "ai_assistant",
        description: "AI-powered assistant for maritime insights",
        isEnabled: true,
        requiredSubscription: "Premium" // Requires Premium plan
      },
      {
        featureName: "data_export",
        description: "Export vessel and refinery data",
        isEnabled: true,
        requiredSubscription: "Premium" // Requires Premium plan
      }
    ];
    
    // Insert default feature flags
    const result = await db.insert(featureFlags).values(defaultFlags).returning();
    console.log(`Added ${result.length} feature flags.`);
    
    return { count: result.length, seeded: true };
    
  } catch (error) {
    console.error("Error seeding feature flags:", error);
    throw error;
  }
}

/**
 * Subscription service that handles subscription-related functionality
 */
export const subscriptionService = {
  seedSubscriptionPlans,
  seedFeatureFlags,
  
  /**
   * Initialize all subscription data (plans and feature flags)
   */
  async seedSubscriptionData(): Promise<{ plans: number, flags: number }> {
    const planResult = await seedSubscriptionPlans();
    const flagResult = await seedFeatureFlags();
    
    return {
      plans: planResult.count,
      flags: flagResult.count
    };
  }
};