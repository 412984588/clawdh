import { useState, useEffect, useCallback } from "react";

type Serializable = string | number | boolean | object | null;

/**
 * SSR-safe localStorage hook with JSON serialization.
 * Falls back gracefully when localStorage is unavailable.
 *
 * @param key           localStorage key
 * @param initialValue  Default value when key doesn't exist
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')
 * setTheme('dark')
 * removeTheme()  // clears the key
 */
export function useLocalStorage<T extends Serializable>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Read from localStorage on first render (SSR-safe)
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Sync with localStorage on key change (e.g., different user)
  useEffect(() => {
    setStoredValue(readValue());
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(event.newValue !== null ? (JSON.parse(event.newValue) as T) : initialValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch {
        // localStorage may be full or blocked (private browsing)
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
