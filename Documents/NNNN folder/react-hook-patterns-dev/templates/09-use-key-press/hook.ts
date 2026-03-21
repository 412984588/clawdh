import { useState, useEffect, useCallback } from "react";

/**
 * Returns true while the specified key is held down.
 *
 * @example
 * const isShiftHeld = useKeyPress('Shift')
 * const isEscapePressed = useKeyPress('Escape')
 */
export function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [targetKey]);

  return isPressed;
}

/**
 * Fires a callback when a key combination is pressed.
 * Supports Ctrl, Meta (Cmd), Shift, Alt modifiers.
 *
 * @example
 * useHotkey('k', { meta: true }, openCommandPalette)   // Cmd+K
 * useHotkey('s', { ctrl: true }, saveDocument)          // Ctrl+S
 * useHotkey('Escape', {}, closeModal)
 */
export function useHotkey(
  key: string,
  modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean },
  callback: (event: KeyboardEvent) => void,
  options: { preventDefault?: boolean; element?: EventTarget } = {}
): void {
  const { preventDefault = true, element = window } = options;

  // Keep callback stable across renders
  const savedCallback = useCallback(callback, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const keyMatch = event.key === key || event.code === key;
      if (!keyMatch) return;
      if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) return;
      if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) return;
      if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) return;
      if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) return;

      if (preventDefault) event.preventDefault();
      savedCallback(event);
    };

    element.addEventListener("keydown", handler as EventListener);
    return () => element.removeEventListener("keydown", handler as EventListener);
  }, [key, modifiers.ctrl, modifiers.meta, modifiers.shift, modifiers.alt, preventDefault, element, savedCallback]);
}

/**
 * Register multiple hotkeys at once.
 *
 * @example
 * useHotkeyMap({
 *   'ctrl+k': openSearch,
 *   'ctrl+s': save,
 *   'Escape': closeAll,
 * })
 */
export function useHotkeyMap(
  map: Record<string, (event: KeyboardEvent) => void>,
  options: { preventDefault?: boolean } = {}
): void {
  const { preventDefault = true } = options;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      for (const [combo, callback] of Object.entries(map)) {
        const parts = combo.toLowerCase().split("+");
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes("ctrl");
        const needsMeta = parts.includes("meta") || parts.includes("cmd");
        const needsShift = parts.includes("shift");
        const needsAlt = parts.includes("alt");

        const keyMatch = event.key.toLowerCase() === key || event.code.toLowerCase() === key;
        if (!keyMatch) continue;
        if (needsCtrl && !event.ctrlKey) continue;
        if (needsMeta && !event.metaKey) continue;
        if (needsShift && !event.shiftKey) continue;
        if (needsAlt && !event.altKey) continue;

        if (preventDefault) event.preventDefault();
        callback(event);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map, preventDefault]);
}
