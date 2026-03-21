# Auth Store

User authentication state with login, logout, token refresh, and role-based selectors.

## State
- `user` — current user object (null if not authenticated)
- `token` — JWT/session token
- `isAuthenticated` — derived from user presence
- `isLoading` — true during login/refresh requests
- `error` — last error message

## Usage

```tsx
const { user, login, logout } = useAuthStore();
const isAdmin = useAuthStore(selectIsAdmin); // only re-renders if admin status changes
```

## Features
- `devtools` middleware for Redux DevTools inspection
- Named actions for clear DevTools history
- Selector helpers to prevent unnecessary re-renders
- Token refresh with auto-logout on failure
