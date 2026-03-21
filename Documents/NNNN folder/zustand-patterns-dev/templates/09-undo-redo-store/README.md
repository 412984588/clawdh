# Undo/Redo Store

History tracking with undo/redo using a temporal middleware pattern.

## Features
- `undo()` and `redo()` actions
- `canUndo`/`canRedo` boolean flags for button disabled state
- Works with any Zustand store shape via `createTemporalStore` factory
- No external dependencies — pure Zustand

## Usage

```tsx
const { shapes, addShape, undo, redo, canUndo, canRedo } = useCanvasStore();

<button onClick={undo} disabled={!canUndo}>Undo</button>
<button onClick={redo} disabled={!canRedo}>Redo</button>

// Keyboard shortcuts
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "z") undo();
    if (e.metaKey && e.shiftKey && e.key === "z") redo();
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);
```

## Production Alternative
For robust undo/redo, consider `zustand-temporal` (npm package) which handles edge cases like async actions and large state trees.
