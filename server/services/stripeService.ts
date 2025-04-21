import Stripe from 'stripe';
import { storage } from '../storage';

// Initialize Stripe with the secret key from environment variables
// and handle errors gracefully
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } else {
    console.warn('STRIPE_SECRET_KEY not found in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

export const stripeService = {
  /**
   * Create a payment intent for a one-time payment
   */
  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  },

  /**
   * Get or create a subscription for a user
   */
  getOrCreateSubscription: async (userId: number, priceId: string) => {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // If the user already has a subscription, return it
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );

        return {
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as Stripe.Invoice)
            .payment_intent?.client_secret || null,
          status: subscription.status,
        };
      }

      // Otherwise, create a new customer and subscription
      if (!user.email) {
        throw new Error('User email is required for subscription');
      }

      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString(),
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { 
          stripeCustomerId: customerId 
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user.id.toString(),
        },
      });

      // Update user with subscription info
      await storage.updateUser(user.id, {
        stripeSubscriptionId: subscription.id,
      });

      // Return subscription details
      return {
        subscriptionId: subscription.id,
        clientSecret: ((subscription.latest_invoice as Stripe.Invoice)
          .payment_intent as Stripe.PaymentIntent).client_secret,
        status: subscription.status,
      };
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },

  /**
   * Cancel a user's subscription
   */
  cancelSubscription: async (userId: number) => {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        throw new Error('User or subscription not found');
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Stripe subscription cancellation error:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  },

  /**
   * Handle Stripe webhook events
   */
  handleWebhookEvent: async (event: Stripe.Event) => {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          // Handle successful checkout
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription as string
            );
            
            // Find user by Stripe customer ID
            const user = await storage.getUserByStripeCustomerId(
              subscription.customer as string
            );
            
            if (user) {
              // Update subscription status to active
              await storage.updateUser(user.id, {
                isSubscribed: true,
                subscriptionTier: 'premium', // or get from metadata
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
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(
            subscription.customer as string
          );
          
          if (user) {
            // Update subscription status
            await storage.updateUser(user.id, {
              isSubscribed: false,
              subscriptionTier: null,
            });
          }
          break;
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }
};