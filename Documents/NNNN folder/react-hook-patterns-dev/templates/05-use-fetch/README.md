# useFetch + useMutation

Simple data fetching and mutation hooks with loading/error/data states and abort on unmount.

## API

```ts
const { data, isLoading, error, isSuccess, refetch } = useFetch<T>(url, options?)
const { mutate, isLoading, data, error, reset } = useMutation<T>(url, method?)
```

## Features

- Abort controller — cancels in-flight requests on unmount/URL change
- `skip` option — conditional fetching
- `refetchInterval` — polling support
- `useMutation` — POST/PUT/PATCH/DELETE with JSON body

## Note

For production apps with caching needs, consider TanStack Query (see `tanstack-query-patterns`).
