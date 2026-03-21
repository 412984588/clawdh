# Slices Pattern

Combine multiple domain stores into one Zustand store using slices.

## Why Slices?
- Single `useAppStore` import for cross-cutting concerns (auth + settings + workspace)
- Each slice is independently defined and testable
- Persist only the slices you want (use `partialize`)
- All slices share the same `set`/`get` so they can read each other's state

## Structure

```
AppStore = AuthSlice + SettingsSlice + WorkspaceSlice
```

## Usage

```tsx
// Access one slice
const theme = useAppStore((s) => s.theme);
const setTheme = useAppStore((s) => s.setTheme);

// Access full slice (use with caution — re-renders on any slice change)
const authSlice = useAppStore(selectAuth);
```

## When NOT to Use Slices
If two domains are truly independent (cart and notifications), keep them as separate stores. Slices shine when domains need to read each other's state.
