import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import type { User, AuthState } from '@/types';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

/* ─── Async Thunks ─── */

/** Login with email/password against mock JSON-Server API */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const users = await apiClient.get<User[]>(
        `/users?email=${encodeURIComponent(credentials.email)}`,
      );
      const user = users[0];
      if (!user || user.password !== credentials.password) {
        return rejectWithValue('Invalid email or password');
      }
      // Simulate a JWT token
      const token = btoa(
        JSON.stringify({ userId: user.id, exp: Date.now() + 86_400_000 }),
      );
      // Strip password from stored user
      const { password: _, ...safeUser } = user;
      return { user: safeUser as User, token };
    } catch {
      return rejectWithValue('Login failed. Please try again.');
    }
  },
);

/** Register a new user */
export const register = createAsyncThunk(
  'auth/register',
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      // Check for existing email
      const existing = await apiClient.get<User[]>(
        `/users?email=${encodeURIComponent(data.email)}`,
      );
      if (existing.length > 0) {
        return rejectWithValue('Email already registered');
      }
      const newUser = await apiClient.post<User>('/users', {
        id: crypto.randomUUID(),
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'developer',
        avatar: '',
      });
      const token = btoa(
        JSON.stringify({ userId: newUser.id, exp: Date.now() + 86_400_000 }),
      );
      const { password: _, ...safeUser } = newUser;
      return { user: safeUser as User, token };
    } catch {
      return rejectWithValue('Registration failed. Please try again.');
    }
  },
);

/** Restore user session from stored token */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token found');

      const decoded = JSON.parse(atob(token)) as {
        userId: string;
        exp: number;
      };
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('token');
        return rejectWithValue('Token expired');
      }
      const user = await apiClient.get<User>(`/users/${decoded.userId}`);
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    } catch {
      localStorage.removeItem('token');
      return rejectWithValue('Failed to load user session');
    }
  },
);

/* ─── Slice ─── */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── Login ───
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ─── Register ───
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ─── Load User ───
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
