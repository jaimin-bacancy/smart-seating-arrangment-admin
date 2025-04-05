import { firestore } from '../config/firebaseConfig';
import { SeatChangeRequest, ChangeRequestStatus } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';
const COLLECTION = 'seat_change_requests';

// Service for managing seat change requests
export const ChangeRequestService = {
  // Create a new seat change request
  createRequest: async (
    userId: string,
    currentSeatId: string,
    preferredZoneId?: string,
    preferredSeatId?: string,
    reason: string = 'Seat change requested'
  ): Promise<string> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const seatRef = firestore.collection('seats').doc(currentSeatId);
      
      const requestData: Omit<SeatChangeRequest, 'id'> = {
        requestedBy: userRef,
        currentSeatId: seatRef,
        reason,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Add preferred zone if provided
      if (preferredZoneId) {
        requestData.preferredZoneId = firestore.collection('zones').doc(preferredZoneId);
      }
      
      // Add preferred seat if provided
      if (preferredSeatId) {
        requestData.preferredSeatId = firestore.collection('seats').doc(preferredSeatId);
      }
      
      return FirestoreService.createDocument<Omit<SeatChangeRequest, 'id'>>(
        COLLECTION,
        requestData
      );
    } catch (error) {
      console.error('Error creating seat change request:', error);
      throw error;
    }
  },
  
  // Get all change requests
  getAllRequests: async (): Promise<WithId<SeatChangeRequest>[]> => {
    return FirestoreService.getCollection<SeatChangeRequest>(COLLECTION);
  },
  
  // Get requests by status
  getRequestsByStatus: async (status: ChangeRequestStatus): Promise<WithId<SeatChangeRequest>[]> => {
    return FirestoreService.queryCollection<SeatChangeRequest>(
      COLLECTION,
      'status',
      '==',
      status
    );
  },
  
  // Get requests by user
  getRequestsByUser: async (userId: string): Promise<WithId<SeatChangeRequest>[]> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('requestedBy', '==', userRef)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<SeatChangeRequest>[];
    } catch (error) {
      console.error(`Error getting change requests for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Approve a change request
  approveRequest: async (
    requestId: string,
    approverId: string,
    notes: string = 'Request approved'
  ): Promise<void> => {
    try {
      const approverRef = firestore.collection('users').doc(approverId);
      
      await firestore.collection(COLLECTION).doc(requestId).update({
        status: 'approved',
        approver: approverRef,
        notes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error approving change request ${requestId}:`, error);
      throw error;
    }
  },
  
  // Reject a change request
  rejectRequest: async (
    requestId: string,
    approverId: string,
    notes: string = 'Request rejected'
  ): Promise<void> => {
    try {
      const approverRef = firestore.collection('users').doc(approverId);
      
      await firestore.collection(COLLECTION).doc(requestId).update({
        status: 'rejected',
        approver: approverRef,
        notes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error rejecting change request ${requestId}:`, error);
      throw error;
    }
  }
};

export default ChangeRequestService;
