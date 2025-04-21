import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { 
  subscriptionPlans, 
  featureFlags, 
  users as userTable, 
  vessels as vesselTable, 
  refineries as refineryTable, 
  brokers as brokerTable 
} from "@shared/schema";
import { z } from "zod";

export const adminRouter = Router();

// Middleware to check if user is an admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = req.user;
  // Check if user has admin role based on fields in the User type
  if (!(user.isAdmin === true || (user.role && ['admin', 'superadmin'].includes(user.role as string)))) {
    return res.status(403).json({ message: "Unauthorized - Admin access required" });
  }

  next();
};

// Apply admin middleware to all routes
adminRouter.use(requireAdmin);

// Get all users
adminRouter.get("/users", async (req, res) => {
  try {
    const users = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    
    // Don't send sensitive data like passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update user (admin only)
adminRouter.patch("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isAdmin, role, isSubscribed, subscriptionTier } = req.body;
    
    // Only update allowed fields through admin panel
    const updatedUser = await storage.updateUser(userId, {
      isAdmin,
      role,
      isSubscribed,
      subscriptionTier
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Subscription Plans
adminRouter.get("/subscription-plans", async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.price);
    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Error fetching subscription plans" });
  }
});

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .transform(val => val.toString()), // Convert to string for Drizzle
  interval: z.string().refine(val => ['monthly', 'yearly'].includes(val), {
    message: "Interval must be 'monthly' or 'yearly'"
  }),
  features: z.array(z.string()).optional(),
  stripePriceId: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

adminRouter.post("/subscription-plans", async (req, res) => {
  try {
    const validatedData = subscriptionPlanSchema.parse(req.body);
    
    const [newPlan] = await db.insert(subscriptionPlans)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating subscription plan" });
  }
});

adminRouter.patch("/subscription-plans/:id", async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const validatedData = subscriptionPlanSchema.partial().parse(req.body);
    
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, planId))
      .returning();
    
    if (!updatedPlan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }
    
    res.json(updatedPlan);
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating subscription plan" });
  }
});

// Feature Flags
adminRouter.get("/feature-flags", async (req, res) => {
  try {
    const flags = await db.select().from(featureFlags);
    res.json(flags);
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    res.status(500).json({ message: "Error fetching feature flags" });
  }
});

const featureFlagSchema = z.object({
  featureName: z.string().min(1, "Feature name is required"),
  description: z.string().optional(),
  isEnabled: z.boolean().optional().default(true),
  requiredSubscription: z.string().optional()
});

adminRouter.post("/feature-flags", async (req, res) => {
  try {
    const validatedData = featureFlagSchema.parse(req.body);
    
    const [newFlag] = await db.insert(featureFlags)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newFlag);
  } catch (error) {
    console.error("Error creating feature flag:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating feature flag" });
  }
});

adminRouter.patch("/feature-flags/:id", async (req, res) => {
  try {
    const flagId = parseInt(req.params.id);
    const validatedData = featureFlagSchema.partial().parse(req.body);
    
    const [updatedFlag] = await db.update(featureFlags)
      .set(validatedData)
      .where(eq(featureFlags.id, flagId))
      .returning();
    
    if (!updatedFlag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    
    res.json(updatedFlag);
  } catch (error) {
    console.error("Error updating feature flag:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating feature flag" });
  }
});

// Stats
adminRouter.get("/stats", async (req, res) => {
  try {
    // Use direct count methods instead of count property
    const users = await db.select().from(users);
    const userCount = users.length;
    const subscribedUsers = users.filter(user => user.isSubscribed === true);
    const subscribedUserCount = subscribedUsers.length;
    
    const allVessels = await db.select().from(vessels);
    const vesselCount = allVessels.length;
    
    const allRefineries = await db.select().from(refineries);
    const refineryCount = allRefineries.length;
    
    const allBrokers = await db.select().from(brokers);
    const brokerCount = allBrokers.length;
    
    res.json({
      users: {
        total: userCount,
        subscribed: subscribedUserCount,
        conversionRate: userCount > 0 ? (subscribedUserCount / userCount) * 100 : 0
      },
      vessels: vesselCount,
      refineries: refineryCount,
      brokers: brokerCount
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching admin stats" });
  }
});