import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import styles from './Layout.module.css';

/** Side navigation — lists dashboard, analytics, and all projects. */
export function Sidebar() {
  const { items: projects } = useAppSelector((state) => state.projects);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.logoIcon}>📋</span>
        <h2 className={styles.logoText}>TaskFlow</h2>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={linkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/analytics" className={linkClass}>
          📈 Analytics
        </NavLink>

        <div className={styles.navSection}>
          <h4 className={styles.navSectionTitle}>Projects</h4>
          {sortedProjects.map((project) => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}/board`}
              className={linkClass}
            >
              📁 {project.name}
            </NavLink>
          ))}
          {sortedProjects.length === 0 && (
            <span className={styles.emptyHint}>No projects yet</span>
          )}
        </div>
      </nav>
    </aside>
  );
}
