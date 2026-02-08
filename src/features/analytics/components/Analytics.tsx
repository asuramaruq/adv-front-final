import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProjects } from '@/features/projects/projectsSlice';
import { apiClient } from '@/api/apiClient';
import { AnalyticsView } from './AnalyticsView';
import type { Task } from '@/types';

/**
 * Analytics — Container component.
 * Fetches all tasks + projects, computes statistics, and passes to presenter.
 */
export default function Analytics() {
  const dispatch = useAppDispatch();
  const { items: projects } = useAppSelector((state) => state.projects);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchProjects());
    apiClient
      .get<Task[]>('/tasks')
      .then((tasks) => setAllTasks(tasks))
      .finally(() => setLoading(false));
  }, [dispatch]);

  /** Memoized statistics to prevent recalculation on unrelated renders */
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };
    const byPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    allTasks.forEach((task) => {
      if (byStatus[task.status] !== undefined) byStatus[task.status]++;
      if (byPriority[task.priority] !== undefined) byPriority[task.priority]++;
    });

    const totalTasks = allTasks.length;
    const completionRate =
      totalTasks > 0 ? Math.round((byStatus.done / totalTasks) * 100) : 0;

    const projectStats = projects.map((project) => {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
      return {
        name: project.name,
        total: projectTasks.length,
        done: doneTasks,
        rate:
          projectTasks.length > 0
            ? Math.round((doneTasks / projectTasks.length) * 100)
            : 0,
      };
    });

    return {
      byStatus,
      byPriority,
      totalTasks,
      completionRate,
      totalProjects: projects.length,
      projectStats,
    };
  }, [allTasks, projects]);

  return <AnalyticsView stats={stats} loading={loading} />;
}
