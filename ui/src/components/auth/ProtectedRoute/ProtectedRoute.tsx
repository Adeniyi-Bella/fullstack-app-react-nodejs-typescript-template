import { memo, type ReactNode } from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@store/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = memo<ProtectedRouteProps>(({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but save where they were trying to go
    return <Navigate to="/login" search={{ redirect: location.href }} />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';