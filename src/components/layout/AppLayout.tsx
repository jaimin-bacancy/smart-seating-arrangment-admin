import { getAuth } from "firebase/auth";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUI } from "../../contexts/UIContext";
import useActiveTab from "../../hooks/useActiveTab";
import Dashboard from "../../pages/Dashboard";
import EmployeesPage from "../../pages/EmployeesPage";
import OfficeLayoutPage from "../../pages/OfficeLayoutPage";
import ProjectsPage from "../../pages/ProjectsPage";
import { TabType } from "../../types";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useActiveTab();
  const { showToast } = useUI();
  const { currentUser } = useAuth();

  const handleGenerateSeatingPlan = async () => {
    try {
      // Extract user data
      // const userData: Omit<User, "id"> = {
      //   displayName: formData.displayName,
      //   email: formData.email,
      //   role: formData.role,
      //   department: formData.department,
      //   employeeId: formData.employeeId,
      //   techSkills: formData.techSkills,
      //   currentProjects: [],
      // };

      const auth = getAuth();

      const idToken = await auth.currentUser.getIdToken();

      // Register the user
      // await AuthService.registerUser(formData.email, formData.password, userData);
      const response = await fetch(
        "https://us-central1-smart-seating-app-7a1b6.cloudfunctions.net/workspaceAssistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`, // 🔐 Must be set
          },
          body: JSON.stringify({
            prompt: "Test",
            uid: currentUser.uid,
          }),
        }
      );

      const data = await response.json();

      if (data?.error) {
        showToast(data?.error, "error");
        return;
      }
    } catch (error) {
      // console.error('Error adding employee:::', error?.message);
      showToast(
        error instanceof Error ? error.message : "Failed to get ai response",
        "error"
      );
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "layout":
        return <OfficeLayoutPage />;
      case "employees":
        return <EmployeesPage />;
      case "projects":
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
        <Header
          activeTab={activeTab as TabType}
          onGenerateSeatingPlan={handleGenerateSeatingPlan}
        />

        {/* Content Area */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AppLayout;
