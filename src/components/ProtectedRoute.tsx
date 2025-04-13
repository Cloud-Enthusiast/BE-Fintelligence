
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('Loan Officer' | 'Applicant')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If specific roles are required, check if the user has one of those roles
  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    // Redirect officers to dashboard and applicants to application page
    const redirectPath = user.role === 'Loan Officer' ? '/dashboard' : '/application';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
