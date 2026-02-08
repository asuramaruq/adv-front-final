import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import type { Project, ProjectsState } from '@/types';

const initialState: ProjectsState = {
  items: [],
  selectedProject: null,
  loading: false,
  error: null,
};

/* ─── Async Thunks ─── */

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.get<Project[]>('/projects');
    } catch {
      return rejectWithValue('Failed to fetch projects');
    }
  },
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await apiClient.get<Project>(`/projects/${id}`);
    } catch {
      return rejectWithValue('Failed to fetch project');
    }
  },
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (
    data: Pick<Project, 'name' | 'description' | 'ownerId' | 'members'>,
    { rejectWithValue },
  ) => {
    try {
      return await apiClient.post<Project>('/projects', {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      return rejectWithValue('Failed to create project');
    }
  },
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async (
    { id, ...data }: Partial<Project> & { id: string },
    { rejectWithValue },
  ) => {
    try {
      return await apiClient.patch<Project>(`/projects/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      return rejectWithValue('Failed to update project');
    }
  },
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      return id;
    } catch {
      return rejectWithValue('Failed to delete project');
    }
  },
);

/* ─── Slice ─── */

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSelectedProject(state) {
      state.selectedProject = null;
    },
    clearProjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      // Delete
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearSelectedProject, clearProjectError } =
  projectsSlice.actions;
export default projectsSlice.reducer;
