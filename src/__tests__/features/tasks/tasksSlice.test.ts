import { describe, it, expect } from 'vitest';
import tasksReducer, {
  clearSelectedTask,
  clearTaskError,
  fetchTasksByProject,
  fetchAllTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '@/features/tasks/tasksSlice';
import type { TasksState, Task } from '@/types';

const sampleTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task description',
  status: 'todo',
  priority: 'medium',
  assigneeId: 'user-1',
  projectId: 'proj-1',
  tags: ['test'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
};

describe('tasksSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const state = tasksReducer(undefined, { type: 'unknown' });
      expect(state.items).toEqual([]);
      expect(state.selectedTask).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('should clear selected task', () => {
      const stateWithSelected: TasksState = {
        ...initialState,
        selectedTask: sampleTask,
      };
      const state = tasksReducer(stateWithSelected, clearSelectedTask());
      expect(state.selectedTask).toBeNull();
    });

    it('should clear task error', () => {
      const stateWithError: TasksState = { ...initialState, error: 'oops' };
      const state = tasksReducer(stateWithError, clearTaskError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchTasksByProject thunk', () => {
    it('should set loading on pending', () => {
      const state = tasksReducer(
        initialState,
        fetchTasksByProject.pending('', 'proj-1'),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set items on fulfilled', () => {
      const tasks = [sampleTask];
      const state = tasksReducer(
        initialState,
        fetchTasksByProject.fulfilled(tasks, '', 'proj-1'),
      );
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(tasks);
    });

    it('should set error on rejected', () => {
      const state = tasksReducer(
        initialState,
        fetchTasksByProject.rejected(null, '', 'proj-1', 'Failed'),
      );
      expect(state.error).toBe('Failed');
    });
  });

  describe('fetchAllTasks thunk', () => {
    it('should set items on fulfilled', () => {
      const tasks = [sampleTask];
      const state = tasksReducer(
        initialState,
        fetchAllTasks.fulfilled(tasks, ''),
      );
      expect(state.items).toEqual(tasks);
    });
  });

  describe('fetchTaskById thunk', () => {
    it('should set selected task on fulfilled', () => {
      const state = tasksReducer(
        initialState,
        fetchTaskById.fulfilled(sampleTask, '', 'task-1'),
      );
      expect(state.selectedTask).toEqual(sampleTask);
    });
  });

  describe('createTask thunk', () => {
    it('should add task to items on fulfilled', () => {
      const state = tasksReducer(
        initialState,
        createTask.fulfilled(sampleTask, '', {
          title: 'Test',
          description: 'Desc',
          status: 'todo',
          priority: 'medium',
          projectId: 'proj-1',
          tags: [],
        }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].title).toBe('Test Task');
    });
  });

  describe('updateTask thunk', () => {
    it('should update task in items on fulfilled', () => {
      const stateWithTask: TasksState = { ...initialState, items: [sampleTask] };
      const updated = { ...sampleTask, title: 'Updated Title' };
      const state = tasksReducer(
        stateWithTask,
        updateTask.fulfilled(updated, '', { id: 'task-1', title: 'Updated Title' }),
      );
      expect(state.items[0].title).toBe('Updated Title');
    });

    it('should update selectedTask if it matches', () => {
      const stateWithSelected: TasksState = {
        ...initialState,
        items: [sampleTask],
        selectedTask: sampleTask,
      };
      const updated = { ...sampleTask, status: 'done' as const };
      const state = tasksReducer(
        stateWithSelected,
        updateTask.fulfilled(updated, '', { id: 'task-1', status: 'done' }),
      );
      expect(state.selectedTask?.status).toBe('done');
    });
  });

  describe('deleteTask thunk', () => {
    it('should remove task from items on fulfilled', () => {
      const stateWithTask: TasksState = { ...initialState, items: [sampleTask] };
      const state = tasksReducer(
        stateWithTask,
        deleteTask.fulfilled('task-1', '', 'task-1'),
      );
      expect(state.items).toHaveLength(0);
    });
  });
});
