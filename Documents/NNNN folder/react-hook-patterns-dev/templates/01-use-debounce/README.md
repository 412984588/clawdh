# useDebounce

Debounce a rapidly-changing value (search input, resize events) before acting on it.

## API

```ts
const debouncedValue = useDebounce(value, delay?)
const debouncedFn = useDebouncedCallback(fn, delay?)
```

## Common use cases

- Search input → debounced API call
- Window resize handler
- Autosave on keypress
