import { useTaskForm } from '../hooks/useTaskForm';
import styles from './TaskForm.module.css';

/**
 * TaskForm — uses the custom useTaskForm hook for all logic.
 * Demonstrates: React Hook Form + Zod schema + async title validation.
 */
export default function TaskForm() {
  const { register, errors, isSubmitting, isEditing, asyncValidation, onSubmit, handleCancel } =
    useTaskForm();

  return (
    <div className={styles.container}>
      <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>

      <form onSubmit={onSubmit} className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input id="title" {...register('title')} placeholder="Enter task title" />
          {errors.title && <span className={styles.error}>{errors.title.message}</span>}
          {asyncValidation.isValidating && (
            <span className={styles.validating}>Checking availability…</span>
          )}
          {asyncValidation.error && (
            <span className={styles.error}>{asyncValidation.error}</span>
          )}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Describe the task in detail (min 10 chars)"
            rows={4}
          />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>

        {/* Status + Priority row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="status">Status</label>
            <select id="status" {...register('status')}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="priority">Priority</label>
            <select id="priority" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Due Date + Tags row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="dueDate">Due Date</label>
            <input id="dueDate" type="date" {...register('dueDate')} />
          </div>
          <div className={styles.field}>
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              {...register('tags')}
              placeholder="e.g., frontend, bug, urgent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || asyncValidation.isValidating || !asyncValidation.isValid}
            className={styles.submitBtn}
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
