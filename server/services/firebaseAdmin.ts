import * as firebaseAdmin from 'firebase-admin';

// Initialize Firebase Admin with environment variables
// Note: Firebase Admin SDK uses a different set of credentials than client-side Firebase
// These service account credentials should be kept secure on the server
const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-${Math.random().toString(36).substring(2, 10)}@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
};

// Initialize the app if it hasn't been initialized already
let admin: firebaseAdmin.app.App;

try {
  // Check if admin SDK is already initialized
  admin = firebaseAdmin.app();
  console.log('Firebase Admin SDK already initialized');
} catch (error) {
  console.log('Initializing Firebase Admin SDK...');
  
  try {
    // For development, we'll use a fake service account if one isn't provided
    // In production, you should always provide a proper service account
    if (!process.env.FIREBASE_PRIVATE_KEY && process.env.NODE_ENV === 'development') {
      // Initialize with application default credentials in development
      admin = firebaseAdmin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        // Use credential for app verification only
        credential: firebaseAdmin.credential.cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: serviceAccount.clientEmail,
          // Use a fake private key for development only
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+Z2mi8shM1pm5\nVeFvHrsvj5YAQqMwTQRW4wMnxbhSLCRJkrQnPbWxs5/xXK1ghzOj21oZ+EEJ8gVt\nNOSk2XfI08lzTl8gjJm6I4tWB41UHK9xbRYQI3l0CcIJ+mTJGN79iPSiJYhLJp+k\n5h5SjTmCvpvJmJZ/4AyZj0QL8MIR/3lVQklHCsWLlOzh2KM6xDgMvYSj9HH5ftLj\nRyJZYrMSBbyAYfBCNaXRo9dkK/WnNUvxjDYIVZSv90roUqvZbI0bqZNLBWL5FhJL\nglvnF/KJbXMASRJd7zEzKOUBRSA5yJI1SQDm/3XI5HtWkIHy40zc6cIbfW9DpIYv\n5KiXpxivAgMBAAECggEASvSLhROEbJaV8GvJYTrIlHMo1xgLFj1DxVgF2Oq2nKGV\nXLE6u4rJJhLYJUPxajGv/m7rokRz+CsvDOaHQBcZ0M/K4GCIr38mxKn5pl7Z84ad\nzeQNFfRUvYpKcdUyZ0PPbdYJFjryf0ydLCiQQWTUwGJZkbTZeHftxcD0+7LEkyjL\nuxBjKA/CeQpme3jqWJ4Bk7vz2vKi+vy/TnKQ0aMmSPiZYKnEWEjXjVBFVD+o2qhn\nHOPk3JgIs+HUfxOC4cXbcPfj9ZU8sy4siV6DsRsEsL0SOh3aP1AQFS2GrwLvTDv3\nl8ZZKWl/k4GL0jzq747+JIwp8mwU87Cau9YcQQcDgQKBgQDyrl3D1fseA2Kfkz3h\nSz+tGKs2GQFIMtR1J0fxiKC0zHQmsuyjP2TzEwfzZjG4LkjMIPZPbNTMfphL+/+d\nHpzjW0RRj/kByuCYU/tIYRDo+5hGQA0V7AWi+GKgGBPzHnOWM1TekCR2XbGQVZUJ\nfSKCofYwCMqWccMBNbWw0Z94owKBgQDI3dvx3mhnYqZELRC5xABwzLXLj7ic0Jnw\ntzBDfBQrJgQd3cGcunjXnT9KSY+7DozPf+fIp2RJiCgXH9EnYeiDucwLfz/Dh0Xo\nPl6K6RQ02Kup5lQIbRLkHAzipgky2+M7hdkGtdtTtYsBBNEgL4Y7+4NcGOgQ0kaj\nJYaFdlPrtQKBgQClA3nKbSYqmQp6KvGLQCmEQyHaZRGnL2SUdGZGLcI+z69tDPX7\nUl2vpOQCUGvWtAugEQlDA7xSxdyVgqpl72vMGUvnTNGKOSZo5PfYbXAJiOlUYwIz\nZDmW5oO/YK0P5CDz+7TxUtdZ94P8Jdi1QxTJMeQCQaYne+NfrXPQJOsUywKBgD8+\nQJRMrMXwX4XQH5XKljfGHxQzcs+GQy3zNmTMizSc6LkY/wfiV7/xssWiB+LNQBW/\nXqyz0YKfK5+iL8ZTx0mMeBvcG4vGWzrp2Bm/IzRtWN9JfQVQqIrJ+qRsJh5ZU5od\nS/g1h6zPnaTHuQHY3OkGCi8s1KQZCQVfKM9FlXLpAoGAUOrqQsm116XvhvX3S1zg\nhGXEkJNgKEBM3op3PTKmw12xFqKeu2+8KYD5fnvQK5pA1UdkVEJhK8+bzaoqwK4s\nRcCx7JWBHJmzqkIcCwLEm1/merO5QI2CrXmJLxvk+rQezZnnIh3XtKdEyVbM4IBg\n9YXwBEFu8D+HggulfK5F/BA=\n-----END PRIVATE KEY-----\n'
        })
      });
    } else {
      // In production, use the proper service account
      admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: serviceAccount.projectId,
          clientEmail: serviceAccount.clientEmail,
          privateKey: serviceAccount.privateKey
        })
      });
    }
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (initError) {
    console.error('Error initializing Firebase Admin SDK:', initError);
    // Fallback to initialize without credentials - only for development testing
    admin = firebaseAdmin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    console.warn('Firebase Admin SDK initialized with limited functionality - token verification will not work properly');
  }
}

export { admin, firebaseAdmin };