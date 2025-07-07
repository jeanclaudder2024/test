import { Router } from 'express';
import { db } from '../db';
import { users, userSubscriptions, subscriptionPlans, registerSchema, loginSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  calculateTrialEndDate,
  authenticateToken,
  AuthenticatedRequest 
} from '../auth';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'user'
      })
      .returning();

    // Create subscription with 3-day trial
    const trialStartDate = new Date();
    const trialEndDate = calculateTrialEndDate();

    // Get the first available subscription plan
    const [defaultPlan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.id)
      .limit(1);

    if (!defaultPlan) {
      throw new Error('No subscription plans available');
    }

    await db
      .insert(userSubscriptions)
      .values({
        userId: newUser.id,
        planId: defaultPlan.id, // Use first available plan ID
        trialStartDate,
        trialEndDate,
        status: 'trial'
      });

    // Generate token
    const token = generateToken(newUser);

    // Return user data without password
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
      trialEndDate: trialEndDate.toISOString()
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get user subscription
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);

    // Check trial status
    const now = new Date();
    const trialExpired = subscription ? now > new Date(subscription.trialEndDate) : true;

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      subscription,
      trialExpired
    });

  } catch (error: any) {
    console.error('Login error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Get user subscription from database
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, req.user.id))
      .limit(1);

    const userSubscription = subscription[0] || null;
    
    // Check if trial is expired
    const trialExpired = userSubscription 
      ? new Date() > new Date(userSubscription.trialEndDate)
      : false;

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role
      },
      subscription: userSubscription,
      trialExpired
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;