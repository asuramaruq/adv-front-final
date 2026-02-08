import React, { useCallback } from 'react';
import type { Task, TaskStatus } from '@/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  currentStatus: TaskStatus;
  allStatuses: TaskStatus[];
  onMove: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onView: (taskId: string) => void;
}

/**
 * TaskCard — Presenter (memoized).
 * Renders a single task within a Kanban column.
 * Uses useCallback on event handlers to prevent unnecessary re-renders.
 */
export const TaskCard = React.memo(function TaskCard({
  task,
  currentStatus,
  allStatuses,
  onMove,
  onDelete,
  onView,
}: TaskCardProps) {
  const handleMove = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onMove(task.id, e.target.value as TaskStatus);
    },
    [onMove, task.id],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(task.id);
    },
    [onDelete, task.id],
  );

  const handleView = useCallback(() => {
    onView(task.id);
  }, [onView, task.id]);

  return (
    <div
      className={styles.card}
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleView()}
      aria-label={`Task: ${task.title}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.title}>{task.title}</h4>
        <button
          onClick={handleDelete}
          className={styles.deleteBtn}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>

      {task.description && (
        <p className={styles.description}>
          {task.description.length > 80
            ? `${task.description.slice(0, 80)}…`
            : task.description}
        </p>
      )}

      <div className={styles.cardFooter}>
        <span className={`${styles.priority} ${styles[task.priority]}`}>
          {task.priority}
        </span>
        <select
          value={currentStatus}
          onChange={handleMove}
          onClick={(e) => e.stopPropagation()}
          className={styles.moveSelect}
          aria-label="Move task to column"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {task.tags.length > 0 && (
        <div className={styles.tags}>
          {task.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
