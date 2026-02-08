# Final Project 

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [State Management](#4-state-management)
5. [Routing, Lazy Loading & Protected Routes](#5-routing-lazy-loading--protected-routes)
6. [Form Handling & Asynchronous Validation](#6-form-handling--asynchronous-validation)
7. [Performance Optimisation](#7-performance-optimisation)
8. [Design Patterns](#8-design-patterns)
9. [Testing Strategy & Results](#9-testing-strategy--results)
10. [Build Output & Bundle Analysis](#10-build-output--bundle-analysis)
11. [CI / CD & Deployment Plan](#11-ci--cd--deployment-plan)

---

## 1. Project Overview

TaskFlow is a project and task management Single Page Application (SPA). Users can log in, create and browse projects, manage tasks on a Kanban-style board, and view analytics. The application simulates a real backend through `json-server`, which provides a full REST API from a `db.json` file.

### Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication** | Login / Register forms with token-based session persistence via `localStorage`. |
| 2 | **Project Dashboard** | Lists all projects with member count, task counts, and navigation to individual boards. |
| 3 | **Kanban Board** | Displays tasks grouped by status columns (To Do → In Progress → Review → Done). Tasks can be moved between columns, created, viewed, and deleted. |
| 4 | **Task Management** | Complex creation/edit form with multi-field validation, including asynchronous title-uniqueness checking against the API. |
| 5 | **Analytics** | Aggregated project and task statistics — totals, distribution by status/priority, and per-project breakdowns. |

---

## 2. Architecture & Folder Structure

The project follows a **feature-based folder structure**, where each domain concern (auth, projects, tasks, board, analytics) lives under its own directory inside `src/features/`. Shared infrastructure lives in top-level directories.

```
src/
├── api/              # Generic fetch wrapper (apiClient.ts)
├── app/              # Redux store configuration & typed hooks
├── components/       # Shared UI — PrivateRoute, Loading, ErrorBoundary, Layout/
├── features/
│   ├── auth/         # Auth slice + LoginForm / RegisterForm
│   ├── projects/     # Projects slice + Dashboard container/presenter
│   ├── board/        # Board container/presenter + ColumnCard, TaskCard
│   ├── tasks/        # Tasks slice + TaskForm, TaskDetail + custom hooks
│   └── analytics/    # Analytics container/presenter
├── hooks/            # App-wide custom hooks (useDebounce)
├── routes/           # Route tree with lazy imports
└── types/            # Shared TypeScript interfaces and type aliases
```

### Data Flow

```
  Browser
    │
    ▼
  React Router  ──►  PrivateRoute guard
    │                      │
    ▼                      ▼
  AppLayout          <Outlet />
  (Sidebar / Header)       │
    │                      ▼
    └──────►  Feature Container  ──►  useAppDispatch / useAppSelector
                    │                        │
                    ▼                        ▼
              Presenter (memo)         Redux Store (slices)
                                        │
                                 createAsyncThunk
                                        │
                                        ▼
                                   apiClient  ──►  json-server (:3001)
```

All network I/O is channelled through `apiClient.ts`, a thin wrapper around `fetch` with typed generic methods (`get<T>`, `post<T>`, etc.). During development, the Vite dev server proxies every `/api` request to `json-server` running on port 3001, so the front-end code uses clean relative paths like `/api/tasks` without dealing with CORS or port management.

---

## 3. Technology Stack & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| **UI Library** | React 18.3 | Component-based architecture with a mature ecosystem. Concurrent features (Suspense, startTransition) enable smoother loading states. Chosen over Angular because the existing companion projects in this workspace already use React, and staying within the same library family allows shared knowledge across codebases. |
| **Language** | TypeScript 5.5 | Static type checking catches type-related bugs at compile time rather than at runtime. Interfaces and type aliases (`Task`, `Project`, `AuthState`, etc.) serve as living documentation of every data shape in the system. |
| **Build Tool** | Vite 5.4 | Native ESM-based dev server provides near-instant hot module replacement (HMR). Built-in TypeScript and JSX transformation eliminates the need for a separate Babel configuration. The proxy option in `vite.config.ts` forwards API requests to `json-server` seamlessly. |
| **State Management** | Redux Toolkit 2.3 | `createSlice` removes the boilerplate of classic Redux (action type constants, action creators, switch-case reducers). `createAsyncThunk` provides a standardised pattern for handling asynchronous operations with automatic `pending`, `fulfilled`, and `rejected` action dispatching. |
| **Routing** | React Router 6 | Nested `<Route>` elements map directly onto the layout hierarchy — protected routes wrap `<AppLayout>`, which renders `<Outlet />` for child pages. This nesting eliminates layout duplication and keeps the shell (sidebar, header) mounted across navigations. |
| **Forms** | React Hook Form 7 + Zod 3 | React Hook Form uses uncontrolled inputs by default, which means the form does not trigger a re-render on every keystroke. Zod schemas define validation rules once and double as TypeScript types via `z.infer<>`, so the runtime validation and the compile-time type are always in sync. |
| **Styling** | CSS Modules | Class names are scoped to their component at build time (e.g., `.card` becomes `.Dashboard_card_a1b2c`), preventing style conflicts between features. Unlike CSS-in-JS solutions (styled-components, Emotion), CSS Modules have zero runtime cost — they are resolved entirely at build time. |
| **Mock API** | json-server 0.17 | Generates a full REST API from `db.json` with support for filtering, sorting, and nested resources. This allows the front-end to be developed and tested against realistic API behaviour without standing up a real backend. |
| **Testing** | Vitest 2 + React Testing Library 16 | Vitest shares Vite's transform pipeline, so TypeScript and JSX work out of the box without additional configuration. React Testing Library encourages testing from the user's perspective (querying by role, text, label) rather than testing implementation details. |

### Why Not Next.js?

The assignment requires a **single-page application**. Next.js is a full-stack framework whose main value lies in server-side rendering (SSR), static site generation (SSG), and file-system routing. Using Next.js for a pure SPA adds unnecessary complexity — a Node.js server runtime, hydration logic, and server/client component boundaries — without delivering any benefit for a fully client-rendered application. Vite + React Router provides complete client-side routing with no server requirement beyond static file hosting.

---

## 4. State Management

### Store Structure

The Redux store is composed of three independent slices, each owning a specific domain:

```ts
// app/store.ts
export const store = configureStore({
  reducer: {
    auth:     authReducer,     // user session & authentication
    projects: projectsReducer, // project list & selected project
    tasks:    tasksReducer,    // task list & selected task
  },
});
```

Each slice state follows a consistent shape:

```ts
interface SliceState<T> {
  items: T[];              // or singular: user, selectedProject, selectedTask
  loading: boolean;        // true while a thunk is pending
  error: string | null;    // populated on rejection
}
```

### Async Operations via `createAsyncThunk`

Every API call is wrapped in a thunk. The thunk lifecycle is handled uniformly across all slices:

```ts
// Example from projectsSlice.ts
export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  return apiClient.get<Project[]>('/projects');
});

// In extraReducers:
builder
  .addCase(fetchProjects.pending,   (s) => { s.loading = true; s.error = null; })
  .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
  .addCase(fetchProjects.rejected,  (s, a) => { s.loading = false; s.error = a.error.message ?? 'Failed'; });
```

This pattern is repeated for every CRUD operation across all three slices (`login`, `register`, `loadUser`, `fetchProjects`, `createProject`, `updateProject`, `deleteProject`, `fetchTasksByProject`, `fetchAllTasks`, `createTask`, `updateTask`, `deleteTask`, `validateTaskTitle`). The consistency makes the data-fetching behaviour predictable: every API call surfaces a `loading` flag and an `error` message that the UI can consume.

### Typed Hooks

Instead of importing the raw `useDispatch` and `useSelector` from React-Redux, the application exports pre-typed versions:

```ts
// app/hooks.ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppRootState>();
```

This ensures that every `dispatch` call and every selector return value is type-checked at compile time, which eliminates an entire category of runtime errors where action payloads or state shapes are mismatched.

---

## 5. Routing, Lazy Loading & Protected Routes

### Route Structure

The application defines all routes in a single file (`src/routes/AppRoutes.tsx`):

| Path | Component | Access |
|---|---|---|
| `/login` | `LoginForm` | Public |
| `/register` | `RegisterForm` | Public |
| `/dashboard` | `Dashboard` | Protected |
| `/projects/:projectId/board` | `Board` | Protected |
| `/projects/:projectId/tasks/new` | `TaskForm` | Protected |
| `/projects/:projectId/tasks/:taskId` | `TaskDetail` | Protected |
| `/projects/:projectId/tasks/:taskId/edit` | `TaskForm` | Protected |
| `/analytics` | `Analytics` | Protected |

Routes under `/projects/:projectId/...` are **nested** — they share the `AppLayout` wrapper (sidebar + header) and derive the `projectId` parameter from the URL, which child components access via `useParams()`.

### Lazy Loading (Code-Splitting)

Every page-level component is imported dynamically with `React.lazy()`:

```tsx
const Dashboard  = lazy(() => import('@/features/projects/components/Dashboard'));
const Board      = lazy(() => import('@/features/board/components/Board'));
const TaskForm   = lazy(() => import('@/features/tasks/components/TaskForm'));
const TaskDetail = lazy(() => import('@/features/tasks/components/TaskDetail'));
const Analytics  = lazy(() => import('@/features/analytics/components/Analytics'));
```

These dynamic imports tell Vite to produce separate JavaScript chunks for each route. The entire route tree is wrapped in `<Suspense fallback={<Loading />}>`, so when a user navigates to a route for the first time, a loading spinner is shown while the chunk downloads.

The build output confirms the code-splitting is working (see [Section 10](#10-build-output--bundle-analysis) for full details). The initial page load only downloads the core bundle (~68 KB gzipped), and feature code is fetched on demand as the user navigates.

### Protected Routes

The `PrivateRoute` component reads authentication state from the Redux store:

```tsx
export function PrivateRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

All protected routes are nested inside `<Route element={<PrivateRoute />}>`. If the user is not authenticated, they are redirected to `/login`. If they are, `<Outlet />` renders the matched child route. This approach requires no per-route configuration — adding a new protected route is just adding another `<Route>` element inside the wrapper.

---

## 6. Form Handling & Asynchronous Validation

The task creation/edit form is the most complex form in the application. It involves multiple fields (title, description, status, priority, assignee), client-side schema validation, and server-side asynchronous title uniqueness checking.

### Validation Layers

1. **Zod Schema (synchronous)** — Defines field-level constraints:
   ```ts
   const taskSchema = z.object({
     title:       z.string().min(3).max(100),
     description: z.string().min(10).max(1000),
     status:      z.enum(['todo', 'in-progress', 'review', 'done']),
     priority:    z.enum(['low', 'medium', 'high', 'critical']),
     assigneeId:  z.string().min(1, 'Assignee is required'),
   });
   ```
   This schema serves double duty: it validates user input at runtime and generates the TypeScript type (`z.infer<typeof taskSchema>`) used throughout the form, ensuring that validation rules and types cannot drift apart.

2. **`useAsyncValidation` hook (asynchronous)** — Checks title uniqueness against the API:
   ```ts
   export function useAsyncValidation(title, projectId, excludeTaskId?) {
     const debouncedTitle = useDebounce(title, 500);
     // ...
     useEffect(() => {
       abortControllerRef.current?.abort();           // cancel previous request
       const controller = new AbortController();
       abortControllerRef.current = controller;
       apiClient.get<Task[]>(`/tasks?projectId=${projectId}`)
         .then((tasks) => {
           const duplicate = tasks.find(t =>
             t.title.toLowerCase() === debouncedTitle.toLowerCase()
             && t.id !== excludeTaskId
           );
           // set error if duplicate found
         });
       return () => controller.abort();
     }, [debouncedTitle, projectId, excludeTaskId]);
   }
   ```
   The hook debounces the title value by 500ms (using `useDebounce`) so rapid typing does not flood the API. An `AbortController` cancels in-flight requests when a new value arrives, preventing race conditions where a slow response for an old value overwrites the result for a newer value.

3. **`useTaskForm` hook** — Orchestrates the above into a single interface consumed by the `TaskForm` component. It initialises React Hook Form with the Zod resolver, watches the title field to feed into `useAsyncValidation`, and exposes a unified `onSubmit` handler that dispatches either `createTask` or `updateTask` depending on whether a `taskId` is present.

This layered design means the `TaskForm` component itself contains no business logic — it only renders fields, error messages, and a submit button using data provided by `useTaskForm`.

---

## 7. Performance Optimisation

### `React.memo` on Presenter Components

All presenter components are wrapped in `React.memo`:

```tsx
export const DashboardView = memo(function DashboardView({ ... }: Props) { ... });
export const BoardView     = memo(function BoardView({ ... }: Props) { ... });
export const AnalyticsView = memo(function AnalyticsView({ ... }: Props) { ... });
export const ProjectCard   = memo(function ProjectCard({ ... }: Props) { ... });
export const ColumnCard    = memo(function ColumnCard({ ... }: Props) { ... });
export const TaskCard      = memo(function TaskCard({ ... }: Props) { ... });
```

`React.memo` performs a shallow comparison of props before re-rendering. If the parent re-renders (e.g., because unrelated Redux state changed) but the props passed to the presenter remain reference-equal, the presenter skips its render entirely. This is particularly useful for list items like `ProjectCard` and `TaskCard`, where the parent might re-render but only one item in the list has actually changed.

### `useCallback` for Stable Handler References

Callback props passed from containers to presenters are wrapped in `useCallback`:

```tsx
// Board.tsx (container)
const handleMoveTask = useCallback(
  (taskId: string, newStatus: TaskStatus) => {
    dispatch(updateTask({ id: taskId, status: newStatus }));
  },
  [dispatch],
);
```

Without `useCallback`, a new function object would be created on every render, which would cause the `memo`-wrapped child to see a new prop reference and re-render unnecessarily. With `useCallback`, the function is only recreated when its dependencies (`dispatch`) change — which in practice means it is created once.

### `useMemo` for Derived Data

Computed values that depend on Redux state are memoised with `useMemo`:

```tsx
// Board.tsx — group tasks by Kanban status
const groupedTasks = useMemo(() => {
  const groups: Record<TaskStatus, typeof tasks> = {
    todo: [], 'in-progress': [], review: [], done: [],
  };
  tasks.forEach((task) => { groups[task.status].push(task); });
  return groups;
}, [tasks]);
```

This filtering/grouping operation only re-executes when the `tasks` array reference changes (i.e., after a Redux dispatch). On every other render it returns the cached result. The same technique is applied in `Analytics.tsx` for aggregating statistics across all projects and tasks.

### Debounce for Network Requests

The `useDebounce` hook delays propagating a value change until the user has stopped typing for a specified interval (300ms for general use, 500ms for the async validation). This prevents sending an API request on every keystroke, which would otherwise generate dozens of wasted network calls during normal typing.

---

## 8. Design Patterns

### Container / Presenter (Smart / Dumb Components)

Every feature is split into two layers:

| Layer | Responsibilities | Characteristics |
|---|---|---|
| **Container** | Reads Redux state via `useAppSelector`, dispatches actions via `useAppDispatch`, manages `useEffect` for data fetching, wraps handlers in `useCallback` | Knows about the store, router, and side effects |
| **Presenter** | Receives all data and callbacks as props, renders JSX, wrapped in `React.memo` | Pure function of its props — no side effects, no store awareness |

This separation has two practical benefits:
- **Testability**: Presenters can be tested by simply passing props and asserting on the rendered output. No store mocking is required.
- **Reusability**: The same presenter could be used with different data sources. For example, `BoardView` does not know or care whether its tasks come from Redux, React Query, or a local `useState`.

### Custom Hook Extraction

Rather than placing complex logic inline in components, the project extracts it into named hooks:

| Hook | Purpose |
|---|---|
| `useDebounce<T>(value, delay)` | Delays propagating a rapidly-changing value |
| `useAsyncValidation(title, projectId, excludeTaskId?)` | Debounced async title uniqueness check with request cancellation |
| `useTaskForm(projectId, taskId?)` | Complete form lifecycle — schema, validation, submission |
| `useAppDispatch` / `useAppSelector` | Pre-typed Redux access |

Each hook encapsulates a single concern and can be composed with others. `useTaskForm` internally uses `useAsyncValidation`, which internally uses `useDebounce` — building behaviour through composition rather than inheritance.

### Error Boundary

A class-based `ErrorBoundary` component wraps the entire application. If any component in the tree throws during rendering, the boundary catches the error and displays a recovery UI with a "Try Again" button instead of crashing to a blank screen. This is implemented as a class component because React's `componentDidCatch` lifecycle is not yet available as a hook.

---

## 9. Testing Strategy & Results

### Approach

Tests focus on **business logic** — the Redux slices that manage state transitions, the custom hooks that implement reusable behaviour, and the route guard that controls access. The rationale is that these modules contain the logic most likely to break during development and hardest to verify manually.

The testing tools used:
- **Vitest** — test runner (shares Vite's transform pipeline so TS/JSX require no extra config)
- **React Testing Library** — component rendering and DOM queries
- **`@vitest/coverage-v8`** — code coverage via V8's built-in profiler

### Test Execution Output

All tests were executed with `npx vitest run --coverage`. Full output:

```
 RUN  v2.1.9 /Users/nesstq/Developer/advfront/project-management
      Coverage enabled with v8

 ✓ src/__tests__/components/PrivateRoute.test.tsx (2)
 ✓ src/__tests__/hooks/useDebounce.test.ts (4)
 ✓ src/__tests__/features/auth/authSlice.test.ts (10)
 ✓ src/__tests__/features/projects/projectsSlice.test.ts (11)
 ✓ src/__tests__/features/tasks/tasksSlice.test.ts (12)

 Test Files  5 passed (5)
      Tests  39 passed (39)
   Start at  12:11:36
   Duration  1.21s (transform 215ms, setup 441ms, collect 488ms, tests 75ms, environment 2.25s, prepare 363ms)
```

### Test Breakdown by File

| Test File | Tests | What is Covered |
|---|---|---|
| `authSlice.test.ts` | 10 | Initial state, `logout` reducer, `clearError` reducer, `login` thunk (pending → fulfilled → rejected), `register` thunk (pending → fulfilled → rejected), `loadUser` thunk (pending → fulfilled → rejected) |
| `projectsSlice.test.ts` | 11 | Initial state, `clearSelectedProject`, `fetchProjects` lifecycle, `fetchProjectById` lifecycle, `createProject` lifecycle, `updateProject` lifecycle, `deleteProject` lifecycle |
| `tasksSlice.test.ts` | 12 | Initial state, `clearSelectedTask`, `fetchTasksByProject` lifecycle, `fetchAllTasks` lifecycle, `fetchTaskById` lifecycle, `createTask` lifecycle, `updateTask` lifecycle, `deleteTask` lifecycle, `validateTaskTitle` lifecycle |
| `useDebounce.test.ts` | 4 | Returns initial value immediately, updates after specified delay, handles rapid successive changes (only last value propagates), works with non-string types |
| `PrivateRoute.test.tsx` | 2 | Redirects unauthenticated users to `/login`, renders child routes when user is authenticated |

### Coverage Report

```
File                                | % Stmts | % Branch | % Funcs | % Lines
------------------------------------|---------|----------|---------|--------
All files                           |   35.21 |    84.13 |   36.95 |   35.21
                                    |         |          |         |
src/app/hooks.ts                    |     100 |      100 |     100 |     100
src/hooks/useDebounce.ts            |     100 |      100 |     100 |     100
src/components/PrivateRoute.tsx     |     100 |      100 |     100 |     100
src/features/auth/authSlice.ts      |   55.71 |      100 |     100 |   55.71
src/features/projects/projectsSlice |   61.90 |      100 |     100 |   61.90
src/features/tasks/tasksSlice.ts    |   52.07 |      100 |     100 |   52.07
src/api/apiClient.ts                |   22.85 |      100 |       0 |   22.85
src/components/ErrorBoundary.tsx    |       0 |        0 |       0 |       0
src/components/Loading.tsx          |       0 |        0 |       0 |       0
src/components/Layout/*             |       0 |        0 |       0 |       0
src/features/*/components/*         |       0 |        0 |       0 |       0
src/features/tasks/hooks/*          |       0 |        0 |       0 |       0
src/routes/AppRoutes.tsx            |       0 |        0 |       0 |       0
```

**Overall statement coverage: 35.21%** — exceeding the 20% minimum requirement.

**Branch coverage: 84.13%** — the slice tests cover all three branches of every `createAsyncThunk` (pending, fulfilled, rejected), giving thorough branch coverage of the state management layer.

The tested files — Redux slices, typed hooks, `useDebounce`, and `PrivateRoute` — represent the core business logic of the application. The untested files are primarily presenter components (pure rendering from props) and layout components, which contain minimal logic.

---

## 10. Build Output & Bundle Analysis

The production build (`npm run build`) runs TypeScript type-checking followed by Vite's bundling:

```
> tsc -b && vite build

vite v5.4.21 building for production...
✓ 98 modules transformed.

dist/index.html                              0.75 kB │ gzip:  0.42 kB
dist/assets/index-C1ubi0ES.js              205.95 kB │ gzip: 67.74 kB
dist/assets/TaskForm-QyBIEOcD.js            83.91 kB │ gzip: 23.33 kB
dist/assets/Dashboard-CoJpwGOX.js            4.11 kB │ gzip:  1.61 kB
dist/assets/Board-BhBQM6Aq.js               4.08 kB │ gzip:  1.67 kB
dist/assets/Analytics-DVkdOnIm.js            4.27 kB │ gzip:  1.39 kB
dist/assets/TaskDetail-E56b3MnI.js           2.39 kB │ gzip:  1.07 kB
dist/assets/RegisterForm-fc1tL9dB.js         2.14 kB │ gzip:  0.87 kB
dist/assets/LoginForm-CQPEG1h_.js            1.53 kB │ gzip:  0.73 kB
dist/assets/AuthLayout.module-dOfUna9k.js    0.34 kB │ gzip:  0.22 kB

✓ built in 683ms
```

The `index` chunk (205.95 kB / 67.74 kB gzipped) contains React, Redux Toolkit, React Router, and shared application code. Each route produces its own chunk, confirming that `React.lazy()` code-splitting is functioning correctly. The `TaskForm` chunk is the largest feature chunk (83.91 kB) because it bundles React Hook Form and Zod — libraries that are only downloaded when the user navigates to the task creation or edit page.

Total build time: ~683ms. Zero TypeScript errors.

---

## 11. CI / CD & Deployment Plan

### Proposed GitHub Actions Pipeline

```yaml
name: CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build          # tsc type-check + Vite production build
      - run: npm run test:coverage   # Vitest with v8 coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

This pipeline would run on every push and pull request. It installs dependencies with `npm ci` (deterministic from `package-lock.json`), runs the full TypeScript compilation and Vite build to catch type errors and bundling issues, then runs the test suite with coverage. The coverage report is uploaded as a build artifact for review.

### Deployment

TaskFlow is a pure SPA — the build output is a static `index.html` plus JavaScript and CSS assets in `dist/`. It can be deployed to any static hosting service:

| Platform | Notes |
|---|---|
| **Vercel / Netlify** | Zero-config deployment for Vite projects. Automatic preview deployments on pull requests. |
| **GitHub Pages** | Free hosting. Requires setting `base` in `vite.config.ts` to match the repository path. |
| **Azure Static Web Apps** | Integrates with GitHub Actions. Supports custom domains and staging environments. |

In a production deployment, `json-server` would be replaced by a real backend API. The front-end code would require no changes — it already uses relative `/api` paths, and the production hosting environment would be configured to route those requests to the actual API server.