import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createTask, updateTask, fetchTaskById } from '../tasksSlice';
import { useAsyncValidation } from './useAsyncValidation';

/**
 * Zod schema for task form validation.
 * Synchronous rules are enforced here; async title uniqueness
 * is handled by the useAsyncValidation hook.
 */
const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be under 1000 characters'),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

/**
 * Custom hook that encapsulates all task-form logic:
 * - React Hook Form state & validation (Zod schema)
 * - Async title-uniqueness validation
 * - Pre-populates fields when editing an existing task
 * - Dispatches create/update thunks on submit
 *
 * This is the "Custom Hooks in React" pattern required by the assignment.
 */
export function useTaskForm() {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedTask } = useAppSelector((state) => state.tasks);
  const isEditing = !!taskId;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
      tags: '',
    },
  });

  const watchedTitle = watch('title');

  // Async uniqueness check on the title field
  const asyncValidation = useAsyncValidation(
    watchedTitle,
    projectId ?? '',
    taskId,
  );

  // Load task data when editing
  useEffect(() => {
    if (isEditing && taskId) {
      dispatch(fetchTaskById(taskId));
    }
  }, [dispatch, isEditing, taskId]);

  // Pre-populate form when the selected task is loaded
  useEffect(() => {
    if (isEditing && selectedTask) {
      reset({
        title: selectedTask.title,
        description: selectedTask.description,
        status: selectedTask.status,
        priority: selectedTask.priority,
        assigneeId: selectedTask.assigneeId ?? '',
        dueDate: selectedTask.dueDate
          ? selectedTask.dueDate.split('T')[0]
          : '',
        tags: selectedTask.tags.join(', '),
      });
    }
  }, [isEditing, selectedTask, reset]);

  const onSubmit = useCallback(
    async (data: TaskFormData) => {
      if (!asyncValidation.isValid || !projectId) return;

      const taskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (isEditing && taskId) {
        await dispatch(updateTask({ id: taskId, ...taskData }));
      } else {
        await dispatch(createTask(taskData as any));
      }
      navigate(`/projects/${projectId}/board`);
    },
    [dispatch, navigate, projectId, taskId, isEditing, asyncValidation.isValid],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    register,
    errors,
    isSubmitting,
    isEditing,
    asyncValidation,
    onSubmit: handleSubmit(onSubmit),
    handleCancel,
    projectId,
  };
}
