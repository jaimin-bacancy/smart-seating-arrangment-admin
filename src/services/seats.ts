import { firestore } from '../config/firebaseConfig';
import { Seat, SeatStatus, SeatType } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';
import { NotificationService } from './notifications';

const COLLECTION = 'seats';

// Service for managing seats
export const SeatService = {
  // Create a new seat
  createSeat: async (
    label: string,
    floorId: string,
    zoneId: string,
    type: SeatType = 'desk',
    status: SeatStatus = 'available'
  ): Promise<string> => {
    try {
      const floorRef = firestore.collection('floors').doc(floorId);
      const zoneRef = firestore.collection('zones').doc(zoneId);
      
      const seatData: Omit<Seat, 'id'> = {
        label,
        floorId: floorRef,
        zoneId: zoneRef,
        type,
        status,
        lastModified: firestore.Timestamp.now()
      };
      
      // Create the seat
      const seatId = await FirestoreService.createDocument<Omit<Seat, 'id'>>(
        COLLECTION,
        seatData
      );
      
      // Add the seat to the zone's seats array
      await zoneRef.update({
        seats: firestore.FieldValue.arrayUnion(
          firestore.collection(COLLECTION).doc(seatId)
        )
      });
      
      return seatId;
    } catch (error) {
      console.error('Error creating seat:', error);
      throw error;
    }
  },
  
  // Get a seat by ID
  getSeatById: async (id: string): Promise<WithId<Seat> | null> => {
    return FirestoreService.getDocument<Seat>(COLLECTION, id);
  },
  
  // Update a seat
  updateSeat: async (id: string, data: Partial<Seat>): Promise<void> => {
    // Ensure lastModified is updated
    const updateData = {
      ...data,
      lastModified: firestore.Timestamp.now()
    };
    
    return FirestoreService.updateDocument<Seat>(COLLECTION, id, updateData);
  },
  
  // Delete a seat
  deleteSeat: async (id: string, zoneId: string): Promise<void> => {
    try {
      const seatRef = firestore.collection(COLLECTION).doc(id);
      const zoneRef = firestore.collection('zones').doc(zoneId);
      
      // Remove the seat from the zone's seats array
      await zoneRef.update({
        seats: firestore.FieldValue.arrayRemove(seatRef)
      });
      
      // Delete the seat
      await seatRef.delete();
    } catch (error) {
      console.error(`Error deleting seat ${id}:`, error);
      throw error;
    }
  },
  
  // Get all seats
  getAllSeats: async (): Promise<WithId<Seat>[]> => {
    return FirestoreService.getCollection<Seat>(COLLECTION);
  },
  
  // Get seats by floor
  getSeatsByFloor: async (floorId: string): Promise<WithId<Seat>[]> => {
    try {
      const floorRef = firestore.collection('floors').doc(floorId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('floorId', '==', floorRef)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Seat>[];
    } catch (error) {
      console.error(`Error getting seats for floor ${floorId}:`, error);
      throw error;
    }
  },
  
  // Get seats by zone
  getSeatsByZone: async (zoneId: string): Promise<WithId<Seat>[]> => {
    try {
      const zoneRef = firestore.collection('zones').doc(zoneId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('zoneId', '==', zoneRef)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Seat>[];
    } catch (error) {
      console.error(`Error getting seats for zone ${zoneId}:`, error);
      throw error;
    }
  },
  
  // Get seats by status
  getSeatsByStatus: async (status: SeatStatus): Promise<WithId<Seat>[]> => {
    return FirestoreService.queryCollection<Seat>(
      COLLECTION,
      'status',
      '==',
      status
    );
  },
  
  // Assign a seat to a user
  assignSeatToUser: async (
    seatId: string, 
    userId: string,
    notifyUser: boolean = true,
    reason: string = 'Seat assignment'
  ): Promise<void> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      
      // Update seat status and assigned user
      await firestore.collection(COLLECTION).doc(seatId).update({
        status: 'occupied',
        assignedTo: userRef,
        lastModified: firestore.Timestamp.now()
      });
      
      // Get seat details for notification
      if (notifyUser) {
        const seat = await SeatService.getSeatById(seatId);
        if (seat) {
          await NotificationService.createSeatChangeNotification(
            userId,
            seat.label,
            reason
          );
        }
      }
    } catch (error) {
      console.error(`Error assigning seat ${seatId} to user ${userId}:`, error);
      throw error;
    }
  },
  
  // Unassign a seat from a user
  unassignSeat: async (seatId: string): Promise<void> => {
    try {
      await firestore.collection(COLLECTION).doc(seatId).update({
        status: 'available',
        assignedTo: firestore.FieldValue.delete(),
        lastModified: firestore.Timestamp.now()
      });
    } catch (error) {
      console.error(`Error unassigning seat ${seatId}:`, error);
      throw error;
    }
  },
  
  // Get seat assigned to a user
  getUserSeat: async (userId: string): Promise<WithId<Seat> | null> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('assignedTo', '==', userRef)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as WithId<Seat>;
    } catch (error) {
      console.error(`Error getting seat for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Set seat to maintenance
  setSeatToMaintenance: async (seatId: string, reason: string = 'Maintenance required'): Promise<void> => {
    try {
      // Get the current seat to check if it's assigned
      const seat = await SeatService.getSeatById(seatId);
      
      if (seat && seat.assignedTo) {
        // If the seat is assigned, notify the user
        const userId = seat.assignedTo.id;
        await NotificationService.createNotification(
          'Seat Maintenance Required',
          `Your seat (${seat.label}) requires maintenance: ${reason}`,
          [userId],
          'maintenance',
          'high'
        );
      }
      
      // Update seat status
      await firestore.collection(COLLECTION).doc(seatId).update({
        status: 'maintenance',
        lastModified: firestore.Timestamp.now()
      });
    } catch (error) {
      console.error(`Error setting seat ${seatId} to maintenance:`, error);
      throw error;
    }
  }
};

export default SeatService;
