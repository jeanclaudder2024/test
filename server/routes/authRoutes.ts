import { Router } from 'express';
import { db } from '../db';
import { 
  users, 
  userSubscriptions, 
  registerSchema, 
  loginSchema,
  emailVerificationSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  resendVerificationSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  calculateTrialEndDate,
  authenticateToken,
  AuthenticatedRequest 
} from '../auth';
import { emailService } from '../services/emailService';
import passport from '../config/passport';
import crypto from 'crypto';

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

    // Generate email verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'user',
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        provider: 'email'
      })
      .returning();

    // Create subscription with 3-day trial
    const trialStartDate = new Date();
    const trialEndDate = calculateTrialEndDate();

    await db
      .insert(userSubscriptions)
      .values({
        userId: newUser.id,
        planId: 1, // Default trial plan ID
        trialStartDate,
        trialEndDate,
        status: 'trial'
      });

    // Generate token
    const token = generateToken(newUser);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        newUser.email,
        newUser.firstName || 'User',
        verificationToken
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Return user data without password
    const { password, emailVerificationToken, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutPassword,
      token,
      trialEndDate: trialEndDate.toISOString(),
      requiresEmailVerification: true
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

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Return user data without password
    const { password, emailVerificationToken, resetPasswordToken, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      subscription,
      trialExpired,
      requiresEmailVerification: !user.isEmailVerified
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

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/login?error=oauth_failed`);
      }

      // Generate JWT token
      const token = generateToken(user);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/login?error=oauth_error`);
    }
  }
);

// Email verification
router.post('/verify-email', async (req, res) => {
  try {
    const validatedData = emailVerificationSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.emailVerificationToken, validatedData.token),
        eq(users.isEmailVerified, false)
      ))
      .limit(1);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Check if token has expired
    if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Mark email as verified
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      })
      .where(eq(users.id, user.id));

    res.json({ message: 'Email verified successfully' });

  } catch (error: any) {
    console.error('Email verification error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const validatedData = resendVerificationSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, validatedData.email),
        eq(users.isEmailVerified, false)
      ))
      .limit(1);

    if (!user) {
      return res.status(400).json({ message: 'User not found or already verified' });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      })
      .where(eq(users.id, user.id));

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.firstName || 'User',
      verificationToken
    );

    res.json({ message: 'Verification email sent' });

  } catch (error: any) {
    console.error('Resend verification error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const validatedData = passwordResetRequestSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      })
      .where(eq(users.id, user.id));

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName || 'User',
      resetToken
    );

    res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });

  } catch (error: any) {
    console.error('Password reset request error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, validatedData.token))
      .limit(1);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password reset successfully' });

  } catch (error: any) {
    console.error('Password reset error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;