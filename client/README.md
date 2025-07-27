# React Authentication Context and Route Guards

This project includes a complete authentication system with React Context and route protection components.

## Components

### AuthContext (`src/contexts/AuthContext.jsx`)

The `AuthContext` provides authentication state management:

- **AuthContext**: React context for authentication state
- **useAuth()**: Custom hook to access authentication context
- **AuthProvider**: Provider component that manages authentication state

#### Features:
- Reads initial JWT from localStorage ('token')
- Fetches user data from `/users/me` endpoint on mount
- Handles token expiration (401/403 errors)
- Provides login/logout functions with navigation

#### Usage:
```jsx
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrap your app
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
const { user, token, login, logout } = useAuth();
```

### ProtectedRoute (`src/components/ProtectedRoute.jsx`)

Route guard component for protecting routes based on authentication and roles:

- **ProtectedRoute**: Main route guard component
- **withAuth**: HOC for authentication protection
- **withRole**: HOC for role-based protection

#### Features:
- Authentication-based route protection
- Role-based access control
- Automatic redirects for unauthorized access
- Support for both component and outlet rendering

#### Usage:
```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Basic authentication protection
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-based protection
<Route path="/admin" element={
  <ProtectedRoute requiredRole="Admin">
    <AdminPanel />
  </ProtectedRoute>
} />

// Using with React Router v6 Outlet
<Route element={<ProtectedRoute requiredRole="Admin" />}>
  <Route path="/admin" element={<AdminPanel />} />
  <Route path="/admin/users" element={<UserManagement />} />
</Route>
```

## Environment Variables

Set the following environment variable in your `.env` file:

```
REACT_APP_API_URL=http://localhost:3001
```

## API Endpoints

The authentication system expects these API endpoints:

- `POST /api/auth/login` - Login endpoint (returns token)
- `GET /users/me` - Get current user info (requires Bearer token)

## Example Implementation

See `src/App.jsx` for a complete example of how to use these components together.

## Features

- ✅ JWT token management
- ✅ Automatic user data fetching
- ✅ Token expiration handling
- ✅ Role-based access control
- ✅ React Router v6 integration
- ✅ TypeScript-ready (can be easily converted)
- ✅ Error handling for failed requests 