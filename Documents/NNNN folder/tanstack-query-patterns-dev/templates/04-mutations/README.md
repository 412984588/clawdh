# Mutations

Create, update, delete mutations with cache invalidation.

## Key Concepts
- `useMutation`: wraps write operations
- `onSuccess`: invalidate related queries to trigger refetch
- `isPending`: shows loading state during mutation
- Per-call callbacks: `mutate(data, { onSuccess, onError })` for component-level side effects

## Pattern: Invalidate vs Update
- **Invalidate** (`queryClient.invalidateQueries`): simple, always correct, triggers a refetch
- **Direct update** (`queryClient.setQueryData`): instant UI update, no refetch — see `10-optimistic-updates`
