import { useState } from 'react';
import { AuthService } from '../services/auth';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { User, UserRole } from '../types';

// Hook for authentication operations
export const useAuth = () => {
  const auth = useAuthContext(); // Get the authentication context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.loginUser(email, password);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Register a new user
  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'employee',
    department: string,
    employeeId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Create user data
      const userData: Omit<User, 'id'> = {
        email,
        displayName,
        role,
        department,
        employeeId,
        techSkills: [],
        currentProjects: []
      };
      
      // Register the user
      await AuthService.registerUser(email, password, userData);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Logout
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.logoutUser();
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.resetPassword(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Change password
  const changePassword = async (newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.updatePassword(newPassword);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Change email
  const changeEmail = async (newEmail: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.updateEmail(newEmail);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };

  // Check if user has admin role
  const isAdmin = (): boolean => {
    return auth.userProfile?.role === 'admin';
  };

  // Check if user has manager role (PM or DOE)
  const isManager = (): boolean => {
    return auth.userProfile?.role === 'pm' || auth.userProfile?.role === 'doe';
  };

  return {
    // Current user data from context
    currentUser: auth.currentUser,
    userProfile: auth.userProfile,
    isAuthenticated: !!auth.currentUser,
    
    // State
    loading: loading || auth.loading,
    error,
    
    // Auth operations
    login,
    logout,
    register,
    resetPassword,
    changePassword,
    changeEmail,
    
    // Role checks
    isAdmin,
    isManager
  };
};

export default useAuth;
