import React from 'react';
import type { Task, TaskStatus, KanbanColumn } from '@/types';
import { ColumnCard } from './ColumnCard';
import styles from './Board.module.css';

interface BoardViewProps {
  projectName: string;
  columns: KanbanColumn[];
  groupedTasks: Record<TaskStatus, Task[]>;
  loading: boolean;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: () => void;
  onViewTask: (taskId: string) => void;
}

/** Board presenter — memoized pure component. */
export const BoardView = React.memo(function BoardView({
  projectName,
  columns,
  groupedTasks,
  loading,
  onMoveTask,
  onDeleteTask,
  onCreateTask,
  onViewTask,
}: BoardViewProps) {
  if (loading) {
    return <div className={styles.loading}>Loading board…</div>;
  }

  return (
    <div className={styles.board}>
      <div className={styles.boardHeader}>
        <h1>{projectName || 'Project Board'}</h1>
        <button onClick={onCreateTask} className={styles.addTaskBtn}>
          + New Task
        </button>
      </div>
      <div className={styles.columns}>
        {columns.map((col) => (
          <ColumnCard
            key={col.id}
            title={col.title}
            status={col.id}
            tasks={groupedTasks[col.id]}
            allStatuses={columns.map((c) => c.id)}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onViewTask={onViewTask}
          />
        ))}
      </div>
    </div>
  );
});
