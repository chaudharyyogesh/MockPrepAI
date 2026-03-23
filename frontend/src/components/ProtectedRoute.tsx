import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isHydrated, isCheckingSession } = useAuthStore();

  // Wait for persisted auth to load and session check to finish.
  if (!isHydrated || isCheckingSession) {
    return <div className="text-sm text-slate-400">Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

