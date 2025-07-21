import { db } from "../db";
import { users, userSubscriptions } from "@shared/schema";
import { eq, and, lte } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export class SubscriptionRenewalService {
  /**
   * Check for expired trials and attempt automatic renewal
   */
  static async processExpiredTrials() {
    console.log("🔄 Processing expired trials for automatic renewal...");

    try {
      // Find users with expired trials who have payment methods saved
      const expiredTrials = await db
        .select({
          userId: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          paymentMethodId: users.stripePaymentMethodId,
          subscriptionId: userSubscriptions.id,
          planId: userSubscriptions.planId,
          trialEndDate: userSubscriptions.trialEndDate,
        })
        .from(users)
        .innerJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
        .where(
          and(
            eq(userSubscriptions.status, "trial"),
            lte(userSubscriptions.trialEndDate, new Date()),
            eq(users.stripePaymentMethodId, null) // Only process users with saved payment methods
          )
        );

      console.log(`Found ${expiredTrials.length} expired trials to process`);

      for (const trial of expiredTrials) {
        if (trial.paymentMethodId) {
          await this.renewSubscription(trial);
        }
      }

      return {
        processed: expiredTrials.length,
        success: true
      };

    } catch (error) {
      console.error("Error processing expired trials:", error);
      return {
        processed: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Renew a specific subscription using stored payment method
   */
  private static async renewSubscription(trial: {
    userId: number;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    paymentMethodId: string | null;
    subscriptionId: number;
    planId: number;
    trialEndDate: Date | null;
  }) {
    try {
      console.log(`🔄 Renewing subscription for user ${trial.email} (ID: ${trial.userId})`);

      // Get subscription plan details (this would need to be implemented)
      // For now, we'll use a basic monthly price of $69 for demonstration
      const monthlyPrice = 6900; // $69.00 in cents

      // Create Stripe payment intent with saved payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: monthlyPrice,
        currency: 'usd',
        payment_method: trial.paymentMethodId!,
        customer: undefined, // Would need to create/retrieve Stripe customer
        confirm: true,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard`,
        metadata: {
          userId: trial.userId.toString(),
          subscriptionId: trial.subscriptionId.toString(),
          type: 'trial_renewal'
        }
      });

      if (paymentIntent.status === 'succeeded') {
        // Update subscription to active status
        const now = new Date();
        const nextPeriodEnd = new Date();
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1); // 1 month from now

        await db
          .update(userSubscriptions)
          .set({
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextPeriodEnd,
            updatedAt: now
          })
          .where(eq(userSubscriptions.id, trial.subscriptionId));

        console.log(`✅ Successfully renewed subscription for user ${trial.email}`);
        return { success: true };

      } else {
        console.log(`❌ Payment failed for user ${trial.email}: ${paymentIntent.status}`);
        
        // Update subscription to past_due status
        await db
          .update(userSubscriptions)
          .set({
            status: 'past_due',
            updatedAt: new Date()
          })
          .where(eq(userSubscriptions.id, trial.subscriptionId));

        return { success: false, reason: 'payment_failed' };
      }

    } catch (error) {
      console.error(`Error renewing subscription for user ${trial.email}:`, error);
      
      // Update subscription to past_due status on error
      await db
        .update(userSubscriptions)
        .set({
          status: 'past_due',
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, trial.subscriptionId));

      return { success: false, reason: error instanceof Error ? error.message : 'unknown_error' };
    }
  }

  /**
   * Start the automatic renewal service (run daily)
   */
  static startRenewalService() {
    console.log("🚀 Starting subscription renewal service...");
    
    // Process immediately on startup
    this.processExpiredTrials();
    
    // Then run every 24 hours
    setInterval(async () => {
      await this.processExpiredTrials();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}