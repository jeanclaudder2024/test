import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

interface CreateCheckoutSessionOptions {
  planId: number;
  userId: number;
  userEmail: string;
  interval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
}

export const stripeService = {
  // Create a checkout session for subscription
  async createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<Stripe.Checkout.Session> {
    const { planId, userId, userEmail, interval, successUrl, cancelUrl } = options;
    
    // In a real implementation, you would fetch the plan details from the database
    // For now, we'll use hardcoded Stripe price IDs based on plan
    const priceIdMap: Record<string, { month: string; year: string }> = {
      '1': { month: 'price_trial', year: 'price_trial_yearly' }, // Free Trial
      '2': { month: 'price_basic', year: 'price_basic_yearly' }, // Basic Plan
      '3': { month: 'price_pro', year: 'price_pro_yearly' }, // Pro Plan
      '4': { month: 'price_enterprise', year: 'price_enterprise_yearly' }, // Enterprise
      '5': { month: 'price_broker', year: 'price_broker_yearly' }, // Broker Premium
    };

    const priceId = priceIdMap[planId.toString()]?.[interval];
    
    if (!priceId) {
      throw new Error(`No Stripe price ID found for plan ${planId} with interval ${interval}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId: planId.toString(),
        userId: userId.toString(),
      },
      subscription_data: {
        metadata: {
          planId: planId.toString(),
          userId: userId.toString(),
        },
      },
    });

    return session;
  },

  // Create a customer portal session for subscription management
  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  },

  // Create or retrieve a customer
  async createOrRetrieveCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    // Try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      name,
    });
  },

  // Cancel a subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  },

  // Reactivate a subscription
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  },

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  // Handle webhook events
  async handleWebhook(
    payload: string | Buffer, 
    signature: string, 
    endpointSecret: string
  ): Promise<Stripe.Event> {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  },

  // Process subscription events
  async processSubscriptionEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);
        // Here you would update your database with the subscription status
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice:`, invoice.id);
        // Here you would update payment records
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice:`, failedInvoice.id);
        // Here you would handle failed payments
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  },
};

export default stripeService;