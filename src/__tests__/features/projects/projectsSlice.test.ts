import { describe, it, expect } from 'vitest';
import projectsReducer, {
  clearSelectedProject,
  clearProjectError,
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '@/features/projects/projectsSlice';
import type { ProjectsState, Project } from '@/types';

const sampleProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'A test project',
  ownerId: 'user-1',
  members: ['user-1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const initialState: ProjectsState = {
  items: [],
  selectedProject: null,
  loading: false,
  error: null,
};

describe('projectsSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const state = projectsReducer(undefined, { type: 'unknown' });
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it('should clear selected project', () => {
      const stateWithSelected: ProjectsState = {
        ...initialState,
        selectedProject: sampleProject,
      };
      const state = projectsReducer(stateWithSelected, clearSelectedProject());
      expect(state.selectedProject).toBeNull();
    });

    it('should clear project error', () => {
      const stateWithError: ProjectsState = { ...initialState, error: 'oops' };
      const state = projectsReducer(stateWithError, clearProjectError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchProjects thunk', () => {
    it('should set loading on pending', () => {
      const state = projectsReducer(initialState, fetchProjects.pending(''));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set items on fulfilled', () => {
      const projects = [sampleProject];
      const state = projectsReducer(
        initialState,
        fetchProjects.fulfilled(projects, ''),
      );
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(projects);
    });

    it('should set error on rejected', () => {
      const state = projectsReducer(
        initialState,
        fetchProjects.rejected(null, '', undefined, 'Failed'),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed');
    });
  });

  describe('fetchProjectById thunk', () => {
    it('should set selected project on fulfilled', () => {
      const state = projectsReducer(
        initialState,
        fetchProjectById.fulfilled(sampleProject, '', 'proj-1'),
      );
      expect(state.selectedProject).toEqual(sampleProject);
    });
  });

  describe('createProject thunk', () => {
    it('should add project to items on fulfilled', () => {
      const state = projectsReducer(
        initialState,
        createProject.fulfilled(sampleProject, '', {
          name: 'Test',
          description: 'Desc',
          ownerId: 'user-1',
          members: ['user-1'],
        }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('proj-1');
    });
  });

  describe('updateProject thunk', () => {
    it('should update project in items on fulfilled', () => {
      const stateWithProject: ProjectsState = {
        ...initialState,
        items: [sampleProject],
      };
      const updated = { ...sampleProject, name: 'Updated Name' };
      const state = projectsReducer(
        stateWithProject,
        updateProject.fulfilled(updated, '', { id: 'proj-1', name: 'Updated Name' }),
      );
      expect(state.items[0].name).toBe('Updated Name');
    });

    it('should also update selectedProject if it matches', () => {
      const stateWithSelected: ProjectsState = {
        ...initialState,
        items: [sampleProject],
        selectedProject: sampleProject,
      };
      const updated = { ...sampleProject, name: 'Updated' };
      const state = projectsReducer(
        stateWithSelected,
        updateProject.fulfilled(updated, '', { id: 'proj-1', name: 'Updated' }),
      );
      expect(state.selectedProject?.name).toBe('Updated');
    });
  });

  describe('deleteProject thunk', () => {
    it('should remove project from items on fulfilled', () => {
      const stateWithProject: ProjectsState = {
        ...initialState,
        items: [sampleProject],
      };
      const state = projectsReducer(
        stateWithProject,
        deleteProject.fulfilled('proj-1', '', 'proj-1'),
      );
      expect(state.items).toHaveLength(0);
    });
  });
});
