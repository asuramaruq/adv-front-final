import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
  logout,
  clearError,
  login,
  register,
  loadUser,
} from '@/features/auth/authSlice';
import type { AuthState } from '@/types';

// Mock apiClient
vi.mock('@/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('reducers', () => {
    it('should return initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle logout', () => {
      const loggedInState: AuthState = {
        user: { id: '1', email: 'a@b.com', name: 'Test', role: 'admin', avatar: '' },
        token: 'fake-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      const state = authReducer(loggedInState, logout());
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle clearError', () => {
      const errorState: AuthState = {
        ...initialState,
        error: 'Something went wrong',
      };
      const state = authReducer(errorState, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('login thunk', () => {
    it('should set loading on pending', () => {
      const state = authReducer(initialState, login.pending('', { email: '', password: '' }));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set user and token on fulfilled', () => {
      const payload = {
        user: { id: '1', email: 'a@b.com', name: 'Test', role: 'admin' as const, avatar: '' },
        token: 'test-token',
      };
      const state = authReducer(
        initialState,
        login.fulfilled(payload, '', { email: '', password: '' }),
      );
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set error on rejected', () => {
      const state = authReducer(
        initialState,
        login.rejected(null, '', { email: '', password: '' }, 'Invalid credentials'),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('register thunk', () => {
    it('should set loading on pending', () => {
      const state = authReducer(
        initialState,
        register.pending('', { email: '', password: '', name: '' }),
      );
      expect(state.loading).toBe(true);
    });

    it('should set user on fulfilled', () => {
      const payload = {
        user: { id: '2', email: 'new@b.com', name: 'New', role: 'developer' as const, avatar: '' },
        token: 'new-token',
      };
      const state = authReducer(
        initialState,
        register.fulfilled(payload, '', { email: '', password: '', name: '' }),
      );
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('New');
    });
  });

  describe('loadUser thunk', () => {
    it('should set user on fulfilled', () => {
      const user = { id: '1', email: 'a@b.com', name: 'Test', role: 'admin' as const, avatar: '' };
      const state = authReducer(initialState, loadUser.fulfilled(user, ''));
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear auth on rejected', () => {
      const loggedInState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        token: 'old',
      };
      const state = authReducer(loggedInState, loadUser.rejected(null, ''));
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });
});
