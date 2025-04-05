import { firestore } from '../config/firebaseConfig';
import { Zone, ZoneType } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
const COLLECTION = 'zones';

// Service for managing zones
export const ZoneService = {
  // Create a new zone
  createZone: async (
    name: string,
    floorId: string,
    type: ZoneType = 'team_area',
    color: string = '#4C6EF5'
  ): Promise<string> => {
    try {
      const floorRef = firestore.collection('floors').doc(floorId);
      
      const zoneData: Omit<Zone, 'id'> = {
        name,
        floorId: floorRef,
        type,
        color,
        seats: []
      };
      
      // Create the zone
      const zoneId = await FirestoreService.createDocument<Omit<Zone, 'id'>>(
        COLLECTION,
        zoneData
      );
      
      // Add the zone to the floor's zones array
      await floorRef.update({
        zones: arrayUnion(
          firestore.collection(COLLECTION).doc(zoneId)
        )
      });
      
      return zoneId;
    } catch (error) {
      // console.error('Error creating zone:', error);
      throw error;
    }
  },
  
  // Get a zone by ID
  getZoneById: async (id: string): Promise<WithId<Zone> | null> => {
    return FirestoreService.getDocument<Zone>(COLLECTION, id);
  },
  
  // Update a zone
  updateZone: async (id: string, data: Partial<Zone>): Promise<void> => {
    return FirestoreService.updateDocument<Zone>(COLLECTION, id, data);
  },
  
  // Delete a zone
  deleteZone: async (id: string, floorId: string): Promise<void> => {
    try {
      const zoneRef = firestore.collection(COLLECTION).doc(id);
      const floorRef = firestore.collection('floors').doc(floorId);
      
      // Get the zone to check if it has seats
      const zone = await ZoneService.getZoneById(id);
      
      if (zone && zone.seats.length > 0) {
        throw new Error('Cannot delete zone with seats. Remove all seats first.');
      }
      
      // Remove the zone from the floor's zones array
      await floorRef.update({
        zones: arrayRemove(zoneRef)
      });
      
      // Delete the zone
      await zoneRef.delete();
    } catch (error) {
      // console.error(`Error deleting zone ${id}:`, error);
      throw error;
    }
  },
  
  // Get all zones
  getAllZones: async (): Promise<WithId<Zone>[]> => {
    return FirestoreService.getCollection<Zone>(COLLECTION);
  },
  
  // Get zones by floor
  getZonesByFloor: async (floorId: string): Promise<WithId<Zone>[]> => {
    try {
      const floorRef = firestore.collection('floors').doc(floorId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('floorId', '==', floorRef)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Zone>[];
    } catch (error) {
      // console.error(`Error getting zones for floor ${floorId}:`, error);
      throw error;
    }
  },
  
  // Get zones by type
  getZonesByType: async (type: ZoneType): Promise<WithId<Zone>[]> => {
    return FirestoreService.queryCollection<Zone>(
      COLLECTION,
      'type',
      '==',
      type
    );
  },
  
  // Add a seat to a zone
  addSeatToZone: async (zoneId: string, seatId: string): Promise<void> => {
    try {
      const seatRef = firestore.collection('seats').doc(seatId);
      
      await firestore.collection(COLLECTION).doc(zoneId).update({
        seats: arrayUnion(seatRef)
      });
    } catch (error) {
      // console.error(`Error adding seat ${seatId} to zone ${zoneId}:`, error);
      throw error;
    }
  },
  
  // Remove a seat from a zone
  removeSeatFromZone: async (zoneId: string, seatId: string): Promise<void> => {
    try {
      const seatRef = firestore.collection('seats').doc(seatId);
      
      await firestore.collection(COLLECTION).doc(zoneId).update({
        seats: arrayRemove(seatRef)
      });
    } catch (error) {
      // console.error(`Error removing seat ${seatId} from zone ${zoneId}:`, error);
      throw error;
    }
  },
  
  // Get the capacity of a zone (total number of seats)
  getZoneCapacity: async (zoneId: string): Promise<number> => {
    try {
      const zone = await ZoneService.getZoneById(zoneId);
      return zone ? zone.seats.length : 0;
    } catch (error) {
      // console.error(`Error getting capacity for zone ${zoneId}:`, error);
      throw error;
    }
  },
  
  // Get the occupancy of a zone (number of occupied seats)
  getZoneOccupancy: async (zoneId: string): Promise<{ total: number; occupied: number; rate: number }> => {
    try {
      const zone = await ZoneService.getZoneById(zoneId);
      
      if (!zone) {
        return { total: 0, occupied: 0, rate: 0 };
      }
      
      // Get all seats in this zone
      const seatRefs = zone.seats.map(seatRef => seatRef.id);
      
      if (seatRefs.length === 0) {
        return { total: 0, occupied: 0, rate: 0 };
      }
      
      // Count occupied seats
      let occupiedCount = 0;
      
      // We need to chunk the query if there are too many seat IDs
      // Firestore has a limit of 10 items in an 'in' query
      const chunkSize = 10;
      for (let i = 0; i < seatRefs.length; i += chunkSize) {
        const chunk = seatRefs.slice(i, i + chunkSize);
        
        const snapshot = await firestore
          .collection('seats')
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .where('status', '==', 'occupied')
          .get();
        
        occupiedCount += snapshot.docs.length;
      }
      
      const total = seatRefs.length;
      const rate = total > 0 ? (occupiedCount / total) * 100 : 0;
      
      return {
        total,
        occupied: occupiedCount,
        rate
      };
    } catch (error) {
      // console.error(`Error getting occupancy for zone ${zoneId}:`, error);
      throw error;
    }
  }
};

export default ZoneService;