import { firestore } from '../config/firebaseConfig';
import { WithId } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';
// Generic Firestore service with common CRUD operations
export const FirestoreService = {
  // Create a document
  createDocument: async <T>(collection: string, data: T): Promise<string> => {
    try {
      const docRef = await firestore.collection(collection).add({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  // Get a document by ID
  getDocument: async <T>(collection: string, id: string): Promise<WithId<T> | null> => {
    try {
      const doc = await firestore.collection(collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { 
        id: doc.id, 
        ...doc.data() 
      } as WithId<T>;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collection}:`, error);
      throw error;
    }
  },

  // Update a document
  updateDocument: async <T>(collection: string, id: string, data: Partial<T>): Promise<void> => {
    try {
      await firestore.collection(collection).doc(id).update({
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collection}:`, error);
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (collection: string, id: string): Promise<void> => {
    try {
      await firestore.collection(collection).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collection}:`, error);
      throw error;
    }
  },

  // Get all documents from a collection
  getCollection: async <T>(collection: string): Promise<WithId<T>[]> => {
    try {
      const snapshot = await firestore.collection(collection).get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<T>[];
    } catch (error) {
      console.error(`Error getting collection ${collection}:`, error);
      throw error;
    }
  },

  // Query a collection
  queryCollection: async <T>(
    collection: string, 
    field: string, 
    operator: firebase.firestore.WhereFilterOp, 
    value: any
  ): Promise<WithId<T>[]> => {
    try {
      const snapshot = await firestore
        .collection(collection)
        .where(field, operator, value)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<T>[];
    } catch (error) {
      console.error(`Error querying collection ${collection}:`, error);
      throw error;
    }
  }
};
