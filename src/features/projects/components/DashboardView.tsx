import React, { useState, useCallback } from 'react';
import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import styles from './Dashboard.module.css';

interface DashboardViewProps {
  projects: Project[];
  stats: { totalProjects: number; myProjects: number; totalMembers: number };
  loading: boolean;
  error: string | null;
  currentUserId: string;
  showCreateForm: boolean;
  onDeleteProject: (id: string) => void;
  onCreateProject: (name: string, description: string) => void;
  onToggleCreateForm: () => void;
}

/**
 * DashboardView — Presenter component (pure, memoized).
 * Receives all data and callbacks via props; contains no business logic.
 */
export const DashboardView = React.memo(function DashboardView({
  projects,
  stats,
  loading,
  error,
  currentUserId,
  showCreateForm,
  onDeleteProject,
  onCreateProject,
  onToggleCreateForm,
}: DashboardViewProps) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newName.trim()) {
        onCreateProject(newName.trim(), newDesc.trim());
        setNewName('');
        setNewDesc('');
      }
    },
    [newName, newDesc, onCreateProject],
  );

  if (loading) {
    return <div className={styles.loading}>Loading projects…</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={onToggleCreateForm} className={styles.createBtn}>
          {showCreateForm ? '✕ Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Stats overview cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalProjects}</span>
          <span className={styles.statLabel}>Total Projects</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.myProjects}</span>
          <span className={styles.statLabel}>My Projects</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalMembers}</span>
          <span className={styles.statLabel}>Team Members</span>
        </div>
      </div>

      {/* Inline create-project form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className={styles.createForm}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            required
            autoFocus
            className={styles.createInput}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Brief description"
            className={styles.createInput}
          />
          <button type="submit" className={styles.createSubmitBtn}>
            Create
          </button>
        </form>
      )}

      {/* Project grid */}
      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isOwner={project.ownerId === currentUserId}
            onDelete={onDeleteProject}
          />
        ))}
        {projects.length === 0 && (
          <p className={styles.emptyState}>
            No projects yet. Create your first one!
          </p>
        )}
      </div>
    </div>
  );
});
