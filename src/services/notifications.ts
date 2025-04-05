import { firestore } from '../config/firebaseConfig';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationAction 
} from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';

const COLLECTION = 'notifications';

// Service for managing notifications
export const NotificationService = {
  // Create a new notification
  createNotification: async (
    title: string,
    message: string,
    recipientIds: string[],
    type: NotificationType = 'announcement',
    priority: NotificationPriority = 'medium',
    action?: NotificationAction
  ): Promise<string> => {
    try {
      // Create references to recipients
      const recipientRefs = recipientIds.map(id => 
        firestore.collection('users').doc(id)
      );
      
      const notificationData: Omit<Notification, 'id'> = {
        title,
        message,
        recipients: recipientRefs,
        type,
        priority,
        createdAt: firestore.Timestamp.now(),
        readBy: []
      };
      
      // Add action if provided
      if (action) {
        notificationData.action = action;
      }
      
      return FirestoreService.createDocument<Omit<Notification, 'id'>>(
        COLLECTION,
        notificationData
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  // Get a notification by ID
  getNotificationById: async (id: string): Promise<WithId<Notification> | null> => {
    return FirestoreService.getDocument<Notification>(COLLECTION, id);
  },
  
  // Update a notification
  updateNotification: async (id: string, data: Partial<Notification>): Promise<void> => {
    return FirestoreService.updateDocument<Notification>(COLLECTION, id, data);
  },
  
  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    return FirestoreService.deleteDocument(COLLECTION, id);
  },
  
  // Get all notifications for a user
  getNotificationsForUser: async (userId: string): Promise<WithId<Notification>[]> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('recipients', 'array-contains', userRef)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Notification>[];
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Get unread notifications for a user
  getUnreadNotificationsForUser: async (userId: string): Promise<WithId<Notification>[]> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const notifications = await NotificationService.getNotificationsForUser(userId);
      
      // Filter to only include notifications where the user is not in readBy
      return notifications.filter(notification => 
        !notification.readBy.some(ref => ref.id === userId)
      );
    } catch (error) {
      console.error(`Error getting unread notifications for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Mark a notification as read for a user
  markAsRead: async (notificationId: string, userId: string): Promise<void> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      
      await firestore.collection(COLLECTION).doc(notificationId).update({
        readBy: firestore.FieldValue.arrayUnion(userRef)
      });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },
  
  // Mark all notifications as read for a user
  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const unreadNotifications = await NotificationService.getUnreadNotificationsForUser(userId);
      
      // Create a batch to update all notifications
      const batch = firestore.batch();
      
      unreadNotifications.forEach(notification => {
        const notificationRef = firestore.collection(COLLECTION).doc(notification.id);
        batch.update(notificationRef, {
          readBy: firestore.FieldValue.arrayUnion(userRef)
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Create seat change notification
  createSeatChangeNotification: async (
    userId: string,
    newSeatLabel: string,
    reason: string = 'Seat assignment updated'
  ): Promise<string> => {
    try {
      const title = "Seat Assignment Updated";
      const message = `Your seat has been changed to ${newSeatLabel}. ${reason}`;
      
      return NotificationService.createNotification(
        title,
        message,
        [userId],
        'seat_change',
        'high',
        {
          type: 'view_seat',
          data: { seatLabel: newSeatLabel }
        }
      );
    } catch (error) {
      console.error('Error creating seat change notification:', error);
      throw error;
    }
  },
  
  // Create maintenance notification
  createMaintenanceNotification: async (
    userIds: string[],
    area: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> => {
    try {
      const formattedStart = startDate.toLocaleDateString();
      const formattedEnd = endDate.toLocaleDateString();
      
      const title = "Scheduled Maintenance";
      const message = `Maintenance work is scheduled in ${area} from ${formattedStart} to ${formattedEnd}.`;
      
      return NotificationService.createNotification(
        title,
        message,
        userIds,
        'maintenance',
        'medium'
      );
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
      throw error;
    }
  },
  
  // Create announcement notification
  createAnnouncementNotification: async (
    title: string,
    message: string,
    userIds: string[] = [],
    priority: NotificationPriority = 'medium'
  ): Promise<string> => {
    try {
      // If no specific users are provided, get all users
      let recipients = userIds;
      if (recipients.length === 0) {
        const usersSnapshot = await firestore.collection('users').get();
        recipients = usersSnapshot.docs.map(doc => doc.id);
      }
      
      return NotificationService.createNotification(
        title,
        message,
        recipients,
        'announcement',
        priority
      );
    } catch (error) {
      console.error('Error creating announcement notification:', error);
      throw error;
    }
  }
};

export default NotificationService;