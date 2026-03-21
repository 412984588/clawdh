# Infinite List Store

Reusable store factory for paginated/infinite lists with filters and local mutations.

## Features
- Factory pattern: create stores for any list type
- Cursor-based infinite loading
- Filter changes trigger automatic refetch
- Optimistic local delete/update
- Separate loading states for initial load vs load more

## Usage

```tsx
// Create a store for your entity
const useUserListStore = createInfiniteListStore<User>(fetchUsersFn, "UserListStore");

// In your component
const { items, fetchInitial, fetchMore, hasMore, setFilter } = useUserListStore();

// Filter by search
setFilter("search", "alice"); // auto-refetches
```
