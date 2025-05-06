import Stripe from 'stripe';
import { storage } from '../storage';
import { db } from '../db';
import { User, InsertSubscription, Subscription, PaymentMethod, InsertPaymentMethod } from '@shared/schema';

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class SubscriptionService {
  /**
   * Creates a Stripe customer for a user
   */
  async createCustomer(user: User): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: user.id.toString(),
        },
      });

      // Update user with Stripe customer ID
      await storage.updateUser(user.id, { 
        stripeCustomerId: customer.id 
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  /**
   * Gets or creates a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: number): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    return this.createCustomer(user);
  }

  /**
   * Creates a Stripe Checkout session for a subscription
   */
  async createCheckoutSession(
    userId: number,
    planSlug: string,
    billingInterval: 'month' | 'year' = 'month',
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; sessionUrl: string }> {
    try {
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get subscription plan
      const plan = await storage.getSubscriptionPlanBySlug(planSlug);
      if (!plan) {
        throw new Error(`Subscription plan ${planSlug} not found`);
      }

      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(userId);

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: billingInterval === 'month' ? plan.monthlyPriceId : plan.yearlyPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            planId: plan.id.toString(),
            planSlug: plan.slug,
          },
          trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
        },
        metadata: {
          userId: userId.toString(),
          planId: plan.id.toString(),
          planSlug: plan.slug,
          billingInterval,
        },
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Creates a Stripe subscription
   */
  async createSubscription(
    userId: number,
    planId: number,
    paymentMethodId?: string,
    trialDays?: number
  ): Promise<Subscription> {
    try {
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get subscription plan
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(userId);

      // Create subscription parameters
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [
          {
            price: plan.monthlyPriceId, // Default to monthly
          },
        ],
        metadata: {
          userId: userId.toString(),
          planId: planId.toString(),
          planSlug: plan.slug,
        },
        expand: ['latest_invoice.payment_intent'],
      };

      // Add trial period if specified
      if (trialDays !== undefined && trialDays > 0) {
        subscriptionParams.trial_period_days = trialDays;
      } else if (plan.trialDays > 0) {
        subscriptionParams.trial_period_days = plan.trialDays;
      }

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create(subscriptionParams);

      // Create subscription record in database
      const insertSubscription: InsertSubscription = {
        userId,
        planId,
        status: subscription.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        billingInterval: 'month', // Default to monthly
      };

      const newSubscription = await storage.createSubscription(insertSubscription);

      // Update user subscription status
      await storage.updateUser(userId, {
        isSubscribed: true,
        subscriptionTier: plan.slug,
        stripeSubscriptionId: subscription.id,
      });

      return newSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Handles Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handles Stripe checkout session completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (!session.metadata?.userId || !session.metadata?.planId) {
      console.warn('Checkout session is missing required metadata');
      return;
    }

    const userId = parseInt(session.metadata.userId, 10);
    const planId = parseInt(session.metadata.planId, 10);
    const billingInterval = session.metadata.billingInterval as 'month' | 'year' || 'month';

    // Get subscription from Stripe
    if (!session.subscription) {
      console.warn('Checkout session is missing subscription');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string, 
      { expand: ['default_payment_method'] }
    );

    // Create subscription in database
    const insertSubscription: InsertSubscription = {
      userId,
      planId,
      status: subscription.status,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      billingInterval,
    };

    await storage.createSubscription(insertSubscription);

    // Update user subscription status
    const user = await storage.getUser(userId);
    if (user) {
      const plan = await storage.getSubscriptionPlanById(planId);
      await storage.updateUser(userId, {
        isSubscribed: true,
        subscriptionTier: plan?.slug || 'pro',
        stripeSubscriptionId: subscription.id,
      });
    }

    // Save payment method if available
    if (subscription.default_payment_method) {
      const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
      
      if (paymentMethod.card) {
        const insertPaymentMethod: InsertPaymentMethod = {
          userId,
          stripePaymentMethodId: paymentMethod.id,
          type: paymentMethod.type,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expiryMonth: paymentMethod.card.exp_month,
          expiryYear: paymentMethod.card.exp_year,
          isDefault: true,
        };

        await storage.createPaymentMethod(insertPaymentMethod);
      }
    }
  }

  /**
   * Handles Stripe subscription created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    if (!subscription.metadata?.userId || !subscription.metadata?.planId) {
      console.warn('Subscription is missing required metadata');
      return;
    }

    const userId = parseInt(subscription.metadata.userId, 10);
    const planId = parseInt(subscription.metadata.planId, 10);

    // Check if subscription already exists in database
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (existingSubscription) {
      // Update existing subscription
      await storage.updateSubscription(existingSubscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } else {
      // Create new subscription in database
      const insertSubscription: InsertSubscription = {
        userId,
        planId,
        status: subscription.status,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        billingInterval: 'month', // Default to monthly
      };

      await storage.createSubscription(insertSubscription);
    }

    // Update user subscription status
    const user = await storage.getUser(userId);
    if (user) {
      const plan = await storage.getSubscriptionPlanById(planId);
      await storage.updateUser(userId, {
        isSubscribed: true,
        subscriptionTier: plan?.slug || 'pro',
        stripeSubscriptionId: subscription.id,
      });
    }
  }

  /**
   * Handles Stripe subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Find subscription in database
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (!existingSubscription) {
      console.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription in database
    await storage.updateSubscription(existingSubscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Update user subscription status if needed
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      await storage.updateUser(existingSubscription.userId, {
        isSubscribed: true,
        stripeSubscriptionId: subscription.id,
      });
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await storage.updateUser(existingSubscription.userId, {
        isSubscribed: false,
        subscriptionTier: 'free',
        stripeSubscriptionId: null,
      });
    }
  }

  /**
   * Handles Stripe subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Find subscription in database
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (!existingSubscription) {
      console.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription status in database
    await storage.updateSubscription(existingSubscription.id, {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });

    // Update user subscription status
    await storage.updateUser(existingSubscription.userId, {
      isSubscribed: false,
      subscriptionTier: 'free',
      stripeSubscriptionId: null,
    });
  }

  /**
   * Handles Stripe invoice paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.customer || !invoice.subscription) {
      console.warn('Invoice is missing customer or subscription');
      return;
    }

    // Find user by Stripe customer ID
    const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
    if (!user) {
      console.warn(`User with Stripe customer ID ${invoice.customer} not found`);
      return;
    }

    // Check if invoice already exists in database
    const existingInvoice = await storage.getInvoiceByStripeId(invoice.id);
    if (existingInvoice) {
      await storage.updateInvoice(existingInvoice.id, {
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
      });
      return;
    }

    // Find subscription by Stripe subscription ID
    const subscription = await storage.getSubscriptionByStripeId(invoice.subscription as string);

    // Create invoice record in database
    await storage.createInvoice({
      userId: user.id,
      subscriptionId: subscription?.id,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer as string,
      amount: (invoice.total / 100).toString(), // Convert from cents to dollars
      currency: invoice.currency,
      status: invoice.status,
      billingReason: invoice.billing_reason,
      invoiceDate: new Date(invoice.created * 1000),
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      pdfUrl: invoice.invoice_pdf,
    });
  }

  /**
   * Handles Stripe invoice payment failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.customer || !invoice.subscription) {
      console.warn('Invoice is missing customer or subscription');
      return;
    }

    // Find user by Stripe customer ID
    const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
    if (!user) {
      console.warn(`User with Stripe customer ID ${invoice.customer} not found`);
      return;
    }

    // Find subscription by Stripe subscription ID
    const subscription = await storage.getSubscriptionByStripeId(invoice.subscription as string);
    if (subscription) {
      // Update subscription status in database
      await storage.updateSubscription(subscription.id, {
        status: 'past_due',
      });
    }

    // Check if invoice already exists in database
    const existingInvoice = await storage.getInvoiceByStripeId(invoice.id);
    if (existingInvoice) {
      await storage.updateInvoice(existingInvoice.id, {
        status: invoice.status,
      });
      return;
    }

    // Create invoice record in database
    await storage.createInvoice({
      userId: user.id,
      subscriptionId: subscription?.id,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer as string,
      amount: (invoice.total / 100).toString(), // Convert from cents to dollars
      currency: invoice.currency,
      status: invoice.status,
      billingReason: invoice.billing_reason,
      invoiceDate: new Date(invoice.created * 1000),
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      pdfUrl: invoice.invoice_pdf,
    });
  }

  /**
   * Handles Stripe payment method attached event
   */
  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    if (!paymentMethod.customer) {
      console.warn('Payment method is missing customer');
      return;
    }

    // Find user by Stripe customer ID
    const user = await storage.getUserByStripeCustomerId(paymentMethod.customer as string);
    if (!user) {
      console.warn(`User with Stripe customer ID ${paymentMethod.customer} not found`);
      return;
    }

    // Check if payment method already exists in database
    const existingPaymentMethods = await storage.getPaymentMethods(user.id);
    const isDefault = existingPaymentMethods.length === 0;

    // Create payment method record in database if it doesn't exist
    const existingPaymentMethod = existingPaymentMethods.find(
      (pm) => pm.stripePaymentMethodId === paymentMethod.id
    );

    if (!existingPaymentMethod && paymentMethod.card) {
      await storage.createPaymentMethod({
        userId: user.id,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
        isDefault,
      });
    }
  }

  /**
   * Cancels a subscription
   */
  async cancelSubscription(userId: number, atPeriodEnd: boolean = true): Promise<boolean> {
    try {
      // Find the active subscription for the user
      const subscription = await storage.getActiveSubscriptionByUserId(userId);
      if (!subscription) {
        throw new Error('No active subscription found for user');
      }

      // Cancel the subscription in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: atPeriodEnd,
      });

      // Update subscription in database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: atPeriodEnd,
        status: atPeriodEnd ? 'active' : 'canceled',
      });

      // If canceling immediately, update user subscription status
      if (!atPeriodEnd) {
        await storage.updateUser(userId, {
          isSubscribed: false,
          subscriptionTier: 'free',
          stripeSubscriptionId: null,
        });
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Reactivates a canceled subscription (if still in period)
   */
  async reactivateSubscription(userId: number): Promise<boolean> {
    try {
      // Find the canceled subscription for the user
      const subscription = await storage.getSubscriptionsByUserId(userId);
      const canceledSubscription = subscription.find(
        (sub) => sub.cancelAtPeriodEnd && sub.status === 'active'
      );

      if (!canceledSubscription) {
        throw new Error('No canceled subscription found for user');
      }

      // Reactivate the subscription in Stripe
      await stripe.subscriptions.update(canceledSubscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update subscription in database
      await storage.updateSubscription(canceledSubscription.id, {
        cancelAtPeriodEnd: false,
      });

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error(`Failed to reactivate subscription: ${error.message}`);
    }
  }

  /**
   * Updates a subscription plan
   */
  async updateSubscriptionPlan(
    userId: number,
    newPlanId: number,
    billingInterval?: 'month' | 'year'
  ): Promise<Subscription> {
    try {
      // Find the active subscription for the user
      const subscription = await storage.getActiveSubscriptionByUserId(userId);
      if (!subscription) {
        throw new Error('No active subscription found for user');
      }

      // Get the new plan
      const newPlan = await storage.getSubscriptionPlanById(newPlanId);
      if (!newPlan) {
        throw new Error('Subscription plan not found');
      }

      // Get the current Stripe subscription
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Get the price ID based on billing interval
      const priceId = billingInterval === 'year' ? newPlan.yearlyPriceId : newPlan.monthlyPriceId;

      // Update the subscription in Stripe
      const updatedStripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: priceId,
            },
          ],
          metadata: {
            ...stripeSubscription.metadata,
            planId: newPlanId.toString(),
            planSlug: newPlan.slug,
          },
        }
      );

      // Update subscription in database
      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        planId: newPlanId,
        status: updatedStripeSubscription.status,
        billingInterval: billingInterval || subscription.billingInterval,
        currentPeriodStart: new Date(updatedStripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(updatedStripeSubscription.current_period_end * 1000),
      });

      // Update user subscription tier
      await storage.updateUser(userId, {
        subscriptionTier: newPlan.slug,
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw new Error(`Failed to update subscription plan: ${error.message}`);
    }
  }

  /**
   * Gets customer portal URL for managing subscription
   */
  async getCustomerPortalUrl(userId: number, returnUrl: string): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        throw new Error('User not found or does not have a Stripe customer ID');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error(`Failed to create customer portal session: ${error.message}`);
    }
  }
}

export const subscriptionService = new SubscriptionService();