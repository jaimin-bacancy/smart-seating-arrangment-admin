import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestore } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { WithId } from '../types/firebase';
import { arrayRemove, arrayUnion } from 'firebase/firestore';

interface NotificationContextProps {
  notifications: WithId<Notification>[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotification: async () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<WithId<Notification>[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => 
    !n.readBy?.some(ref => ref.id === currentUser?.uid)
  ).length;

  // Fetch notifications for the current user
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const userRef = firestore.collection('users').doc(currentUser.uid);
    
    const unsubscribe = firestore.collection('notifications')
      .where('recipients', 'array-contains', userRef)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          const notificationList: WithId<Notification>[] = [];
          snapshot.forEach(doc => {
            notificationList.push({
              id: doc.id,
              ...doc.data()
            } as WithId<Notification>);
          });
          setNotifications(notificationList);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      
      await firestore.collection('notifications').doc(notificationId).update({
        readBy: arrayUnion(userRef)
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const batch = firestore.batch();
      
      // Update each notification
      notifications.forEach(notification => {
        if (!notification.readBy?.some(ref => ref.id === currentUser.uid)) {
          const notificationRef = firestore.collection('notifications').doc(notification.id);
          batch.update(notificationRef, {
            readBy: arrayUnion(userRef)
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear a notification (remove current user from recipients)
  const clearNotification = async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      
      await firestore.collection('notifications').doc(notificationId).update({
        recipients: arrayRemove(userRef)
      });
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
