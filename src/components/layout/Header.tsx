import React from "react";
import { firestore } from "../../config/firebaseConfig";
import { useUI } from "../../contexts/UIContext";
import { useAuth } from "../../hooks/useAuth";
import useCollection from "../../hooks/useCollection";
import { Notification, TabType } from "../../types";

interface HeaderProps {
  activeTab: TabType;
  onGenerateSeatingPlan: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onGenerateSeatingPlan,
}) => {
  const { openSidebar } = useUI();
  const { userProfile } = useAuth();

  // Get unread notifications for the counter
  const { documents: notifications } = useCollection<Notification>(
    "notifications",
    userProfile
      ? [
          {
            field: "recipients",
            operator: "array-contains",
            value: firestore.collection("users").doc(userProfile.id),
          },
          {
            field: "readBy",
            operator: "array-contains",
            value: firestore.collection("users").doc(userProfile.id),
          },
        ]
      : [],
    { field: "createdAt", direction: "desc" },
    10
  );

  // Get tab title based on activeTab
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Overview";
      case "layout":
        return "Office Layout Management";
      case "employees":
        return "Employee Management";
      case "projects":
        return "Employee Projects";
      case "reports":
        return "Reports & Analytics";
      case "profile":
        return "My Profile";
      default:
        return "Smart Office Admin";
    }
  };

  return (
    <div className="bg-white shadow px-6 py-5 flex justify-between items-center">
      <h2 className="text-lg font-medium">{getTabTitle()}</h2>
      <button
        onClick={() => onGenerateSeatingPlan()}
        className="bg-[#E7873C] hover:bg-[#E7873C] text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Ask AI
      </button>
    </div>
  );
};

export default Header;
