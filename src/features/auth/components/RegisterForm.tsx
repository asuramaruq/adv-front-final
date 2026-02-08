import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register as registerAction, clearError } from '../authSlice';
import styles from './AuthLayout.module.css';

/** Registration form with client-side validation. */
export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError('');
      dispatch(clearError());

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters');
        return;
      }

      const result = await dispatch(
        registerAction({ name, email, password }),
      );
      if (registerAction.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    },
    [dispatch, navigate, name, email, password, confirmPassword],
  );

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logo}>📋 TaskFlow</div>
        <h2 className={styles.heading}>Create Account</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(error || validationError) && (
            <div className={styles.error} role="alert">
              {error || validationError}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="Min 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
