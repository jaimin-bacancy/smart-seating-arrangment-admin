import React from "react";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import LoginPage from "./pages/LoginPage";

// Main app with authentication flow
const AuthenticatedApp = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    // Loading spinner or message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage />;
  }

  // Show main app layout if authenticated
  return <AppLayout />;
};

// Root App component that provides context
const App: React.FC = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
