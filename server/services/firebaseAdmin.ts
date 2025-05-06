import * as admin from 'firebase-admin';

// Check if all necessary Firebase environment variables are set
const requiredEnvVars = [
  'VITE_FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
  console.warn('Firebase Admin functionality will be limited. Set these variables to enable full Firebase integration.');
}

// Initialize Firebase Admin SDK
try {
  // Check if an app has already been initialized
  admin.app();
} catch (error) {
  // App hasn't been initialized yet, so initialize it
  // Only initialize if we have the required environment variables
  if (missingVars.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
}

export { admin };