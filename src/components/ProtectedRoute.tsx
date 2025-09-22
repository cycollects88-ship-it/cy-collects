import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = "/login"
}) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // // Show loading spinner while checking authentication
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  //     </div>
  //   );
  // }

  // // If authentication is required but user is not logged in
  // if (requireAuth && !user) {
  //   return <Navigate to={redirectTo} state={{ from: location }} replace />;
  // }

  // // If authentication is not required but user is logged in (for login/register pages)
  // if (!requireAuth && user) {
  //   return <Navigate to={redirectTo} replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
