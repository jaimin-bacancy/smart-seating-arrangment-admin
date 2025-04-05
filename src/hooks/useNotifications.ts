import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

// Hook for more advanced notification operations
export const useNotificationsSystem = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useNotifications();

  // Auto-mark notifications as seen when component mounts
  useEffect(() => {
    // This could be a good place to track which notifications have been displayed
    // but not necessarily interacted with
    return () => {
      // Cleanup if needed
    };
  }, [notifications]);

  // Sort notifications by priority and date
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by priority (high, medium, low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by date (newest first)
    return b.createdAt.toMillis() - a.createdAt.toMillis();
  });

  // Filter notifications by type
  const filterByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  // Get today's notifications
  const todayNotifications = notifications.filter(n => {
    const today = new Date();
    const notificationDate = n.createdAt.toDate();
    
    return (
      notificationDate.getDate() === today.getDate() &&
      notificationDate.getMonth() === today.getMonth() &&
      notificationDate.getFullYear() === today.getFullYear()
    );
  });

  return {
    notifications,
    sortedNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    filterByType,
    todayNotifications
  };
};

export default useNotificationsSystem;
