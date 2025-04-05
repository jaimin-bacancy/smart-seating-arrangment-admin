import { firestore } from '../config/firebaseConfig';
import { OfficeLayout } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';

const COLLECTION = 'office_layouts';

// Service for managing office layouts
export const LayoutService = {
  // Create a new office layout
  createLayout: async (name: string): Promise<string> => {
    try {
      const layoutData: Omit<OfficeLayout, 'id'> = {
        name,
        floors: [],
        isActive: false,
        createdAt: firestore.Timestamp.now(),
        modifiedAt: firestore.Timestamp.now()
      };
      
      return FirestoreService.createDocument<Omit<OfficeLayout, 'id'>>(
        COLLECTION,
        layoutData
      );
    } catch (error) {
      console.error('Error creating office layout:', error);
      throw error;
    }
  },
  
  // Get a layout by ID
  getLayoutById: async (id: string): Promise<WithId<OfficeLayout> | null> => {
    return FirestoreService.getDocument<OfficeLayout>(COLLECTION, id);
  },
  
  // Update a layout
  updateLayout: async (id: string, data: Partial<OfficeLayout>): Promise<void> => {
    // Ensure modifiedAt is updated
    const updateData = {
      ...data,
      modifiedAt: firestore.Timestamp.now()
    };
    
    return FirestoreService.updateDocument<OfficeLayout>(COLLECTION, id, updateData);
  },
  
  // Delete a layout
  deleteLayout: async (id: string): Promise<void> => {
    return FirestoreService.deleteDocument(COLLECTION, id);
  },
  
  // Get all layouts
  getAllLayouts: async (): Promise<WithId<OfficeLayout>[]> => {
    return FirestoreService.getCollection<OfficeLayout>(COLLECTION);
  },
  
  // Get active layout
  getActiveLayout: async (): Promise<WithId<OfficeLayout> | null> => {
    try {
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as WithId<OfficeLayout>;
    } catch (error) {
      console.error('Error getting active layout:', error);
      throw error;
    }
  },
  
  // Set a layout as active (and deactivate others)
  setActiveLayout: async (id: string): Promise<void> => {
    try {
      // Start a batch operation
      const batch = firestore.batch();
      
      // First, deactivate all layouts
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('isActive', '==', true)
        .get();
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          isActive: false,
          modifiedAt: firestore.Timestamp.now()
        });
      });
      
      // Then activate the requested layout
      const layoutRef = firestore.collection(COLLECTION).doc(id);
      batch.update(layoutRef, { 
        isActive: true,
        modifiedAt: firestore.Timestamp.now()
      });
      
      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error(`Error setting layout ${id} as active:`, error);
      throw error;
    }
  }
};

export default LayoutService;
