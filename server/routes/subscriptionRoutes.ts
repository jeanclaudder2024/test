import type { Express } from "express";
import { storage } from "../storage";
import { authenticateToken } from "../auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export function registerSubscriptionRoutes(app: Express) {
  // Get current subscription
  app.get('/api/subscriptions/current', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json({ active: false });
      }

      const subscriptionDetails = await storage.getSubscriptionDetails(subscription.id);
      res.json({
        active: true,
        subscription: subscriptionDetails
      });
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Get user invoices
  app.get('/api/subscriptions/invoices', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  // Get user payment methods
  app.get('/api/subscriptions/payment-methods', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
  });

  // Create Stripe customer portal session
  app.post('/api/subscriptions/create-portal-session', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: 'No Stripe customer ID found' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  // Get subscription plans
  app.get('/api/subscriptions/plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  });

  // Create checkout session
  app.post('/api/subscriptions/create-checkout-session', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { planId } = req.body;
      
      const user = await storage.getUserById(userId);
      const plan = await storage.getSubscriptionPlanById(planId);
      
      if (!user || !plan) {
        return res.status(400).json({ error: 'Invalid user or plan' });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              recurring: {
                interval: plan.interval === 'monthly' ? 'month' : 'year',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
        metadata: {
          userId: userId.toString(),
          planId: planId.toString(),
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Handle Stripe webhooks
  app.post('/api/subscriptions/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.userId || '0');
          const planId = parseInt(session.metadata?.planId || '0');
          
          if (userId && planId) {
            // Create user subscription record that matches the userSubscriptions schema
            const subscriptionData = {
              userId,
              planId,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5-day trial
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              cancelAtPeriodEnd: false,
            };

            try {
              await storage.createUserSubscription(subscriptionData);
              console.log('User subscription created successfully for user:', userId);
            } catch (error) {
              console.error('Failed to create user subscription:', error);
            }
          }
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await storage.updateUserSubscriptionByStripeId(subscription.id, {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.customer && invoice.subscription) {
            await storage.createPayment({
              userId: 0, // Will be updated based on customer
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: 'succeeded',
              stripePaymentId: invoice.id,
              description: invoice.description || 'Subscription payment',
            });
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });
}