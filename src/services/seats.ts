import { arrayRemove, arrayUnion, Timestamp } from "firebase/firestore";
import { firestore } from "../config/firebaseConfig";
import { Seat, SeatStatus, SeatType } from "../types";
import { WithId } from "../types/firebase";
import { FirestoreService } from "./firebase";
import { NotificationService } from "./notifications";
const COLLECTION = "seats";

// Service for managing seats
export const SeatService = {
  // Create a new seat
  createSeat: async (
    label: string,
    floorId: string,
    zoneId: string,
    type: SeatType = "desk",
    status: SeatStatus = "available"
  ): Promise<string> => {
    try {
      const floorRef = firestore.collection("floors").doc(floorId);
      const zoneRef = firestore.collection("zones").doc(zoneId);

      const seatData: Omit<Seat, "id"> = {
        label,
        floorId: floorRef,
        zoneId: zoneRef,
        type,
        status,
        lastModified: Timestamp.now(),
      };

      // Create the seat
      const seatId = await FirestoreService.createDocument<Omit<Seat, "id">>(
        COLLECTION,
        seatData
      );

      // Add the seat to the zone's seats array
      await zoneRef.update({
        seats: arrayUnion(firestore.collection(COLLECTION).doc(seatId)),
      });

      return seatId;
    } catch (error) {
      console.error("Error creating seat:", error);
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
      lastModified: Timestamp.now(),
    };

    return FirestoreService.updateDocument<Seat>(COLLECTION, id, updateData);
  },

  // Delete a seat
  deleteSeat: async (id: string, zoneId: string): Promise<void> => {
    try {
      const seatRef = firestore.collection(COLLECTION).doc(id);
      const zoneRef = firestore.collection("zones").doc(zoneId);

      // Remove the seat from the zone's seats array
      await zoneRef.update({
        seats: arrayRemove(seatRef),
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
      const floorRef = firestore.collection("floors").doc(floorId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where("floorId", "==", floorRef)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WithId<Seat>[];
    } catch (error) {
      console.error(`Error getting seats for floor ${floorId}:`, error);
      throw error;
    }
  },

  // Get seats by zone
  getSeatsByZone: async (zoneId: string): Promise<WithId<Seat>[]> => {
    try {
      const zoneRef = firestore.collection("zones").doc(zoneId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where("zoneId", "==", zoneRef)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
      "status",
      "==",
      status
    );
  },

  // Assign a seat to a user
  assignSeatToUser: async (
    seatId: string,
    userId: string,
    notifyUser: boolean = false,
    reason: string = "Seat assignment"
  ): Promise<void> => {
    try {
      const batch = firestore.batch();
      const userRef = firestore.collection("users").doc(userId);
      const seatRef = firestore.collection(COLLECTION).doc(seatId);

      // Get the current seat data to check if it's already assigned
      const seatDoc = await seatRef.get();
      const seatData = seatDoc.data() as Seat;

      // If the seat is already assigned to another user, remove the reference from that user
      if (seatData?.assignedTo && seatData.assignedTo.id !== userId) {
        const previousUserRef = seatData.assignedTo;

        // Update the previous user to remove this seat reference
        batch.update(previousUserRef, {
          assignedSeat: null,
        });

        // Optionally notify the previous user that their seat has been reassigned
        if (notifyUser) {
          await NotificationService.createSeatChangeNotification(
            previousUserRef.id,
            seatData.label,
            "Your seat has been reassigned"
          );
        }
      }

      // Check if the user already has a different seat assigned
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (userData?.assignedSeat && userData.assignedSeat.id !== seatId) {
        const previousSeatRef = userData.assignedSeat;

        // Update the previous seat to mark it as available
        batch.update(previousSeatRef, {
          status: "available",
          assignedTo: null,
          lastModified: Timestamp.now(),
        });
      }

      // Update seat status and assigned user
      batch.update(seatRef, {
        status: "occupied",
        assignedTo: userRef,
        lastModified: Timestamp.now(),
      });

      // Update user with seat reference
      batch.update(userRef, {
        assignedSeat: seatRef,
      });

      // Commit all changes as a batch
      await batch.commit();

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
  unassignSeat: async (
    seatId: string,
    notifyUser: boolean = true
  ): Promise<void> => {
    try {
      const batch = firestore.batch();
      const seatRef = firestore.collection(COLLECTION).doc(seatId);

      // Get current seat data
      const seatDoc = await seatRef.get();
      const seatData = seatDoc.data() as Seat;

      // If seat has an assigned user, update that user
      if (seatData?.assignedTo) {
        const userRef = seatData.assignedTo;

        // Update user to remove seat reference
        batch.update(userRef, {
          assignedSeat: null,
        });

        // Update seat to remove user and mark as available
        batch.update(seatRef, {
          status: "available",
          assignedTo: null,
          lastModified: Timestamp.now(),
        });

        // Commit all changes
        await batch.commit();

        // Notify user if needed
        if (notifyUser) {
          await NotificationService.createSeatChangeNotification(
            userRef.id,
            seatData.label,
            "Your seat assignment has been removed"
          );
        }
      } else {
        // If seat isn't assigned, just mark it as available
        await seatRef.update({
          status: "available",
          lastModified: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error(`Error unassigning seat ${seatId}:`, error);
      throw error;
    }
  },

  // Get seat assigned to a user
  getUserSeat: async (userId: string): Promise<WithId<Seat> | null> => {
    try {
      const userRef = firestore.collection("users").doc(userId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where("assignedTo", "==", userRef)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as WithId<Seat>;
    } catch (error) {
      console.error(`Error getting seat for user ${userId}:`, error);
      throw error;
    }
  },

  // Set seat to maintenance
  setSeatToMaintenance: async (
    seatId: string,
    reason: string = "Maintenance required"
  ): Promise<void> => {
    try {
      // Get the current seat to check if it's assigned
      const seat = await SeatService.getSeatById(seatId);

      if (seat && seat.assignedTo) {
        // If the seat is assigned, notify the user
        const userId = seat.assignedTo.id;
        await NotificationService.createNotification(
          "Seat Maintenance Required",
          `Your seat (${seat.label}) requires maintenance: ${reason}`,
          [userId],
          "maintenance",
          "high"
        );
      }

      // Update seat status
      await firestore.collection(COLLECTION).doc(seatId).update({
        status: "maintenance",
        lastModified: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error setting seat ${seatId} to maintenance:`, error);
      throw error;
    }
  },
};

export default SeatService;
