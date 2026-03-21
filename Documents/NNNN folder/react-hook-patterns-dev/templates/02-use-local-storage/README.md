# useLocalStorage

SSR-safe localStorage hook with JSON serialization and cross-tab sync.

## API

```ts
const [value, setValue, removeValue] = useLocalStorage(key, initialValue)
```

## Features

- SSR-safe (`typeof window === 'undefined'` guard)
- JSON serialize/deserialize automatically
- Cross-tab sync via `storage` event listener
- Functional updater pattern: `setValue(prev => ({ ...prev, key: val }))`
- `removeValue()` to clear the key
