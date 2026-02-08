import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchTasksByProject, updateTask, deleteTask } from '@/features/tasks/tasksSlice';
import { fetchProjectById } from '@/features/projects/projectsSlice';
import { BoardView } from './BoardView';
import type { TaskStatus, KanbanColumn } from '@/types';

/** Static column definitions */
const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

/**
 * Board — Container component.
 * Fetches project + tasks, groups tasks by status, and passes handlers down.
 */
export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: tasks, loading } = useAppSelector((state) => state.tasks);
  const { selectedProject } = useAppSelector((state) => state.projects);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasksByProject(projectId));
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  /** useMemo: group tasks by status to avoid re-grouping on every render */
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, typeof tasks> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    return groups;
  }, [tasks]);

  const handleMoveTask = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      dispatch(updateTask({ id: taskId, status: newStatus }));
    },
    [dispatch],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      dispatch(deleteTask(taskId));
    },
    [dispatch],
  );

  const handleCreateTask = useCallback(() => {
    navigate(`/projects/${projectId}/tasks/new`);
  }, [navigate, projectId]);

  const handleViewTask = useCallback(
    (taskId: string) => {
      navigate(`/projects/${projectId}/tasks/${taskId}`);
    },
    [navigate, projectId],
  );

  return (
    <BoardView
      projectName={selectedProject?.name ?? ''}
      columns={COLUMNS}
      groupedTasks={groupedTasks}
      loading={loading}
      onMoveTask={handleMoveTask}
      onDeleteTask={handleDeleteTask}
      onCreateTask={handleCreateTask}
      onViewTask={handleViewTask}
    />
  );
}
