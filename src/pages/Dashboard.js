// src/pages/Dashboard.js
import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin!</h1>
      <p>Email: {user?.email || "admin@smartoffice.com"}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
