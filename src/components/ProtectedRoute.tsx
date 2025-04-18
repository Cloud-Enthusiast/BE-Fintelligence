
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('Loan Officer' | 'Applicant')[];
  redirectPath?: string;
}

const ProtectedRoute = ({ children, allowedRoles, redirectPath }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Get default redirect based on user role
  const getDefaultRedirect = () => {
    if (user?.role === 'Loan Officer') return '/dashboard';
    if (user?.role === 'Applicant') return '/application';
    return '/';
  };

  // If specific roles are required, check if the user has one of those roles
  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    // Redirect to the specified path or the default path for the user's role
    return <Navigate to={redirectPath || getDefaultRedirect()} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
