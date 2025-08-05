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
    
    // Use dynamic pricing instead of fixed Stripe price IDs for demo/development
    // This allows the payment system to work without creating specific Stripe products
    const planPricing: Record<string, { amount: number; name: string; description: string }> = {
      '1': { amount: 0, name: 'Free Trial', description: 'Free trial access to PetroDealHub' },
      '2': { amount: 2900, name: 'Basic Plan', description: 'Basic access to maritime trading tools' }, // $29/month
      '3': { amount: 9900, name: 'Professional Plan', description: 'Professional maritime trading platform' }, // $99/month
      '4': { amount: 19900, name: 'Enterprise Plan', description: 'Full enterprise maritime solution' }, // $199/month
      '5': { amount: 28000, name: 'Broker Premium', description: 'Premium broker certification and tools' }, // $280/month
    };

    const planInfo = planPricing[planId.toString()];
    
    if (!planInfo) {
      throw new Error(`No pricing found for plan ${planId}`);
    }

    // Calculate yearly pricing (20% discount)
    const finalAmount = interval === 'year' ? Math.round(planInfo.amount * 12 * 0.8) : planInfo.amount;

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planInfo.name,
              description: planInfo.description,
            },
            unit_amount: finalAmount,
            recurring: {
              interval: interval === 'year' ? 'year' : 'month',
            },
          },
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