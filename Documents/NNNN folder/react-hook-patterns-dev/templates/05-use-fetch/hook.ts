import { useState, useEffect, useCallback, useRef } from "react";

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseFetchOptions extends RequestInit {
  /** Skip the fetch entirely */
  skip?: boolean;
  /** Refetch interval in ms. 0 disables polling. */
  refetchInterval?: number;
}

/**
 * Simple data fetching hook with loading/error/data states.
 * For complex cases (caching, retries, SSR), use TanStack Query instead.
 *
 * @example
 * const { data, isLoading, error } = useFetch<User[]>('/api/users')
 *
 * @example — Conditional fetch
 * const { data } = useFetch<Post>(`/api/posts/${id}`, {}, { skip: !id })
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => void } {
  const { skip = false, refetchInterval = 0, ...fetchOptions } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: !skip,
    isSuccess: false,
    isError: false,
  });

  // Use a counter to trigger manual refetches
  const [refetchCount, setRefetchCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(async () => {
    if (skip) return;

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;

      if (!controller.signal.aborted) {
        setState({ data, error: null, isLoading: false, isSuccess: true, isError: false });
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, isLoading: false, isSuccess: false, isError: true });
      }
    }
  }, [url, skip, refetchCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    doFetch();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [doFetch]);

  // Polling
  useEffect(() => {
    if (!refetchInterval || skip) return;
    const id = setInterval(doFetch, refetchInterval);
    return () => clearInterval(id);
  }, [doFetch, refetchInterval, skip]);

  const refetch = useCallback(() => {
    setRefetchCount((c) => c + 1);
  }, []);

  return { ...state, refetch };
}

/**
 * Mutation hook for POST/PUT/DELETE operations.
 *
 * @example
 * const { mutate, isLoading, data, error } = useMutation<User>('/api/users')
 * await mutate({ name: 'Alice' })
 */
export function useMutation<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
): {
  mutate: (body?: unknown) => Promise<T | null>;
  isLoading: boolean;
  data: T | null;
  error: Error | null;
  reset: () => void;
} {
  const [state, setState] = useState<{ isLoading: boolean; data: T | null; error: Error | null }>({
    isLoading: false,
    data: null,
    error: null,
  });

  const mutate = useCallback(
    async (body?: unknown): Promise<T | null> => {
      setState({ isLoading: true, data: null, error: null });
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as T;
        setState({ isLoading: false, data, error: null });
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ isLoading: false, data: null, error });
        return null;
      }
    },
    [url, method]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, data: null, error: null });
  }, []);

  return { ...state, mutate, reset };
}
