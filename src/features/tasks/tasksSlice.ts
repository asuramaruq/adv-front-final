import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import type { Task, TasksState } from '@/types';

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
};

/* ─── Async Thunks ─── */

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await apiClient.get<Task[]>(
        `/tasks?projectId=${encodeURIComponent(projectId)}`,
      );
    } catch {
      return rejectWithValue('Failed to fetch tasks');
    }
  },
);

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.get<Task[]>('/tasks');
    } catch {
      return rejectWithValue('Failed to fetch tasks');
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await apiClient.get<Task>(`/tasks/${taskId}`);
    } catch {
      return rejectWithValue('Failed to fetch task');
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue },
  ) => {
    try {
      return await apiClient.post<Task>('/tasks', {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      return rejectWithValue('Failed to create task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (
    { id, ...data }: Partial<Task> & { id: string },
    { rejectWithValue },
  ) => {
    try {
      return await apiClient.patch<Task>(`/tasks/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      return rejectWithValue('Failed to update task');
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      return taskId;
    } catch {
      return rejectWithValue('Failed to delete task');
    }
  },
);

/**
 * Async validation thunk — checks whether a task title already exists
 * within the same project. Used for async form validation.
 */
export const validateTaskTitle = createAsyncThunk(
  'tasks/validateTitle',
  async (
    {
      title,
      projectId,
      excludeId,
    }: { title: string; projectId: string; excludeId?: string },
    { rejectWithValue },
  ) => {
    try {
      const tasks = await apiClient.get<Task[]>(
        `/tasks?projectId=${encodeURIComponent(projectId)}`,
      );
      const duplicate = tasks.find(
        (t) =>
          t.title.toLowerCase() === title.toLowerCase() && t.id !== excludeId,
      );
      if (duplicate) {
        return rejectWithValue(
          'A task with this title already exists in this project',
        );
      }
      return true;
    } catch {
      return rejectWithValue('Validation failed');
    }
  },
);

/* ─── Slice ─── */

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearSelectedTask(state) {
      state.selectedTask = null;
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch by project
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      // Create
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearSelectedTask, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
