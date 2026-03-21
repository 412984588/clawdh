# useEventListener

Typed event listener with automatic cleanup and stale-closure prevention via handler ref.

## API

```ts
useEventListener(eventName, handler, elementRef?, options?)
useKeyboardShortcut({ key, ctrl?, meta?, shift?, alt? }, handler, options?)
```

## Features

- Works on `window` (no ref) or any `HTMLElement` ref
- Handler ref prevents stale closures without re-registering
- `useKeyboardShortcut` for Cmd+K, Ctrl+S, Escape, etc.
- `preventDefault` option for keyboard shortcuts
