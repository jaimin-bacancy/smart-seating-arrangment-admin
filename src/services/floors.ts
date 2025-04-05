import { firestore } from '../config/firebaseConfig';
import { Floor } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';
import { arrayRemove, arrayUnion } from "firebase/firestore";

const COLLECTION = 'floors';

// Service for managing floors
export const FloorService = {
  // Create a new floor
  createFloor: async (
    name: string,
    level: number,
    layoutId: string,
    maxSeats: number = 100
  ): Promise<string> => {
    try {
      const layoutRef = firestore.collection('office_layouts').doc(layoutId);
      
      const floorData: Omit<Floor, 'id'> = {
        name,
        level,
        layoutId: layoutRef,
        zones: [],
        maxSeats,
      };
      
      // Create the floor
      const floorId = await FirestoreService.createDocument<Omit<Floor, 'id'>>(
        COLLECTION,
        floorData
      );
      
      // Add the floor to the layout's floors array
      await layoutRef.update({
        floors: arrayUnion(
          firestore.collection(COLLECTION).doc(floorId)
        )
      });
      
      return floorId;
    } catch (error) {
      console.error('Error creating floor:', error);
      throw error;
    }
  },
  
  // Get a floor by ID
  getFloorById: async (id: string): Promise<WithId<Floor> | null> => {
    return FirestoreService.getDocument<Floor>(COLLECTION, id);
  },
  
  // Update a floor
  updateFloor: async (id: string, data: Partial<Floor>): Promise<void> => {
    return FirestoreService.updateDocument<Floor>(COLLECTION, id, data);
  },
  
  // Delete a floor
  deleteFloor: async (id: string, layoutId: string): Promise<void> => {
    try {
      const floorRef = firestore.collection(COLLECTION).doc(id);
      const layoutRef = firestore.collection('office_layouts').doc(layoutId);
      
      // Remove the floor from the layout's floors array
      await layoutRef.update({
        floors: arrayRemove(floorRef)
      });
      
      // Delete the floor
      await floorRef.delete();
    } catch (error) {
      console.error(`Error deleting floor ${id}:`, error);
      throw error;
    }
  },
  
  // Get all floors
  getAllFloors: async (): Promise<WithId<Floor>[]> => {
    return FirestoreService.getCollection<Floor>(COLLECTION);
  },
  
  // Get floors by layout
  getFloorsByLayout: async (layoutId: string): Promise<WithId<Floor>[]> => {
    try {
      const layoutRef = firestore.collection('office_layouts').doc(layoutId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('layoutId', '==', layoutRef)
        .orderBy('level', 'asc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Floor>[];
    } catch (error) {
      console.error(`Error getting floors for layout ${layoutId}:`, error);
      throw error;
    }
  }
};

export default FloorService;
