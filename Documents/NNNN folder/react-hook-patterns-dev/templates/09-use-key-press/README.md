# useKeyPress / useHotkey

Keyboard shortcut detection with modifier support and multi-hotkey map.

## API

```ts
const isHeld = useKeyPress(key)
useHotkey(key, { ctrl?, meta?, shift?, alt? }, callback, options?)
useHotkeyMap({ 'ctrl+k': openSearch, 'Escape': close }, options?)
```

## Features

- `useKeyPress` — hold-state detection (Shift, Ctrl, Alt)
- `useHotkey` — single combo with `preventDefault` option
- `useHotkeyMap` — register multiple shortcuts at once with string syntax (`"ctrl+k"`, `"cmd+s"`)
