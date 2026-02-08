import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import projectsReducer from '@/features/projects/projectsSlice';
import tasksReducer from '@/features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
  devTools: import.meta.env.DEV,
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
