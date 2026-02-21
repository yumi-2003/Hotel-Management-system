import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { hasRole, getDashboardRoute } from '../utils/roleUtils';
import type { ReactNode } from 'react';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(user?.role, allowedRoles)) {
    // Redirect to user's appropriate dashboard
    const dashboardRoute = getDashboardRoute(user?.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
