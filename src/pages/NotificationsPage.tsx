import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import useNotificationsSystem from '../hooks/useNotifications';
import { Notification, NotificationType } from '../types';
import { WithId } from '../types/firebase';

const NotificationsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const {
    sortedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useNotificationsSystem();

  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === 'all' 
    ? sortedNotifications
    : sortedNotifications.filter(n => n.type === activeFilter);

  // Format notification date
  const formatDate = (timestamp: firebase.firestore.Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'seat_change':
        return <Bell className="h-6 w-6 text-blue-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'announcement':
        return <Info className="h-6 w-6 text-indigo-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: WithId<Notification>) => {
    markAsRead(notification.id);
    
    // Handle specific actions based on notification type
    if (notification.action) {
      console.log('Handling action:', notification.action);
      // In a real app, this would navigate to relevant screens or trigger specific actions
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="space-x-3">
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </button>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-3 ${activeFilter === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({sortedNotifications.length})
          </button>
          <button 
            className={`py-2 px-3 ${activeFilter === 'seat_change' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('seat_change')}
          >
            Seat Changes
          </button>
          <button 
            className={`py-2 px-3 ${activeFilter === 'maintenance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('maintenance')}
          >
            Maintenance
          </button>
          <button 
            className={`py-2 px-3 ${activeFilter === 'announcement' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('announcement')}
          >
            Announcements
          </button>
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => {
              const isUnread = !notification.readBy?.some(ref => ref.id === 'current-user-id'); // Replace with actual current user ID
              
              return (
                <li 
                  key={notification.id}
                  className={`p-4 ${isUnread ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                        <div className="flex space-x-2">
                          {isUnread && (
                            <button 
                              className="text-xs text-blue-600 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Mark as read
                            </button>
                          )}
                          <button 
                            className="text-xs text-gray-500 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilter === 'all' 
                ? "You don't have any notifications." 
                : `You don't have any ${activeFilter} notifications.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
