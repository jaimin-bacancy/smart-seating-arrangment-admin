import React from 'react';
import useActiveTab from '../../hooks/useActiveTab';
import Dashboard from '../../pages/Dashboard';
import EmployeesPage from '../../pages/EmployeesPage';
import OfficeLayoutPage from '../../pages/OfficeLayoutPage';
import ProjectsPage from '../../pages/ProjectsPage';
import { TabType } from '../../types';
import Header from './Header';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useActiveTab();

  const handleGenerateSeatingPlan = () => {
    // Navigate to algorithm tab if not already there
    if (activeTab !== 'algorithm') {
      setActiveTab('algorithm');
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'layout':
        return <OfficeLayoutPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'projects':
        return <ProjectsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab as TabType} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        {/* Top Navigation */}
        <Header activeTab={activeTab as TabType} onGenerateSeatingPlan={handleGenerateSeatingPlan} />
        
        {/* Content Area */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AppLayout;
