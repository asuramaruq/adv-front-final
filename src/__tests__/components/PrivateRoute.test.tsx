import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import projectsReducer from '@/features/projects/projectsSlice';
import tasksReducer from '@/features/tasks/tasksSlice';
import { PrivateRoute } from '@/components/PrivateRoute';

const rootReducer = {
  auth: authReducer,
  projects: projectsReducer,
  tasks: tasksReducer,
};

function createTestStore(preloadedState?: Parameters<typeof configureStore>[0]['preloadedState']) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  { store = createTestStore(), initialRoute = '/' } = {},
) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </Provider>,
  );
}

describe('PrivateRoute', () => {
  it('should redirect to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        store: createTestStore({
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        }),
      },
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render child routes when authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        store: createTestStore({
          auth: {
            user: { id: '1', email: 'a@b.com', name: 'Test', role: 'admin', avatar: '' },
            token: 'valid-token',
            isAuthenticated: true,
            loading: false,
            error: null,
          },
        }),
      },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
