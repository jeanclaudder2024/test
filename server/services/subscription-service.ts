import Stripe from 'stripe';
import { db } from '../db';
import { storage } from '../storage';
import {
  subscriptionPlans,
  subscriptions,
  paymentMethods,
  users,
  invoices
} from '@shared/schema';
import { eq } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe key: STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export interface SubscriptionService {
  createCheckoutSession(userId: number, planId: number, interval: 'month' | 'year'): Promise<{ url: string, sessionId: string }>;
  createPortalSession(userId: number): Promise<{ url: string }>;
  getOrCreateCustomer(userId: number): Promise<string>;
  createSubscription(userId: number, planId: number, paymentMethodId: string, interval: 'month' | 'year'): Promise<{ subscriptionId: string, clientSecret: string | null }>;
  cancelSubscription(userId: number): Promise<boolean>;
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
}

export class StripeSubscriptionService implements SubscriptionService {
  // Create a Stripe checkout session for a subscription
  async createCheckoutSession(userId: number, planId: number, interval: 'month' | 'year'): Promise<{ url: string, sessionId: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId);

      // Determine the price ID based on interval
      const priceId = interval === 'month' ? plan.monthlyPriceId : plan.yearlyPriceId;
      
      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/account/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing`,
        subscription_data: {
          trial_period_days: plan.trialDays,
          metadata: {
            userId: user.id.toString(),
            planId: plan.id.toString(),
          },
        },
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session');
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a customer portal session for managing subscription
  async createPortalSession(userId: number): Promise<{ url: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        throw new Error('User not found or no customer ID associated with user');
      }

      // Create a portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/account`,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error(`Failed to create portal session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get or create a customer in Stripe
  async getOrCreateCustomer(userId: number): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If user already has a customer ID, return it
      if (user.stripeCustomerId) {
        return user.stripeCustomerId;
      }

      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.username,
        metadata: {
          userId: user.id.toString(),
        },
      });

      // Update user with customer ID
      await storage.updateUser(userId, {
        stripeCustomerId: customer.id,
      });

      return customer.id;
    } catch (error) {
      console.error('Error getting or creating customer:', error);
      throw new Error(`Failed to get or create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create subscription with an existing payment method
  async createSubscription(
    userId: number,
    planId: number,
    paymentMethodId: string,
    interval: 'month' | 'year'
  ): Promise<{ subscriptionId: string; clientSecret: string | null }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Determine price ID based on interval
      const priceId = interval === 'month' ? plan.monthlyPriceId : plan.yearlyPriceId;

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: plan.trialDays,
        metadata: {
          userId: user.id.toString(),
          planId: plan.id.toString(),
        },
      });

      // Store subscription in database
      await storage.createSubscription({
        userId: user.id,
        planId: plan.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        interval: interval,
      });

      // Save payment method in database
      await storage.createPaymentMethod({
        userId: user.id,
        stripePaymentMethodId: paymentMethodId,
        type: 'card',
        isDefault: true,
      });

      // Get client secret for confirming the payment if needed
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;
      const clientSecret = paymentIntent?.client_secret || null;

      return {
        subscriptionId: subscription.id,
        clientSecret,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: number): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const subscription = await storage.getActiveSubscriptionByUserId(userId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      // Cancel subscription in Stripe (at period end)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update subscription in database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true,
      });

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Handle webhook events from Stripe
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error handling webhook event ${event.type}:`, error);
      throw new Error(`Failed to handle webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Handle subscription created event
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;

    if (!userId || !planId) {
      console.log('Subscription metadata missing user or plan ID');
      return;
    }

    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (existingSubscription) {
      console.log(`Subscription ${subscription.id} already exists in database`);
      return;
    }

    await storage.createSubscription({
      userId: parseInt(userId),
      planId: parseInt(planId),
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      interval: subscription.items.data[0]?.plan.interval as 'month' | 'year',
    });
  }

  // Handle subscription updated event
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (!existingSubscription) {
      console.log(`Subscription ${subscription.id} not found in database`);
      return;
    }

    await storage.updateSubscription(existingSubscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  // Handle subscription deleted event
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (!existingSubscription) {
      console.log(`Subscription ${subscription.id} not found in database`);
      return;
    }

    await storage.updateSubscription(existingSubscription.id, {
      status: 'canceled',
    });
  }

  // Handle invoice payment succeeded event
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription || typeof invoice.subscription !== 'string') {
      console.log('Invoice not associated with a subscription');
      return;
    }

    // Get subscription from database
    const subscription = await storage.getSubscriptionByStripeId(invoice.subscription);
    if (!subscription) {
      console.log(`Subscription ${invoice.subscription} not found in database`);
      return;
    }

    // Create invoice record
    await storage.createInvoice({
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: invoice.subscription,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status || 'paid',
      paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : new Date(),
      invoiceUrl: invoice.hosted_invoice_url || null,
      invoicePdf: invoice.invoice_pdf || null,
    });
  }

  // Handle invoice payment failed event
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription || typeof invoice.subscription !== 'string') {
      console.log('Invoice not associated with a subscription');
      return;
    }

    // Get subscription from database
    const subscription = await storage.getSubscriptionByStripeId(invoice.subscription);
    if (!subscription) {
      console.log(`Subscription ${invoice.subscription} not found in database`);
      return;
    }

    // Update subscription status to past_due
    await storage.updateSubscription(subscription.id, {
      status: 'past_due',
    });

    // Create invoice record
    await storage.createInvoice({
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: invoice.subscription,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status || 'open',
      invoiceUrl: invoice.hosted_invoice_url || null,
      invoicePdf: invoice.invoice_pdf || null,
    });
  }
}

export const subscriptionService = new StripeSubscriptionService();