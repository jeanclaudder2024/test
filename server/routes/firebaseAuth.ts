import { Express, Request, Response } from 'express';
import { admin } from '../services/firebaseAdmin';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

export const setupFirebaseAuthRoutes = (app: Express) => {
  // Endpoint to create or login user with Firebase Google Auth
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { idToken, email, displayName, photoURL, uid } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'No ID token provided' });
      }
      
      // Verify the ID token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.uid !== uid) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Check if user exists in our database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.provider, 'google'))
        .where(eq(users.providerId, uid));
      
      if (existingUser) {
        // User exists, update their info and log them in
        const [updatedUser] = await db
          .update(users)
          .set({
            displayName,
            photoURL,
            lastLogin: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        
        // Set user in session
        req.session.userId = updatedUser.id;
        return res.status(200).json(updatedUser);
      } else {
        // User doesn't exist, create a new one
        const username = 'user_' + Math.random().toString(36).substring(2, 10);
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            username,
            displayName,
            photoURL,
            provider: 'google',
            providerId: uid,
            password: null, // Firebase users don't need passwords
            createdAt: new Date(),
          })
          .returning();
        
        // Set user in session
        req.session.userId = newUser.id;
        return res.status(201).json(newUser);
      }
    } catch (error) {
      console.error('Firebase auth error:', error);
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
  });
  
  // Endpoint to create or login user with Firebase Phone Auth
  app.post('/api/auth/phone', async (req: Request, res: Response) => {
    try {
      const { idToken, phoneNumber, uid } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'No ID token provided' });
      }
      
      // Verify the ID token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.uid !== uid) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Check if user exists in our database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.provider, 'phone'))
        .where(eq(users.providerId, uid));
      
      if (existingUser) {
        // User exists, update their info and log them in
        const [updatedUser] = await db
          .update(users)
          .set({
            phone: phoneNumber,
            lastLogin: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        
        // Set user in session
        req.session.userId = updatedUser.id;
        return res.status(200).json(updatedUser);
      } else {
        // User doesn't exist, create a new one
        const username = 'phone_user_' + Math.random().toString(36).substring(2, 10);
        const [newUser] = await db
          .insert(users)
          .values({
            username,
            phone: phoneNumber,
            provider: 'phone',
            providerId: uid,
            password: null, // Firebase users don't need passwords
            createdAt: new Date(),
          })
          .returning();
        
        // Set user in session
        req.session.userId = newUser.id;
        return res.status(201).json(newUser);
      }
    } catch (error) {
      console.error('Firebase phone auth error:', error);
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
  });
};