import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  WithFieldValue,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generic types for database operations
type CollectionName = 
  | 'users'
  | 'vessels'
  | 'refineries'
  | 'ports'
  | 'documents'
  | 'brokers'
  | 'companies'
  | 'subscriptionPlans'
  | 'subscriptions'
  | 'paymentMethods'
  | 'invoices'
  | 'progressEvents'
  | 'stats'
  | 'refineryPortConnections';

// Create a document
export const createDocument = async <T extends DocumentData>(
  collectionName: CollectionName,
  data: WithFieldValue<T>
) => {
  try {
    // Add created timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Create document with specific ID
export const createDocumentWithId = async <T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: WithFieldValue<T>
) => {
  try {
    // Add created timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, collectionName, id), dataWithTimestamp);
    return { id, ...data };
  } catch (error) {
    console.error(`Error creating document with ID in ${collectionName}:`, error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async <T>(
  collectionName: CollectionName,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as T;
      return { id: docSnap.id, ...data } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Get all documents from a collection
export const getAllDocuments = async <T>(collectionName: CollectionName): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    throw error;
  }
};

// Query documents
export const queryDocuments = async <T>(
  collectionName: CollectionName,
  conditions: { field: string; operator: '==' | '>' | '<' | '>=' | '<='; value: any }[],
  sortField?: string,
  sortDirection?: 'asc' | 'desc',
  limitTo?: number
): Promise<T[]> => {
  try {
    let q = collection(db, collectionName);
    
    // Add where conditions
    let queryObj = query(q);
    conditions.forEach(condition => {
      queryObj = query(queryObj, where(condition.field, condition.operator, condition.value));
    });
    
    // Add sorting
    if (sortField) {
      queryObj = query(queryObj, orderBy(sortField, sortDirection || 'asc'));
    }
    
    // Add limit
    if (limitTo) {
      queryObj = query(queryObj, limit(limitTo));
    }
    
    const querySnapshot = await getDocs(queryObj);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async <T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: Partial<T>
) => {
  try {
    const docRef = doc(db, collectionName, id);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (
  collectionName: CollectionName,
  id: string
) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { id, deleted: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Subscribe to changes in a document
export const subscribeToDocument = <T>(
  collectionName: CollectionName,
  id: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, id);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as T;
      callback({ id: docSnap.id, ...data } as T);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document in ${collectionName}:`, error);
  });
};

// Subscribe to changes in a collection
export const subscribeToCollection = <T>(
  collectionName: CollectionName,
  callback: (data: T[]) => void,
  conditions?: { field: string; operator: '==' | '>' | '<' | '>=' | '<='; value: any }[],
  sortField?: string,
  sortDirection?: 'asc' | 'desc',
  limitTo?: number
) => {
  let q = collection(db, collectionName);
  
  // Add where conditions
  let queryObj = query(q);
  if (conditions) {
    conditions.forEach(condition => {
      queryObj = query(queryObj, where(condition.field, condition.operator, condition.value));
    });
  }
  
  // Add sorting
  if (sortField) {
    queryObj = query(queryObj, orderBy(sortField, sortDirection || 'asc'));
  }
  
  // Add limit
  if (limitTo) {
    queryObj = query(queryObj, limit(limitTo));
  }
  
  return onSnapshot(queryObj, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    callback(documents);
  }, (error) => {
    console.error(`Error subscribing to collection ${collectionName}:`, error);
  });
};

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};