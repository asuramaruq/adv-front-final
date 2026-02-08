import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadUser } from './features/auth/authSlice';

/**
 * Root application component.
 * Wraps the router in an ErrorBoundary and bootstraps auth on mount.
 */
function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  // On app load, try to restore the user session from stored token
  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
