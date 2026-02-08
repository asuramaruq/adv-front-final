/* ─── Type definitions for TaskFlow Project Management ─── */

/** User roles */
export type UserRole = 'admin' | 'developer' | 'designer';

/** Task status – matches Kanban column IDs */
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

/** Task priority levels */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/* ─── Domain entities ─── */

export interface User {
  id: string;
  email: string;
  password?: string; // only present in API responses for mock auth
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Redux slice state shapes ─── */

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  items: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  projects: ProjectsState;
  tasks: TasksState;
}

/* ─── Kanban column definition ─── */

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
}
