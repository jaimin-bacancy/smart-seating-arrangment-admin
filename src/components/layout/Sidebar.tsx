import React from 'react';
import { PieChart, LayoutGrid, Users, Settings, List, LogOut } from 'lucide-react';
import { TabType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/auth';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile } = useAuth();

  console.log('User Profile:', userProfile);
  const handleLogout = async () => {
    try {
      await AuthService.logoutUser();
      // Redirect handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-500 mr-3 flex items-center justify-center">
          <span className="font-bold">S</span>
        </div>
        <h1 className="font-bold text-lg">Smart Office</h1>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <ul className="py-4">
          <li 
            className={`px-4 py-3 flex items-center cursor-pointer ${activeTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <PieChart size={18} className="mr-3" />
            <span>Dashboard</span>
          </li>
          <li 
            className={`px-4 py-3 flex items-center cursor-pointer ${activeTab === 'layout' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => setActiveTab('layout')}
          >
            <LayoutGrid size={18} className="mr-3" />
            <span>Office Layout</span>
          </li>
          <li 
            className={`px-4 py-3 flex items-center cursor-pointer ${activeTab === 'employees' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={18} className="mr-3" />
            <span>Employees</span>
          </li>
          <li 
            className={`px-4 py-3 flex items-center cursor-pointer ${activeTab === 'algorithm' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => setActiveTab('algorithm')}
          >
            <Settings size={18} className="mr-3" />
            <span>AI Algorithm</span>
          </li>
          <li 
            className={`px-4 py-3 flex items-center cursor-pointer ${activeTab === 'reports' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => setActiveTab('reports')}
          >
            <List size={18} className="mr-3" />
            <span>Reports</span>
          </li>
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded">
          <div className="h-8 w-8 rounded-full bg-gray-700 mr-2"></div>
          <div>
            <p className="text-sm font-medium">{userProfile?.displayName || 'Admin User'}</p>
            <p className="text-xs text-gray-400">{userProfile?.email || 'admin@example.com'}</p>
          </div>
        </div>
        <div 
          className="flex items-center text-gray-400 text-sm cursor-pointer hover:text-white"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
