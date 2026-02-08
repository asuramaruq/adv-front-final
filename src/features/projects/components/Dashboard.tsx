import { useEffect, useMemo, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProjects, createProject, deleteProject } from '../projectsSlice';
import { DashboardView } from './DashboardView';

/**
 * Dashboard — Container component.
 * Fetches projects, computes stats, and delegates rendering to DashboardView.
 */
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: projects, loading, error } = useAppSelector(
    (state) => state.projects,
  );
  const { user } = useAppSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  /** Memoized computed statistics — avoids recalculation on every render */
  const stats = useMemo(
    () => ({
      totalProjects: projects.length,
      myProjects: projects.filter((p) => p.ownerId === user?.id).length,
      totalMembers: new Set(projects.flatMap((p) => p.members)).size,
    }),
    [projects, user],
  );

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (window.confirm('Delete this project? This cannot be undone.')) {
        dispatch(deleteProject(id));
      }
    },
    [dispatch],
  );

  const handleCreateProject = useCallback(
    async (name: string, description: string) => {
      if (!user) return;
      await dispatch(
        createProject({
          name,
          description,
          ownerId: user.id,
          members: [user.id],
        }),
      );
      setShowCreateForm(false);
    },
    [dispatch, user],
  );

  const handleToggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  return (
    <DashboardView
      projects={projects}
      stats={stats}
      loading={loading}
      error={error}
      currentUserId={user?.id ?? ''}
      showCreateForm={showCreateForm}
      onDeleteProject={handleDeleteProject}
      onCreateProject={handleCreateProject}
      onToggleCreateForm={handleToggleCreateForm}
    />
  );
}
