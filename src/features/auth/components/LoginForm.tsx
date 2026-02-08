import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, clearError } from '../authSlice';
import styles from './AuthLayout.module.css';

/**
 * Login form — accessible from /login.
 * Uses Redux async thunk for authentication against mock API.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearError());
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    },
    [dispatch, navigate, email, password],
  );

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo}>📋 TaskFlow</div>
        <h2 className={styles.heading}>Sign In</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className={styles.hint}>
          Demo: admin@example.com / password123
        </p>
      </div>
    </div>
  );
}
