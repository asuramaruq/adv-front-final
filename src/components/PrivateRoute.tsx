import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

/**
 * Route guard: renders nested routes only when authenticated.
 * Redirects to /login otherwise, preserving the intended destination.
 */
export function PrivateRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
