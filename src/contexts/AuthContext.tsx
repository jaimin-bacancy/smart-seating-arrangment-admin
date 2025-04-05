import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebaseConfig';
import { setupAuthObserver } from '../services/auth';
import { UserService } from '../services/users';
import { User } from '../types';
import { WithId } from '../types/firebase';

interface AuthContextProps {
  currentUser: firebase.User | null;
  userProfile: WithId<User> | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userProfile: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<WithId<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state observer
    const unsubscribe = setupAuthObserver(async (user) => {
      setCurrentUser(user);
      console.log('User profile:3', user.uid);
      if (user) {
        try {
          // Fetch the user's profile data
          const profile = await UserService.getUserById(user.uid);
          console.log('User profile:1', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Clean up the observer on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
