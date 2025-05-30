import express, { Request, Response } from 'express';
import { subscriptionService, stripe } from '../services/subscription-service';
import { storage } from '../storage';
import Stripe from 'stripe';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// GET subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
});

// GET subscription plan by ID
router.get('/plans/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }
    
    const plan = await storage.getSubscriptionPlanById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    res.status(500).json({ message: 'Error fetching subscription plan' });
  }
});

// GET current user's active subscription
router.get('/current', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const subscription = await storage.getActiveSubscriptionByUserId(userId);
    if (!subscription) {
      return res.json({ active: false });
    }
    
    // Get subscription plan details
    const plan = await storage.getSubscriptionPlanById(subscription.planId);
    
    res.json({
      active: true,
      subscription: {
        ...subscription,
        plan,
      }
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    res.status(500).json({ message: 'Error fetching current subscription' });
  }
});

// POST create checkout session
router.post('/create-checkout-session', requireAuth, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const schema = z.object({
      planId: z.number(),
      interval: z.enum(['month', 'year']),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = fromZodError(result.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const { planId, interval } = result.data;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await storage.getActiveSubscriptionByUserId(userId);
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }
    
    // Create checkout session
    const session = await subscriptionService.createCheckoutSession(userId, planId, interval);
    
    res.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: `Error creating checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// POST create portal session for managing subscription
router.post('/create-portal-session', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if user has a subscription
    const subscription = await storage.getActiveSubscriptionByUserId(userId);
    if (!subscription) {
      return res.status(400).json({ message: 'No active subscription found' });
    }
    
    // Create portal session
    const session = await subscriptionService.createPortalSession(userId);
    
    res.json(session);
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: `Error creating portal session: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// POST create subscription with existing payment method
router.post('/create-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const schema = z.object({
      planId: z.number(),
      paymentMethodId: z.string(),
      interval: z.enum(['month', 'year']),
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = fromZodError(result.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const { planId, paymentMethodId, interval } = result.data;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await storage.getActiveSubscriptionByUserId(userId);
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }
    
    // Create subscription
    const subscription = await subscriptionService.createSubscription(userId, planId, paymentMethodId, interval);
    
    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: `Error creating subscription: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// POST cancel subscription
router.post('/cancel-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Cancel subscription
    const result = await subscriptionService.cancelSubscription(userId);
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: `Error cancelling subscription: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// GET user's payment methods
router.get('/payment-methods', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const paymentMethods = await storage.getPaymentMethods(userId);
    
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
});

// GET user's invoices
router.get('/invoices', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const invoices = await storage.getInvoices(userId);
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// POST webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  let event: Stripe.Event;
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    if (webhookSecret) {
      // Verify the webhook signature
      const signature = req.headers['stripe-signature'] as string;
      
      try {
        if (!signature) {
          throw new Error('Missing Stripe signature');
        }
        
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      // If no webhook secret, construct event from request body
      event = req.body as Stripe.Event;
    }
    
    // Handle the event
    await subscriptionService.handleWebhookEvent(event);
    
    // Return a 200 success response
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: `Error handling webhook: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

export const subscriptionRouter = router;