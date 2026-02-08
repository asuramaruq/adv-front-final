import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import styles from './Layout.module.css';

/** Top header bar — shows current user and logout button. */
export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div />
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.name ?? 'User'}
          </span>
          <span className={styles.userRole}>{user?.role ?? ''}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
