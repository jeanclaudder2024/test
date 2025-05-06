import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { pool, db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

// Check if serviceAccount is properly configured
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Firebase service account is not properly configured');
  process.exit(1);
}

// Initialize the Firebase Admin app
const app = initializeApp({
  credential: cert(serviceAccount as any)
});

// Get Firestore instance
const firestore = getFirestore(app);

// Utility function to convert MySQL data to Firestore format
const convertToFirestoreFormat = (data: any) => {
  const result: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Convert MySQL date objects to Firestore Timestamps
    if (value instanceof Date) {
      result[key] = new Date(value);
    } 
    // Convert snake_case to camelCase
    else {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelCaseKey] = value;
    }
  }
  
  return result;
};

// Function to migrate all data
export const migrateToFirebase = async () => {
  try {
    console.log('Starting migration from MySQL to Firebase...');
    
    // Define collections to migrate in order (respecting dependencies)
    const collections = [
      { name: 'users', schema: schema.users },
      { name: 'subscription_plans', schema: schema.subscriptionPlans },
      { name: 'companies', schema: schema.companies },
      { name: 'refineries', schema: schema.refineries },
      { name: 'ports', schema: schema.ports },
      { name: 'vessels', schema: schema.vessels },
      { name: 'progress_events', schema: schema.progressEvents },
      { name: 'documents', schema: schema.documents },
      { name: 'brokers', schema: schema.brokers },
      { name: 'stats', schema: schema.stats },
      { name: 'refinery_port_connections', schema: schema.refineryPortConnections },
      { name: 'subscriptions', schema: schema.subscriptions },
      { name: 'payment_methods', schema: schema.paymentMethods },
      { name: 'invoices', schema: schema.invoices }
    ];
    
    // Migrate each collection
    for (const collection of collections) {
      console.log(`Migrating ${collection.name}...`);
      
      // Get all data from MySQL
      const mysqlData = await db.select().from(collection.schema);
      console.log(`Found ${mysqlData.length} records in MySQL ${collection.name}`);
      
      // Batch processing for Firestore (maximum 500 operations per batch)
      const batchSize = 500;
      for (let i = 0; i < mysqlData.length; i += batchSize) {
        const batch = firestore.batch();
        const chunk = mysqlData.slice(i, i + batchSize);
        
        for (const item of chunk) {
          const firestoreData = convertToFirestoreFormat(item);
          const docRef = firestore.collection(collection.name).doc(String(item.id));
          batch.set(docRef, firestoreData);
        }
        
        await batch.commit();
        console.log(`Migrated batch ${i / batchSize + 1} of ${Math.ceil(mysqlData.length / batchSize)} for ${collection.name}`);
      }
      
      console.log(`Completed migration of ${collection.name}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    // Close MySQL connection
    await pool.end();
  }
};

// Execute migration if this file is run directly
if (require.main === module) {
  migrateToFirebase()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}