import { firestore, auth } from '../config/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { User, UserRole } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';

const COLLECTION = 'users';

// User-specific service functions
export const UserService = {
  // Get current user
  getCurrentUser: async (): Promise<WithId<User> | null> => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }
    
    return UserService.getUserById(currentUser.uid);
  },
  
  // Get user by ID
  getUserById: async (id: string): Promise<WithId<User> | null> => {
    return FirestoreService.getDocument<User>(COLLECTION, id);
  },
  
  // Create user (typically called after auth registration)
  createUser: async (id: string, userData: Omit<User, 'id'>): Promise<void> => {
    try {
      await firestore.collection(COLLECTION).doc(id).set({
        ...userData,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      // console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (id: string, data: Partial<User>): Promise<void> => {
    return FirestoreService.updateDocument<User>(COLLECTION, id, data);
  },
  
  // Get users by role
  getUsersByRole: async (role: UserRole): Promise<WithId<User>[]> => {
    return FirestoreService.queryCollection<User>(COLLECTION, 'role', '==', role);
  },
  
  // Get users by department
  getUsersByDepartment: async (department: string): Promise<WithId<User>[]> => {
    return FirestoreService.queryCollection<User>(COLLECTION, 'department', '==', department);
  },
  
  // Get users by project
  getUsersByProject: async (projectId: string): Promise<WithId<User>[]> => {
    try {
      const projectRef = firestore.collection('projects').doc(projectId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('currentProjects', 'array-contains', projectRef)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<User>[];
    } catch (error) {
      // console.error(`Error getting users for project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Get all users
  getAllUsers: async (): Promise<WithId<User>[]> => {
    return FirestoreService.getCollection<User>(COLLECTION);
  }
};
