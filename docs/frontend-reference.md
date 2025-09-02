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

## Dashboard Components

Located in `src/components/dashboard/`, these components form the structural layout of the application's user dashboard.

### DashboardLayout

A wrapper component that establishes the main layout for all dashboard pages. It integrates the `Sidebar` and `Header` and provides a consistent structure for page content.

- **Props**:
  - `children`: `ReactNode` - The main content of the page.
  - `title`: `string` - The title displayed at the top of the page.
  - `description`: `string` (optional) - A subtitle or description displayed below the title.
  - `headerActions`: `ReactNode` (optional) - Buttons or other elements to display in the page header.

### Header

The top navigation bar within the dashboard. It includes a search input, theme toggle, notifications icon, and a user profile menu.

- **Functionality**: Manages the open/close state of the mobile sidebar.

### Sidebar

The main navigation menu for the dashboard, displayed on the left side. It contains links to different sections of the application.

- **Functionality**: Highlights the active navigation link based on the current route. It is responsive and can be toggled on smaller screens.

## Form Components

Located in `src/components/forms/`, these components handle user input and data submission.

### CsvUpload

A component for uploading CSV files with a rich user interface.

- **Location**: `src/components/forms/file-upload/csv-upload.tsx`
- **Functionality**:
  - Drag-and-drop file selection.
  - File size and type validation.
  - Real-time upload progress display.
  - Displays success or error messages after upload.
- **Props**:
  - `onUploadComplete`: `(result: UploadResult) => void` (optional) - Callback function executed after an upload attempt.
  - `onUploadStart`: `() => void` (optional) - Callback function executed when an upload begins.
  - `maxSize`: `number` (optional) - Maximum file size in bytes. Defaults to 10MB.

## Subscription Components

Located in `src/components/subscription/`, these components handle the presentation and management of user subscriptions.

### SubscriptionCard

Displays a summary of the user's current subscription, including status, plan, and billing period. It provides actions to cancel or manage the subscription.

- **Props**:
  - `subscription`: `object` - The user's subscription data.
  - `onCancel`: `() => void` (optional) - Callback for when the cancel action is triggered.
  - `onUpdate`: `() => void` (optional) - Callback for when the manage/update action is triggered.

### SubscriptionPlans

Displays a list of available subscription plans. It allows users to subscribe to a new plan or switch between existing plans.

- **Props**:
  - `plans`: `PricingPlan[]` - An array of available pricing plans.
  - `currentPriceId`: `string` (optional) - The ID of the user's current plan, used to highlight it in the list.
  - `onSubscribe`: `(priceId: string) => void` (optional) - Callback executed when a user subscribes to or updates a plan.

### SubscriptionStatus

Fetches and displays the detailed status of a user's subscription from the backend. It shows loading and error states and provides an option to refresh the data.

- **Props**:
  - `onSubscriptionChange`: `(subscription: Subscription | null) => void` (optional) - Callback executed when the subscription data is fetched or changed.

## Custom Hooks

Located in `src/hooks/`, these hooks provide reusable logic for data fetching and state management.

### useAnalyticsData

Fetches and manages the state for the main analytics dashboard data from the `/api/analytics` endpoint.

- **Returns**:
  - `data`: `AnalyticsData | null` - The fetched analytics data, formatted for charts.
  - `loading`: `boolean` - The current loading state.
  - `error`: `Error | null` - Any error that occurred during fetching.
  - `refetch`: `() => void` - A function to manually re-fetch the data.

### useChartData

A generic hook for fetching, processing, and managing data for various chart types. It includes features like auto-refresh, retry logic, and stale data detection.

- **Props**:
  - `data` or `dataFetcher`: Static data array or a function that returns a promise of data.
  - `xField`, `yField`: Keys for accessing the x and y values from the data objects.
  - `type`: The type of chart (`line`, `bar`, `pie`, `doughnut`).
  - `refreshInterval`: Interval in seconds for auto-refreshing data.
- **Returns**:
  - `chartData`: `ChartData` - The data formatted for `react-chartjs-2`.
  - `isLoading`, `error`, `lastUpdated`, `isStale`.
  - `refreshData`: `() => Promise<void>` - A function to manually refresh the data.

---
