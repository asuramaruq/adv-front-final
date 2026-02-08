import { useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchTaskById, deleteTask, clearSelectedTask } from '../tasksSlice';
import styles from './TaskDetail.module.css';

/** Task detail view — shows full task information with edit/delete actions. */
export default function TaskDetail() {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedTask, loading } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (taskId) dispatch(fetchTaskById(taskId));
    return () => {
      dispatch(clearSelectedTask());
    };
  }, [dispatch, taskId]);

  const handleDelete = useCallback(async () => {
    if (taskId && window.confirm('Delete this task?')) {
      await dispatch(deleteTask(taskId));
      navigate(`/projects/${projectId}/board`);
    }
  }, [dispatch, navigate, taskId, projectId]);

  if (loading || !selectedTask) {
    return <div className={styles.loading}>Loading task…</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{selectedTask.title}</h2>
        <div className={styles.actions}>
          <Link
            to={`/projects/${projectId}/tasks/${taskId}/edit`}
            className={styles.editBtn}
          >
            ✏️ Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            🗑 Delete
          </button>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={`${styles.badge} ${styles[selectedTask.status]}`}>
          {selectedTask.status}
        </span>
        <span className={`${styles.badge} ${styles[selectedTask.priority]}`}>
          {selectedTask.priority}
        </span>
        {selectedTask.dueDate && (
          <span className={styles.dueDate}>
            📅 Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className={styles.section}>
        <h3>Description</h3>
        <p>{selectedTask.description}</p>
      </div>

      {selectedTask.tags.length > 0 && (
        <div className={styles.section}>
          <h3>Tags</h3>
          <div className={styles.tags}>
            {selectedTask.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.timestamps}>
        <small>Created: {new Date(selectedTask.createdAt).toLocaleString()}</small>
        <small>Updated: {new Date(selectedTask.updatedAt).toLocaleString()}</small>
      </div>

      <Link to={`/projects/${projectId}/board`} className={styles.backLink}>
        ← Back to Board
      </Link>
    </div>
  );
}
