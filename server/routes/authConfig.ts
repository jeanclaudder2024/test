import { Router } from 'express';

export const authConfigRouter = Router();

/**
 * @route GET /api/auth/config
 * @description Get public auth configuration (Clerk publishable key)
 * @access Public
 */
authConfigRouter.get('/config', (req, res) => {
  // This route provides the Clerk publishable key to the client
  // It's safe to expose this key as it's meant to be used in client-side code
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || '';
  
  res.json({
    clerkPublishableKey
  });
});