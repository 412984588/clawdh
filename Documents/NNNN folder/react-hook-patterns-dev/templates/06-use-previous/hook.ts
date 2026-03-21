import { useRef, useEffect, useState } from "react";

/**
 * Returns the value from the previous render.
 * On the first render, returns undefined.
 *
 * @example — Detect direction of value change
 * const prevCount = usePrevious(count)
 * const direction = count > (prevCount ?? 0) ? 'up' : 'down'
 *
 * @example — Animate on change
 * const prevId = usePrevious(activeId)
 * if (prevId !== activeId) triggerTransition()
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Returns both current and previous value.
 * Useful when you need both in one call.
 *
 * @example
 * const [current, previous] = usePreviousPair(selectedTab)
 */
export function usePreviousPair<T>(value: T): [T, T | undefined] {
  const previous = usePrevious(value);
  return [value, previous];
}

/**
 * Tracks the full history of a value (last N renders).
 *
 * @example
 * const history = useValueHistory(inputValue, 5)
 * // history[0] is current, history[history.length-1] is oldest
 */
export function useValueHistory<T>(value: T, maxLength = 10): T[] {
  const [history, setHistory] = useState<T[]>([value]);

  useEffect(() => {
    setHistory((prev) => {
      const next = [value, ...prev];
      return next.length > maxLength ? next.slice(0, maxLength) : next;
    });
  }, [value, maxLength]);

  return history;
}

/**
 * Returns true only on the render immediately after value changes.
 * Resets to false on the next render.
 *
 * @example — Trigger a one-shot animation
 * const justChanged = useJustChanged(status)
 * <div className={justChanged ? 'flash' : ''} />
 */
export function useJustChanged<T>(value: T): boolean {
  const prev = usePrevious(value);
  const [justChanged, setJustChanged] = useState(false);

  useEffect(() => {
    if (prev !== undefined && prev !== value) {
      setJustChanged(true);
      const id = setTimeout(() => setJustChanged(false), 0);
      return () => clearTimeout(id);
    }
  }, [value, prev]);

  return justChanged;
}
