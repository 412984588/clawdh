# Settings Store

Persisted user settings with immer for nested updates.

## Features
- `persist` middleware: settings survive page refresh
- `immer` middleware: mutate nested objects naturally
- Typed granular update methods
- Server sync with save state tracking

## Usage

```tsx
const { settings, updateTheme } = useSettingsStore();
updateTheme("dark"); // persisted to localStorage automatically
await saveToServer(); // sync to your API
```

## Note on immer middleware
The `immer` middleware from `zustand/middleware/immer` lets you write `s.settings.theme = theme` instead of spreading nested objects. Install: `npm install immer`.
