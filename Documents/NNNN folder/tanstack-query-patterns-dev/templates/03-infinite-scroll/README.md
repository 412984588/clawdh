# Infinite Scroll

Cursor-based infinite loading with IntersectionObserver auto-trigger.

## Key Concepts
- `useInfiniteQuery`: manages multiple pages of data
- `initialPageParam`: starting cursor (null = first page)
- `getNextPageParam`: extracts cursor from last page for next request
- IntersectionObserver: triggers `fetchNextPage()` when sentinel div enters viewport

## Notes
- Always set `hasNextPage` check before observing to prevent fetching past the last page
- `data.pages.flatMap(p => p.items)` flattens all pages into a single array
