// src/pages/ErrorScreen.js
import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorScreen = () => {
  const error = useRouteError();

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-4 text-gray-600">{error?.message || "This page doesn’t exist."}</p>
    </div>
  );
};

export default ErrorScreen;
