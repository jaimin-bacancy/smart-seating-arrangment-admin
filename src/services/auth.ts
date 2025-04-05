import { auth } from '../config/firebaseConfig';
import { UserService } from './users';
import { User } from '../types';

// Authentication service
export const AuthService = {
  // Register a new user
  registerUser: async (
    email: string, 
    password: string, 
    userData: Omit<User, 'id'>
  ): Promise<string> => {
    try {
      // Create the user in Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      if (!userCredential.user) {
        throw new Error('Failed to create user account');
      }
      
      const uid = userCredential.user.uid;
      
      // Create the user document in Firestore
      await UserService.createUser(uid, userData);
      
      return uid;
    } catch (error) {
      // console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Login user
  loginUser: async (email: string, password: string): Promise<void> => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      // console.error('Error logging in:', error);
      throw error;
    }
  },
  
  // Logout user
  logoutUser: async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error) {
      // console.error('Error logging out:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      // console.error('Error sending password reset email:', error);
      throw error;
    }
  },
  
  // Update email
  updateEmail: async (newEmail: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is signed in');
      }
      
      await user.updateEmail(newEmail);
    } catch (error) {
      // console.error('Error updating email:', error);
      throw error;
    }
  },
  
  // Update password
  updatePassword: async (newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is signed in');
      }
      
      await user.updatePassword(newPassword);
    } catch (error) {
      // console.error('Error updating password:', error);
      throw error;
    }
  }
};

// Auth state observer setup
export const setupAuthObserver = (callback: (user: firebase.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
