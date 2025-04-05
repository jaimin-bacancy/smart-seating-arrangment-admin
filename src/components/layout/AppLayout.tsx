import React from 'react';
import { TabType } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';
import useActiveTab from '../../hooks/useActiveTab';
import Dashboard from '../../pages/Dashboard';
import OfficeLayoutPage from '../../pages/OfficeLayoutPage';
import EmployeesPage from '../../pages/EmployeesPage';
import AlgorithmPage from '../../pages/AlgorithmPage';
import ReportsPage from '../../pages/ReportsPage';

const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useActiveTab();

  const handleGenerateSeatingPlan = () => {
    // Navigate to algorithm tab if not already there
    if (activeTab !== 'algorithm') {
      setActiveTab('algorithm');
    }
    
    // The actual generation will be handled by the AlgorithmPage component
    // We could pass a state flag to trigger the generation automatically
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
      case 'algorithm':
        return <AlgorithmPage />;
      case 'reports':
        return <ReportsPage />;
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
