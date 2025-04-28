import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Mock user for testing - database-independent
const mockUser: Express.User = {
  id: 1,
  username: "test",
  password: "password",
  email: "test@example.com",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  isSubscribed: true,
  subscriptionTier: "premium",
  createdAt: new Date()
};

declare global {
  namespace Express {
    // Extend Express.User with our User schema type
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      isSubscribed?: boolean | null;
      subscriptionTier?: string | null;
      createdAt?: Date | null;
    }
  }
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "asistreamSessionSecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Mock authentication strategy - always succeeds
  passport.use(
    new LocalStrategy((username, password, done) => {
      // Always succeed authentication with mock user
      return done(null, mockUser);
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    // Always return mock user
    done(null, mockUser);
  });

  // Register authentication routes
  app.post("/api/register", (req, res) => {
    // Always succeed with mock user
    req.login(mockUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to register user" });
      }
      
      res.status(201).json({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        isSubscribed: mockUser.isSubscribed,
        subscriptionTier: mockUser.subscriptionTier,
      });
    });
  });

  app.post("/api/login", (req, res) => {
    // Always succeed login with mock user
    req.login(mockUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to login" });
      }
      
      res.status(200).json({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        isSubscribed: mockUser.isSubscribed,
        subscriptionTier: mockUser.subscriptionTier,
      });
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      isSubscribed: mockUser.isSubscribed,
      subscriptionTier: mockUser.subscriptionTier,
    });
  });
}