import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Loading } from '@/components/Loading';

/* ─── Lazy-loaded route components (code-splitting) ─── */
const LoginForm = lazy(() => import('@/features/auth/components/LoginForm'));
const RegisterForm = lazy(() => import('@/features/auth/components/RegisterForm'));
const Dashboard = lazy(() => import('@/features/projects/components/Dashboard'));
const Board = lazy(() => import('@/features/board/components/Board'));
const TaskForm = lazy(() => import('@/features/tasks/components/TaskForm'));
const TaskDetail = lazy(() => import('@/features/tasks/components/TaskDetail'));
const Analytics = lazy(() => import('@/features/analytics/components/Analytics'));

/**
 * Application route tree.
 *
 * Structure:
 *  /login               — public
 *  /register            — public
 *  /dashboard           — protected, lazy
 *  /projects/:id/board  — protected, lazy (nested)
 *  /projects/:id/tasks/new    — protected, lazy
 *  /projects/:id/tasks/:tid   — protected, lazy
 *  /projects/:id/tasks/:tid/edit — protected, lazy
 *  /analytics           — protected, lazy
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected routes — require authentication */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Nested project routes */}
            <Route path="/projects/:projectId/board" element={<Board />} />
            <Route path="/projects/:projectId/tasks/new" element={<TaskForm />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/projects/:projectId/tasks/:taskId/edit" element={<TaskForm />} />

            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
