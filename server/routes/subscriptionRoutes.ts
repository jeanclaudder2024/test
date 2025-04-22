import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { 
  subscriptionPlans, 
  SubscriptionPlan,
  featureFlags,
  users
} from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10" as any,
});

export const subscriptionRouter = Router();

// Get all active subscription plans
subscriptionRouter.get("/subscription-plans", async (req, res) => {
  try {
    const plans = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
    
    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
});

// Get feature flags (public info only)
subscriptionRouter.get("/feature-flags", async (req, res) => {
  try {
    const flags = await db.select().from(featureFlags);
    
    // Only return non-sensitive data
    const publicFlags = flags.map(flag => ({
      id: flag.id,
      featureName: flag.featureName,
      description: flag.description,
      isEnabled: flag.isEnabled,
      requiredSubscription: flag.requiredSubscription
    }));
    
    res.json(publicFlags);
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    res.status(500).json({ message: "Failed to fetch feature flags" });
  }
});

// Subscribe to a plan
const subscriptionBodySchema = z.object({
  planId: z.number({
    required_error: "Plan ID is required",
    invalid_type_error: "Plan ID must be a number"
  }),
});

subscriptionRouter.post("/subscribe", async (req, res) => {
  // Authentication check
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    // Validate request body
    const { planId } = subscriptionBodySchema.parse(req.body);
    
    // Get the subscription plan
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));
    
    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }
    
    // If not active, reject
    if (!plan.isActive) {
      return res.status(400).json({ message: "This subscription plan is not currently available" });
    }
    
    const user = req.user;
    
    // Check if user already has this plan
    if (user.subscriptionTier === plan.name) {
      return res.status(400).json({ message: "You are already subscribed to this plan" });
    }
    
    // Free plan process (no payment)
    if (plan.name.toLowerCase() === 'free' || parseFloat(plan.price) === 0) {
      // Update user subscription status
      const updatedUser = await storage.updateUser(user.id, {
        isSubscribed: true,
        subscriptionTier: plan.name
      });
      
      return res.status(200).json({
        success: true,
        message: `Successfully subscribed to ${plan.name} plan`,
        user: updatedUser
      });
    }
    
    // Paid plan - check if we have stripe integration
    if (!plan.stripePriceId) {
      return res.status(400).json({ 
        message: "This plan requires payment processing which is not configured" 
      });
    }
    
    // Create or get customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: user.id.toString()
        }
      });
      
      customerId = customer.id;
      
      // Update user with customer ID
      await storage.updateUser(user.id, {
        stripeCustomerId: customerId
      });
    }
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?subscription=success`,
      cancel_url: `${req.headers.origin}/subscribe?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        planId: plan.id.toString(),
        planName: plan.name
      }
    });
    
    // Return the checkout URL
    res.json({ 
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error("Subscription error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to process subscription" });
  }
});

// Get subscription status
subscriptionRouter.get("/subscription-status", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = req.user;
    
    // Return basic subscription info
    return res.json({
      isSubscribed: user.isSubscribed || false,
      subscriptionTier: user.subscriptionTier || 'free',
      hasStripeCustomer: !!user.stripeCustomerId,
    });
    
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ message: "Failed to fetch subscription status" });
  }
});

// Cancel subscription
subscriptionRouter.post("/cancel-subscription", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = req.user;
    
    // If user has no stripe subscription, just reset subscription status
    if (!user.stripeSubscriptionId) {
      const updatedUser = await storage.updateUser(user.id, {
        isSubscribed: false,
        subscriptionTier: 'free'
      });
      
      return res.json({
        success: true,
        message: "Subscription canceled",
        user: updatedUser
      });
    }
    
    // Cancel the Stripe subscription
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    
    // Update user in our database
    const updatedUser = await storage.updateUser(user.id, {
      isSubscribed: false,
      subscriptionTier: 'free',
      stripeSubscriptionId: null
    });
    
    res.json({
      success: true,
      message: "Subscription canceled",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
});

// Webhook endpoint for Stripe events
subscriptionRouter.post("/webhook", async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook Error: No signature provided');
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : undefined;
      const planName = session.metadata?.planName;
      
      if (userId && planName) {
        // Update user subscription status
        await storage.updateUser(userId, {
          isSubscribed: true,
          subscriptionTier: planName,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null
        });
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      // Find user with this subscription ID
      const usersWithSubscription = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.stripePriceId, subscription.id));
      
      if (usersWithSubscription.length > 0) {
        // Find users with this subscription price
        const userRecords = await db.select()
          .from(users)
          .where(eq(users.stripeSubscriptionId, subscription.id));
        
        // Update each user's subscription status
        for (const user of userRecords) {
          await storage.updateUser(user.id, {
            isSubscribed: false,
            subscriptionTier: 'free',
            stripeSubscriptionId: null
          });
        }
      }
      break;
    }
  }
  
  res.status(200).send({ received: true });
});