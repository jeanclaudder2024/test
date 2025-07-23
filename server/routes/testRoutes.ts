import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth';
import { storage } from '../storage';

const router = express.Router();

// Test endpoint to verify subscription system health
router.get('/api/test/subscription-health', async (req, res) => {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database: false,
        stripe: false,
        subscriptionPlans: false,
        authentication: false
      },
      details: {}
    };

    // Test 1: Database connectivity
    try {
      const plans = await storage.getSubscriptionPlans();
      healthCheck.checks.database = true;
      healthCheck.checks.subscriptionPlans = plans.length > 0;
      healthCheck.details.subscriptionPlans = `${plans.length} plans available`;
    } catch (error) {
      healthCheck.details.database = `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Test 2: Stripe configuration
    try {
      const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
      healthCheck.checks.stripe = hasStripeKey;
      healthCheck.details.stripe = hasStripeKey ? 'Stripe configured' : 'Missing STRIPE_SECRET_KEY';
    } catch (error) {
      healthCheck.details.stripe = `Stripe error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Overall health status
    const allChecksPass = Object.values(healthCheck.checks).every(check => check === true);
    healthCheck.status = allChecksPass ? 'healthy' : 'degraded';

    res.json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to create a test checkout session (requires auth)
router.post('/api/test/create-checkout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { planId = 2, interval = 'month' } = req.body;
    
    // Get user details
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get plan details
    const plan = await storage.getSubscriptionPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Simulate Stripe checkout session creation without actual Stripe service
    const session = {
      id: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/test_session_${Date.now()}`
    };

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      planDetails: {
        name: plan.name,
        price: plan.price,
        interval
      },
      testDetails: {
        userId: req.user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test checkout creation failed:', error);
    res.status(500).json({
      error: 'Failed to create test checkout session',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to verify user authentication and subscription status
router.get('/api/test/user-status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's subscription
    const subscription = await storage.getUserSubscription(req.user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt
      },
      subscription: subscription ? {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User status check failed:', error);
    res.status(500).json({
      error: 'Failed to get user status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for subscription plans
router.get('/api/test/plans', async (req, res) => {
  try {
    const plans = await storage.getSubscriptionPlans();
    
    res.json({
      success: true,
      count: plans.length,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        trialDays: plan.trialDays,
        features: plan.features,
        isActive: plan.isActive
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Plans test failed:', error);
    res.status(500).json({
      error: 'Failed to load subscription plans',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;