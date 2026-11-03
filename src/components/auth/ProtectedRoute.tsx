import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarded = true,
}) => {
  const { user, isAuthenticated, isOnboarded, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#080B09]">
        <Loader2 className="w-8 h-8 text-[#B6FF4A] animate-spin" />
        <span className="text-xs font-mono text-[#A0AAA0] uppercase tracking-wider">
          Verifying HUSTL Identity...
        </span>
      </div>
    );
  }

  // Not logged in -> send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but needs onboarding and this route requires completed onboarding
  if (requireOnboarded && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
