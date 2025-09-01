# Frontend Reference

This document provides a reference for the frontend components, hooks, and utilities used in the Trampolin web application.

## Auth Components

Components located in `src/components/auth/` are responsible for handling user authentication, session management, and access control.

### AuthGuard

A higher-order component that protects routes or components based on authentication status and user roles.

- **Props**:
  - `children`: `ReactNode` - The content to render if the user is authorized.
  - `fallback`: `ReactNode` (optional) - A fallback component to render if the user is not authorized.
  - `requireAuth`: `boolean` (default: `true`) - Whether authentication is required.
  - `requiredRole`: `string` (optional) - The specific role required to access the content.
- **Usage**:

  ```tsx
  <AuthGuard requiredRole="admin">
    <AdminDashboard />
  </AuthGuard>
  ```

### AuthStatus

Displays the current user's authentication status. It shows a welcome message and a `UserMenu` for authenticated users, or "Sign In" and "Register" links for guests.

- **Usage**: Typically placed in the application header.

### LoadingSpinner

A simple, reusable loading spinner component.

- **Props**:
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`) - The size of the spinner.
  - `text`: `string` (optional) - Text to display below the spinner.
- **Usage**:

  ```tsx
  <LoadingSpinner size="lg" text="Loading data..." />
  ```

### LoginForm

A form for users to sign in with their email and password. It handles form state, submission, and displays errors returned from the `signIn` function.

- **Functionality**: Calls `signIn('credentials', ...)` from NextAuth.js and redirects the user upon successful authentication.

### PasswordResetForm

A form for users to request a password reset link.

- **Note**: The email sending functionality is not yet implemented (`TODO` in the code).

### ProtectedRoute

A client-side component that protects page-level routes. It checks for a valid session and, optionally, a specific user role. If the conditions are not met, it redirects the user.

- **Props**:
  - `children`: `ReactNode` - The page content to render if authorized.
  - `requireAuth`: `boolean` (default: `true`) - Whether authentication is required.
  - `requiredRole`: `string` (optional) - The specific role required.
  - `redirectTo`: `string` (default: `/auth/login`) - The path to redirect to if unauthorized.
- **Usage**: Wrap a page component in `layout.tsx` or `page.tsx`.

  ```tsx
  <ProtectedRoute requiredRole="editor">
    <EditorPage />
  </ProtectedRoute>
  ```

### RegisterForm

A form for new users to register. It captures the user's email and password and calls the `/api/auth/register` endpoint.

- **Functionality**: Handles form state, validation, submission, and displays registration errors.

### UserMenu

A dropdown menu for authenticated users, typically part of the `AuthStatus` component. It displays the user's name/email, role, and provides navigation links.

- **Links**:
  - Dashboard
  - Subscription
  - Sign out

## Chart Components

Located in `src/components/charts/`, these are reusable components for data visualization, built on top of `react-chartjs-2`. They are designed to be responsive and customizable.

All chart components pull their base configuration from the `ChartConfigContext` to ensure a consistent look and feel, but these can be overridden via the `options` prop.

### Common Props

- `data`: `ChartData` - The data object required by Chart.js.
- `options`: `ChartOptions` (optional) - Chart.js options to customize the chart's appearance and behavior.
- `className`: `string` (optional) - Custom CSS classes for the container element.

### BarChart

A component for displaying data using vertical bars. Ideal for comparing values across different categories.

### LineChart

A component for displaying data trends over a continuous interval or time span.

### DoughnutChart

A variant of the pie chart with a hole in the center, useful for displaying proportional data.

### PieChart

A circular statistical graphic, divided into slices to illustrate numerical proportion.

### ChartConfigPanel

A popover panel that allows users to dynamically customize the appearance of all charts on a page. It provides controls for theme, animations, legends, and other styling options.

- **Functionality**: Interacts with the `useChartConfig` hook to update the global chart configuration.

### ChartConfigContext

Located at `src/contexts/ChartConfigContext.tsx`, this context provider manages the global state for all chart components. It ensures a consistent and customizable user experience across all data visualizations.

- **Provided State**: `theme`, `animation`, `showLegend`, `showGrid`, etc.
- **Provided Functions**: `updateConfig`, `getChartOptions`.

---
