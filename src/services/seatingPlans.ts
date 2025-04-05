import { firestore } from '../config/firebaseConfig';
import { SeatingPlan, AlgorithmParameters } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';

const COLLECTION = 'seating_plans';

// Seating plans service
export const SeatingPlanService = {
  // Create a new seating plan
  createSeatingPlan: async (seatingPlan: Omit<SeatingPlan, 'id' | 'createdAt'>): Promise<string> => {
    return FirestoreService.createDocument<Omit<SeatingPlan, 'id' | 'createdAt'>>(
      COLLECTION, 
      seatingPlan
    );
  },
  
  // Get a seating plan by ID
  getSeatingPlanById: async (id: string): Promise<WithId<SeatingPlan> | null> => {
    return FirestoreService.getDocument<SeatingPlan>(COLLECTION, id);
  },
  
  // Update a seating plan
  updateSeatingPlan: async (id: string, data: Partial<SeatingPlan>): Promise<void> => {
    return FirestoreService.updateDocument<SeatingPlan>(COLLECTION, id, data);
  },
  
  // Delete a seating plan
  deleteSeatingPlan: async (id: string): Promise<void> => {
    return FirestoreService.deleteDocument(COLLECTION, id);
  },
  
  // Get all seating plans
  getAllSeatingPlans: async (): Promise<WithId<SeatingPlan>[]> => {
    return FirestoreService.getCollection<SeatingPlan>(COLLECTION);
  },
  
  // Get active seating plan
  getActiveSeatingPlan: async (): Promise<WithId<SeatingPlan> | null> => {
    try {
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('isActive', '==', true)
        .orderBy('effectiveFrom', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as WithId<SeatingPlan>;
    } catch (error) {
      console.error('Error getting active seating plan:', error);
      throw error;
    }
  },
  
  // Activate a seating plan (and deactivate others)
  activateSeatingPlan: async (id: string): Promise<void> => {
    try {
      // Start a batch operation
      const batch = firestore.batch();
      
      // First, deactivate all plans
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('isActive', '==', true)
        .get();
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });
      
      // Then activate the requested plan
      const planRef = firestore.collection(COLLECTION).doc(id);
      batch.update(planRef, { 
        isActive: true,
        effectiveFrom: firestore.Timestamp.now()
      });
      
      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error(`Error activating seating plan ${id}:`, error);
      throw error;
    }
  },
  
  // Update algorithm parameters
  updateAlgorithmParams: async (id: string, params: AlgorithmParameters): Promise<void> => {
    try {
      await firestore.collection(COLLECTION).doc(id).update({
        algorithmParameters: params,
        updatedAt: firestore.Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating algorithm parameters for plan ${id}:`, error);
      throw error;
    }
  }
};
