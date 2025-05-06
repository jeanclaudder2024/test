import { Request, Response, Express } from 'express';
import { admin } from '../services/firebaseAdmin';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const setupFirebaseAuthRoutes = (app: Express) => {
  // Endpoint to verify Firebase token and save user to MySQL database
  app.post('/api/auth/token', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'No ID token provided' });
      }
      
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;
      
      // Check if user already exists in our database
      const [existingUser] = await db.select().from(users).where(eq(users.providerId, firebaseUid));
      
      if (existingUser) {
        // User exists, update last login time
        await db.update(users)
          .set({ 
            lastLogin: new Date() 
          })
          .where(eq(users.id, existingUser.id));
          
        return res.status(200).json({ 
          user: existingUser,
          message: 'User authenticated successfully' 
        });
      }
      
      // User doesn't exist yet, create a new user record
      const newUser = {
        email: decodedToken.email || '',
        username: decodedToken.email ? decodedToken.email.split('@')[0] : `user_${Date.now()}`,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || null,
        photoURL: decodedToken.picture || null,
        provider: 'firebase',
        providerId: firebaseUid,
        phone: decodedToken.phone_number || null,
        password: null, // Firebase handles auth, no need for password
        isSubscribed: false,
        subscriptionTier: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date()
      };
      
      // Insert the new user
      const [createdUser] = await db.insert(users).values(newUser);
      
      // Set the user in the session
      if (req.session) {
        req.session.userId = createdUser.id;
      }
      
      return res.status(201).json({ 
        user: createdUser,
        message: 'New user created successfully'
      });
    } catch (error) {
      console.error('Firebase authentication error:', error);
      res.status(401).json({ 
        message: 'Authentication failed',
        error: error.message
      });
    }
  });

  // Google Sign In specific endpoint
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'No Google ID token provided' });
      }
      
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Make sure it's from Google
      if (!decodedToken.firebase.sign_in_provider.includes('google')) {
        return res.status(400).json({ message: 'Not a Google authentication' });
      }
      
      // Rest of the process is similar to the general token endpoint
      const firebaseUid = decodedToken.uid;
      
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.providerId, firebaseUid));
      
      if (existingUser) {
        // User exists, update last login
        await db.update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, existingUser.id));
          
        return res.status(200).json({ 
          user: existingUser,
          message: 'Google user authenticated successfully' 
        });
      }
      
      // User doesn't exist yet, create new user
      const newUser = {
        email: decodedToken.email || '',
        username: decodedToken.email ? decodedToken.email.split('@')[0] : `google_user_${Date.now()}`,
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
        provider: 'google',
        providerId: firebaseUid,
        phone: null,
        password: null,
        isSubscribed: false,
        subscriptionTier: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date()
      };
      
      // Insert the new user
      const [createdUser] = await db.insert(users).values(newUser);
      
      // Set the user in the session
      if (req.session) {
        req.session.userId = createdUser.id;
      }
      
      return res.status(201).json({ 
        user: createdUser,
        message: 'New Google user created successfully'
      });
    } catch (error) {
      console.error('Google authentication error:', error);
      res.status(401).json({ 
        message: 'Google authentication failed',
        error: error.message
      });
    }
  });

  // Phone Number Authentication endpoint
  app.post('/api/auth/phone', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'No phone auth token provided' });
      }
      
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Make sure it's from phone auth
      if (!decodedToken.firebase.sign_in_provider.includes('phone')) {
        return res.status(400).json({ message: 'Not a phone authentication' });
      }
      
      const firebaseUid = decodedToken.uid;
      const phoneNumber = decodedToken.phone_number;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number not found in token' });
      }
      
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.providerId, firebaseUid));
      
      if (existingUser) {
        // User exists, update last login and ensure phone is set
        await db.update(users)
          .set({ 
            lastLogin: new Date(),
            phone: phoneNumber 
          })
          .where(eq(users.id, existingUser.id));
          
        return res.status(200).json({ 
          user: existingUser,
          message: 'Phone user authenticated successfully' 
        });
      }
      
      // Normalize the phone number for username creation
      const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      
      // User doesn't exist yet, create new user
      const newUser = {
        email: null,
        username: `phone_${normalizedPhone}`,
        displayName: `User ${normalizedPhone.slice(-4)}`,
        photoURL: null,
        provider: 'phone',
        providerId: firebaseUid,
        phone: phoneNumber,
        password: null,
        isSubscribed: false,
        subscriptionTier: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date()
      };
      
      // Insert the new user
      const [createdUser] = await db.insert(users).values(newUser);
      
      // Set the user in the session
      if (req.session) {
        req.session.userId = createdUser.id;
      }
      
      return res.status(201).json({ 
        user: createdUser,
        message: 'New phone user created successfully'
      });
    } catch (error) {
      console.error('Phone authentication error:', error);
      res.status(401).json({ 
        message: 'Phone authentication failed',
        error: error.message
      });
    }
  });
};