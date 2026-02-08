import React from 'react';
import type { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import styles from './ColumnCard.module.css';

interface ColumnCardProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  allStatuses: TaskStatus[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
}

/** Kanban column — Presenter (memoized). */
export const ColumnCard = React.memo(function ColumnCard({
  title,
  status,
  tasks,
  allStatuses,
  onMoveTask,
  onDeleteTask,
  onViewTask,
}: ColumnCardProps) {
  return (
    <div className={`${styles.column} ${styles[status]}`}>
      <div className={styles.columnHeader}>
        <h3>{title}</h3>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.taskList} role="list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            currentStatus={status}
            allStatuses={allStatuses}
            onMove={onMoveTask}
            onDelete={onDeleteTask}
            onView={onViewTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className={styles.empty}>No tasks yet</div>
        )}
      </div>
    </div>
  );
});
