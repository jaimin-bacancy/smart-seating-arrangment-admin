import React from 'react';
import { Bell } from 'lucide-react';
import { TabType } from '../../types';
import useCollection from '../../hooks/useCollection';
import { Notification } from '../../types';

interface HeaderProps {
  activeTab: TabType;
  onGenerateSeatingPlan: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onGenerateSeatingPlan }) => {
  // Get unread notifications for the counter
  const { documents: notifications } = useCollection<Notification>(
    'notifications',
    [{ field: 'readBy', operator: '==', value: [] }],
    { field: 'createdAt', direction: 'desc' },
    10
  );

  // Get tab title based on activeTab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'layout':
        return 'Office Layout Management';
      case 'employees':
        return 'Employee Management';
      case 'algorithm':
        return 'AI Algorithm Configuration';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Smart Office Admin';
    }
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h2 className="text-lg font-medium">{getTabTitle()}</h2>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        {(activeTab === 'dashboard' || activeTab === 'algorithm') && (
          <button 
            className="py-2 px-4 bg-blue-600 text-white rounded-lg text-sm"
            onClick={onGenerateSeatingPlan}
          >
            Generate Seating Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
