import { useState, useEffect } from 'react';
import { TabType } from '../types';

// Custom hook to manage active tab state
export const useActiveTab = (initialTab: TabType = 'dashboard') => {
  // Try to get the last active tab from localStorage, or use the initialTab
  const getInitialTab = (): TabType => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as TabType) || initialTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  
  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  // Function to change the active tab
  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  return {
    activeTab,
    setActiveTab: changeTab
  };
};

export default useActiveTab;