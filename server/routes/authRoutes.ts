import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken, 
  calculateTrialEndDate,
  AuthRequest 
} from "../auth";

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Register endpoint
router.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Calculate trial end date (3 days from now)
    const trialEndDate = calculateTrialEndDate();

    // Create user with trial subscription
    const newUser = await storage.createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone || null,
      role: "user",
      subscriptionStatus: "trial",
      trialStartDate: new Date(),
      trialEndDate,
      isActive: true,
    });

    // Generate token
    const token = generateToken(newUser);

    // Return user data without password
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
      trialDaysRemaining: 3
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
router.post("/api/auth/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Generate token
    const token = generateToken(user);

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (user.subscriptionStatus === "trial" && user.trialEndDate) {
      const now = new Date();
      const timeRemaining = user.trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
      trialDaysRemaining
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// OAuth-compatible user profile endpoint - no infinite loops
router.get("/api/auth/me", async (req: any, res) => {
  try {
    // Return null for unauthenticated users (OAuth will handle redirect)
    if (!req.user || !req.user.claims) {
      return res.status(401).json(null);
    }

    // For OAuth, we'll get user ID from claims
    const userId = req.user.claims.sub;
    
    // Find user by OAuth ID (string-based for OAuth)
    const users = await storage.getAllUsers();
    const user = users.find(u => u.providerId === userId);
    
    if (!user) {
      // Create a default user record for OAuth users
      const newUser = {
        id: Date.now(), // temporary ID
        username: req.user.claims.email || `user_${userId}`,
        email: req.user.claims.email || null,
        role: "user",
        subscriptionStatus: "trial",
        trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days trial
        displayName: req.user.claims.first_name || req.user.claims.email,
        photoURL: req.user.claims.profile_image_url,
        provider: "oauth",
        providerId: userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.json(newUser);
    }

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (user.subscriptionStatus === "trial" && user.trialEndDate) {
      const now = new Date();
      const timeRemaining = user.trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
    }

    // Check subscription status
    const now = new Date();
    let subscriptionActive = false;
    
    if (user.role === "admin") {
      subscriptionActive = true;
    } else if (user.subscriptionStatus === "trial" && user.trialEndDate && now <= user.trialEndDate) {
      subscriptionActive = true;
    } else if (user.subscriptionStatus === "active" && user.subscriptionEndDate && now <= user.subscriptionEndDate) {
      subscriptionActive = true;
    }

    const { password, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      trialDaysRemaining,
      subscriptionActive,
      accessLevel: user.role === "admin" ? "admin" : (subscriptionActive ? "full" : "expired")
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout endpoint
router.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
  // Since we're using JWT, we can't invalidate the token server-side
  // In a production app, you might want to maintain a blacklist of tokens
  res.json({ message: "Logout successful" });
});

// Check subscription status
router.get("/api/auth/subscription-status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    let trialDaysRemaining = 0;
    let subscriptionActive = false;

    // Admin always has access
    if (user.role === "admin") {
      subscriptionActive = true;
    } else if (user.subscriptionStatus === "trial" && user.trialEndDate) {
      const timeRemaining = user.trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
      subscriptionActive = now <= user.trialEndDate;
    } else if (user.subscriptionStatus === "active" && user.subscriptionEndDate) {
      subscriptionActive = now <= user.subscriptionEndDate;
    }

    res.json({
      subscriptionStatus: user.subscriptionStatus,
      trialDaysRemaining,
      subscriptionActive,
      role: user.role,
      trialExpired: user.subscriptionStatus === "trial" && user.trialEndDate && now > user.trialEndDate
    });

  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as authRouter };