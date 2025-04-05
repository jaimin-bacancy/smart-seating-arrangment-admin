import { arrayRemove, arrayUnion, Timestamp } from "firebase/firestore";
import { firestore } from "../config/firebaseConfig";
import { Floor, Seat, Zone } from "../types";
import { FirestoreReference, WithId } from "../types/firebase";
import { FirestoreService } from "./firebase";

const COLLECTION = "floors";

// Service for managing floors
export const FloorService = {
  // Create a new floor with default seats
  createFloor: async (
    name: string,
    level: number,
    layoutId: string,
    maxSeats: number = 72
  ): Promise<string> => {
    try {
      const batch = firestore.batch();
      const layoutRef = firestore.collection("office_layouts").doc(layoutId);

      const floorRef = firestore.collection(COLLECTION).doc();
      const floorData: Omit<Floor, "id"> = {
        name,
        level,
        layoutId: layoutRef,
        zones: [],
        maxSeats,
      };

      batch.set(floorRef, floorData);

      const zoneRef = firestore.collection("zones").doc();
      const zoneData: Omit<Zone, "id"> = {
        name: "Default Zone",
        floorId: floorRef,
        type: "team_area",
        seats: [],
        color: "#CCCCCC", // Default color
      };

      batch.set(zoneRef, zoneData);

      // Update floor with zone reference
      batch.update(floorRef, {
        zones: arrayUnion(zoneRef),
      });

      const seatRefs: FirestoreReference[] = [];
      for (let i = 1; i <= maxSeats; i++) {
        const seatRef = firestore.collection("seats").doc();
        seatRefs.push(seatRef);

        const seatData: Omit<Seat, "id"> = {
          label: `${i}`,
          floorName: name,
          floorId: floorRef,
          zoneId: zoneRef,
          type: "desk",
          status: "available",
          lastModified: Timestamp.now(),
        };

        batch.set(seatRef, seatData);
      }

      batch.update(zoneRef, {
        seats: arrayUnion(...seatRefs),
      });

      batch.update(layoutRef, {
        floors: arrayUnion(floorRef),
      });

      await batch.commit();

      return floorRef.id;
    } catch (error) {
      // console.error("Error creating floor with seats:", error);
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

  // Delete a floor and its associated seats and zones
  deleteFloor: async (id: string, layoutId: string): Promise<void> => {
    try {
      const floorRef = firestore.collection(COLLECTION).doc(id);
      const layoutRef = firestore.collection("office_layouts").doc(layoutId);

      // Get floor data to find associated zones and seats
      const floorDoc = await floorRef.get();
      const floorData = floorDoc.data() as Floor;

      // Start a batch operation
      const batch = firestore.batch();

      // Remove the floor from the layout's floors array
      batch.update(layoutRef, {
        floors: arrayRemove(floorRef),
      });

      // Delete all seats associated with this floor
      const seatsSnapshot = await firestore
        .collection("seats")
        .where("floorId", "==", floorRef)
        .get();

      seatsSnapshot.docs.forEach((seatDoc) => {
        batch.delete(seatDoc.ref);
      });

      // Delete all zones associated with this floor
      if (floorData.zones && floorData.zones.length > 0) {
        for (const zoneRef of floorData.zones) {
          batch.delete(zoneRef);
        }
      }

      // Delete the floor itself
      batch.delete(floorRef);

      // Commit all deletions as a batch
      await batch.commit();
    } catch (error) {
      // console.error(`Error deleting floor ${id} and its resources:`, error);
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
      const layoutRef = firestore.collection("office_layouts").doc(layoutId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where("layoutId", "==", layoutRef)
        .orderBy("level", "asc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WithId<Floor>[];
    } catch (error) {
      // console.error(`Error getting floors for layout ${layoutId}:`, error);
      throw error;
    }
  },
};

export default FloorService;
