# Pagination

Offset-based pagination with `keepPreviousData` for smooth page transitions.

## Key Concepts
- `keepPreviousData` (v5: imported separately): shows old data while new page loads — no flash
- Disable "Next" while `isPlaceholderData` to prevent double-clicks
- Include page + pageSize in query key for proper cache separation

## Cursor-Based Pagination
For cursor pagination, replace `page` with `cursor` in the query key and fetcher.
See `03-infinite-scroll` for cursor-based infinite loading.
