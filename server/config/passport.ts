import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users, userSubscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateToken, calculateTrialEndDate } from '../auth';

// Google OAuth Strategy (only configure if keys are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.onrender.com/api/auth/google/callback'
      : 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      // User exists, update Google ID if not set
      if (!existingUser.googleId) {
        await db
          .update(users)
          .set({
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value,
            provider: 'google',
            isEmailVerified: true, // Google emails are pre-verified
            lastLoginAt: new Date(),
          })
          .where(eq(users.id, existingUser.id));
      } else {
        // Just update last login
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, existingUser.id));
      }

      return done(null, {
        ...existingUser,
        googleId: profile.id,
        avatarUrl: profile.photos?.[0]?.value,
        provider: 'google',
        isEmailVerified: true,
      });
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        googleId: profile.id,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        avatarUrl: profile.photos?.[0]?.value,
        provider: 'google',
        isEmailVerified: true, // Google emails are pre-verified
        role: 'user',
        lastLoginAt: new Date(),
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

    return done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, undefined);
  }
  }));
} else {
  console.log('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not provided');
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

export default passport;