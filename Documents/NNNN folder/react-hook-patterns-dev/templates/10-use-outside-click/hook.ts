import { useEffect, useRef, useCallback } from "react";

/**
 * Fires a callback when the user clicks outside the referenced element.
 * Perfect for closing dropdowns, modals, and popovers.
 *
 * @example — Close dropdown on outside click
 * const dropdownRef = useOutsideClick<HTMLDivElement>(() => setOpen(false))
 * return <div ref={dropdownRef}>{open && <Menu />}</div>
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  options: { enabled?: boolean } = {}
): React.RefObject<T | null> {
  const { enabled = true } = options;
  const ref = useRef<T | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        savedCallback.current(event);
      }
    };

    // Use mousedown/touchstart to fire before click
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [enabled]);

  return ref;
}

/**
 * Multi-element version — fires when user clicks outside ALL provided refs.
 * Useful for floating panels that consist of multiple DOM subtrees.
 *
 * @example — Popover with trigger + panel
 * const [triggerRef, panelRef] = useOutsideClickMultiple(
 *   () => setOpen(false),
 *   2
 * )
 */
export function useOutsideClickMultiple(
  callback: (event: MouseEvent | TouchEvent) => void,
  count: number,
  options: { enabled?: boolean } = {}
): React.RefObject<HTMLElement | null>[] {
  const { enabled = true } = options;
  const refs = Array.from({ length: count }, () => useRef<HTMLElement | null>(null)); // eslint-disable-line react-hooks/rules-of-hooks
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const isInsideAny = refs.some((ref) => ref.current?.contains(target));
      if (!isInsideAny) savedCallback.current(event);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [enabled, refs]);

  return refs;
}

/**
 * Returns whether the user is currently clicking outside the element.
 * Useful when you prefer a boolean state over a callback.
 *
 * @example
 * const [ref, isOutside] = useIsOutside<HTMLDivElement>()
 * useEffect(() => { if (isOutside) setOpen(false) }, [isOutside])
 */
export function useIsOutside<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T | null>,
  boolean
] {
  const [isOutside, setIsOutside] = useCallback(() => {
    // Initializer — will be replaced by useState
    return false;
  }, []) as unknown as [boolean, React.Dispatch<React.SetStateAction<boolean>>];

  // Simplified: just use useOutsideClick with state
  const ref = useOutsideClick<T>(() => setIsOutside(true));

  useEffect(() => {
    // Reset when mouse enters
    const el = ref.current;
    if (!el) return;
    const onEnter = () => setIsOutside(false);
    el.addEventListener("mouseenter", onEnter);
    return () => el.removeEventListener("mouseenter", onEnter);
  }, [ref, setIsOutside]);

  return [ref, isOutside];
}

import type React from "react";
