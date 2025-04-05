import React, { createContext, useContext, useState, ReactNode } from 'react';
import { log } from 'util';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

interface SidebarConfig {
  isOpen: boolean;
  content: React.ReactNode;
  width: string;
  onClose: () => void;
}

interface UIContextProps {
  // Modal
  modal: ModalConfig;
  openModal: (title: string, content: React.ReactNode, onClose?: () => void) => void;
  closeModal: () => void;
  
  // Sidebar
  sidebar: SidebarConfig;
  openSidebar: (content: React.ReactNode, width?: string, onClose?: () => void) => void;
  closeSidebar: () => void;
  
  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const UIContext = createContext<UIContextProps>({
  // Modal defaults
  modal: {
    isOpen: false,
    title: '',
    content: null,
    onClose: () => {}
  },
  openModal: () => {},
  closeModal: () => {},
  
  // Sidebar defaults
  sidebar: {
    isOpen: false,
    content: null,
    width: '320px',
    onClose: () => {}
  },
  openSidebar: () => {},
  closeSidebar: () => {},
  
  // Toast defaults
  showToast: () => {},
  
  // Theme defaults
  isDarkMode: false,
  toggleDarkMode: () => {}
});

export const useUI = () => useContext(UIContext);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // Modal state
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    content: null,
    onClose: () => {}
  });
  
  // Sidebar state
  const [sidebar, setSidebar] = useState<SidebarConfig>({
    isOpen: false,
    content: null,
    width: '320px',
    onClose: () => {}
  });
  
  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'true'
  );
  
  // Modal functions
  const openModal = (title: string, content: React.ReactNode, onClose = () => {}) => {
    console.log('openModal called');
    setModal({
      isOpen: true,
      title,
      content,
      onClose
    });
  };
  
  const closeModal = () => {
    const { onClose } = modal;
    setModal({
      isOpen: false,
      title: '',
      content: null,
      onClose: () => {}
    });
    onClose();
  };
  
  // Sidebar functions
  const openSidebar = (content: React.ReactNode, width = '320px', onClose = () => {}) => {
    setSidebar({
      isOpen: true,
      content,
      width,
      onClose
    });
  };
  
  const closeSidebar = () => {
    const { onClose } = sidebar;
    setSidebar({
      isOpen: false,
      content: null,
      width: '320px',
      onClose: () => {}
    });
    onClose();
  };
  
  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };
  
  // Theme functions
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    
    // Toggle class on document element for global CSS changes
    if (newValue) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  const value = {
    modal,
    openModal,
    closeModal,
    sidebar,
    openSidebar,
    closeSidebar,
    showToast,
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <UIContext.Provider value={value}>
      {children}
      {console.log('modal.isOpen::', modal.isOpen)}
      {/* Render Modal */}
      {modal.isOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3">
                  <h3 className="text-lg font-medium text-gray-900">{modal.title}</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2">
                  {modal.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Render Sidebar */}
      {sidebar.isOpen && (
        <div className="fixed z-40 inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeSidebar}
            ></div>
            <section className="absolute inset-y-0 right-0 max-w-full flex">
              <div 
                className="relative w-screen bg-white"
                style={{ width: sidebar.width }}
              >
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-auto">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <button
                        className="text-gray-400 hover:text-gray-500"
                        onClick={closeSidebar}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    {sidebar.content}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
      
      {/* Render Toast */}
      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <div 
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};

export default UIProvider;
