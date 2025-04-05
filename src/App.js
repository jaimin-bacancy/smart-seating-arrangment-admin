import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Outlet,
  Navigate
} from "react-router-dom";
import LoginScreen from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard")); // You can create this later

const AppLayout = () => (
  <div>
    <Outlet />
  </div>
);

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LoginScreen />
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/app/dashboard" />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" />
  }
]);

export default appRouter;
