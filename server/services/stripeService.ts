import Stripe from "stripe";
import { storage } from "../storage";
import { User } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment features will not work correctly.');
}

// @ts-ignore - stripe-js types might be out of date, but the API works
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2023-10-16" as any,
});

export const stripeService = {
  /**
   * Create a payment intent for a one-time payment
   */
  createPaymentIntent: async (amount: number, currency: string = "usd"): Promise<Stripe.PaymentIntent> => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      });
      return paymentIntent;
    } catch (error: any) {
      console.error("Error creating payment intent:", error.message);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  },

  /**
   * Get or create a subscription for a user
   */
  getOrCreateSubscription: async (userId: number, priceId: string): Promise<{
    subscriptionId: string;
    clientSecret?: string | null;
  }> => {
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        throw new Error("User not found");
      }

      // If the user already has a subscription, retrieve it
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        return {
          subscriptionId: subscription.id,
          // @ts-ignore - Stripe types issue
          clientSecret: subscription.latest_invoice?.payment_intent
            // @ts-ignore - Stripe types issue
            ? subscription.latest_invoice.payment_intent.client_secret
            : null,
        };
      }
      
      if (!user.email) {
        throw new Error("User email is required for subscription");
      }

      // Create a new customer if the user doesn't have a Stripe customer ID
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        customerId = customer.id;
        
        // Update the user with the new customer ID
        await storage.updateUser(userId, { 
          stripeCustomerId: customerId 
        });
      }

      // Create a new subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      // Update the user with the subscription ID
      await storage.updateUser(userId, {
        stripeSubscriptionId: subscription.id,
        isSubscribed: true,
        subscriptionTier: "pro", // Set the appropriate tier based on the priceId
      });

      return {
        subscriptionId: subscription.id,
        // @ts-ignore - Stripe types issue
        clientSecret: subscription.latest_invoice?.payment_intent
          // @ts-ignore - Stripe types issue
          ? subscription.latest_invoice.payment_intent.client_secret
          : null,
      };
    } catch (error: any) {
      console.error("Error creating subscription:", error.message);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },

  /**
   * Cancel a user's subscription
   */
  cancelSubscription: async (userId: number): Promise<boolean> => {
    try {
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        throw new Error("User has no active subscription");
      }

      // @ts-ignore - Stripe types issue
      await stripe.subscriptions.del(user.stripeSubscriptionId);
      
      // Update the user to reflect the cancelled subscription
      await storage.updateUser(userId, {
        isSubscribed: false,
        stripeSubscriptionId: null,
      });

      return true;
    } catch (error: any) {
      console.error("Error cancelling subscription:", error.message);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  },

  /**
   * Handle Stripe webhook events
   */
  handleWebhookEvent: async (event: Stripe.Event): Promise<void> => {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          // Handle successful checkout
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          // @ts-ignore - Stripe types issue
          if (invoice.subscription && invoice.customer) {
            // Update the user's subscription status
            const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
            if (user) {
              await storage.updateUser(user.id, {
                isSubscribed: true,
                subscriptionTier: 'pro', // Set based on the subscription
              });
            }
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          // Handle failed payment
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          // Handle subscription cancellation
          if (subscription.customer) {
            const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
            if (user) {
              await storage.updateUser(user.id, {
                isSubscribed: false,
                stripeSubscriptionId: null,
              });
            }
          }
          break;
        }
      }
    } catch (error: any) {
      console.error("Error handling webhook event:", error.message);
      throw new Error(`Failed to handle webhook event: ${error.message}`);
    }
  },
};