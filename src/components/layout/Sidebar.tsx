import { LayoutGrid, LogOut, PieChart, User, Users } from "lucide-react";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AuthService } from "../../services/auth";
import { TabType } from "../../types";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await AuthService.logoutUser();
      // Redirect handled by AuthContext
    } catch (error) {
      // console.error('Logout failed:', error);
    }
  };

  return (
    <div
      className="w-64 text-black flex flex-col"
      style={{ backgroundColor: "#FEF8F3" }}
    >
      <div className="p-4 border-gray-800 flex items-center">
        <div className="h-8 w-8 rounded-full text-white bg-[#E7873C] mr-3 flex items-center justify-center">
          <span className="font-bold">S</span>
        </div>
        <h1 className="font-bold text-lg">Smart Office</h1>
      </div>

      <div className="flex-grow overflow-y-auto">
        <ul className="py-4">
          <li
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "dashboard" ? "text-white" : "text-black"
            }`}
            style={{
              backgroundColor:
                activeTab === "dashboard" ? "#E7873C " : "transparent",
            }}
            onClick={() => setActiveTab("dashboard")}
          >
            <PieChart size={18} className="mr-3" />
            <span>Dashboard</span>
          </li>
          <li
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "layout" ? "text-white" : "text-black"
            }`}
            style={{
              backgroundColor:
                activeTab === "layout" ? "#E7873C " : "transparent",
            }}
            onClick={() => setActiveTab("layout")}
          >
            <LayoutGrid size={18} className="mr-3" />
            <span>Office Layout</span>
          </li>
          <li
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "employees" ? "text-white" : "text-black"
            }`}
            style={{
              backgroundColor:
                activeTab === "employees" ? "#E7873C " : "transparent",
            }}
            onClick={() => setActiveTab("employees")}
          >
            <Users size={18} className="mr-3" />
            <span>Employees</span>
          </li>
          <li
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "projects" ? "text-white" : "text-black"
            }`}
            style={{
              backgroundColor:
                activeTab === "projects" ? "#E7873C " : "transparent",
            }}
            onClick={() => setActiveTab("projects")}
          >
            <Users size={18} className="mr-3" />
            <span>Projects</span>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div
          className={`flex items-center mb-4 cursor-pointer ${
            activeTab === "profile" ? "bg-[#E7873C]" : "hover:bg-[#E7873C]"
          } p-2 rounded`}
          onClick={() => setActiveTab("profile")}
        >
          <div className="h-8 w-8 rounded-full bg-gray-700 mr-2 flex items-center justify-center">
            <User size={16} className="text-[#E7873C]" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {userProfile?.displayName || "Admin User"}
            </p>
            <p className="text-xs text-gray-400">
              {userProfile?.email || "admin@example.com"}
            </p>
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
