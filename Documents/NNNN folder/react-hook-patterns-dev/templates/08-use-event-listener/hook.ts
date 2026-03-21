import { useEffect, useRef } from "react";

// Structural ref type — compatible with React.RefObject across all React versions
type ElementRef = { readonly current: HTMLElement | null };

/**
 * Attach an event listener with automatic cleanup.
 * The handler is always up to date (uses a ref) without needing
 * to re-register the listener on every render.
 *
 * @example — Global keyboard listener
 * useEventListener('keydown', (e) => {
 *   if (e.key === 'Escape') closeModal()
 * })
 *
 * @example — Element-specific listener
 * const buttonRef = useRef<HTMLButtonElement>(null)
 * useEventListener('click', handleClick, buttonRef)
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: null | undefined,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: ElementRef,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: ElementRef | null,
  options?: boolean | AddEventListenerOptions
): void {
  // Store handler in ref so the effect doesn't need to re-run when it changes
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target: EventTarget | null =
      element != null ? element.current : window;

    if (!target) return;

    const listener = (event: Event) => savedHandler.current(event);
    target.addEventListener(eventName, listener, options);

    return () => {
      target.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Listen for a specific keyboard key with modifier support.
 *
 * @example
 * useKeyboardShortcut({ key: 'k', meta: true }, openSearch)
 * useKeyboardShortcut({ key: 'Escape' }, closeModal)
 */
export function useKeyboardShortcut(
  combo: { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean },
  handler: () => void,
  options?: { element?: ElementRef; preventDefault?: boolean }
): void {
  const keyboardHandler = (event: KeyboardEvent) => {
    const keyMatch = event.key === combo.key;
    const ctrlMatch = combo.ctrl ? event.ctrlKey : true;
    const metaMatch = combo.meta ? event.metaKey : true;
    const shiftMatch = combo.shift ? event.shiftKey : true;
    const altMatch = combo.alt ? event.altKey : true;

    if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
      if (options?.preventDefault) event.preventDefault();
      handler();
    }
  };

  if (options?.element) {
    useEventListener("keydown", keyboardHandler, options.element);
  } else {
    useEventListener("keydown", keyboardHandler);
  }
}
