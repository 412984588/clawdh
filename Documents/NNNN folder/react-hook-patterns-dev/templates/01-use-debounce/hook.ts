import { useState, useEffect } from "react";

/**
 * Debounces a value — only updates after the delay has elapsed
 * without the value changing again.
 *
 * @param value  The value to debounce
 * @param delay  Delay in milliseconds (default: 300)
 * @returns      The debounced value
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 *
 * useEffect(() => {
 *   // Only fires 500ms after the user stops typing
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if value changes before delay elapses
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback — creates a debounced version of a function.
 * The callback is only called after the delay has elapsed without
 * a new invocation.
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value: string) => {
 *   api.save(value)
 * }, 1000)
 */
export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay = 300
): (...args: T) => void {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  return (...args: T) => {
    if (timer) clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        callback(...args);
        setTimer(null);
      }, delay)
    );
  };
}
