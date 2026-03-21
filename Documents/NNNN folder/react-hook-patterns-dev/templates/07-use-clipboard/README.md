# useClipboard

Copy text to clipboard with status feedback and automatic reset. Falls back to `execCommand` for non-HTTPS.

## API

```ts
const { copy, isCopied, status, error, reset } = useClipboard(resetAfterMs?)
const { read, text, error } = useClipboardRead()
```

## Features

- `navigator.clipboard` (modern) with `execCommand` fallback
- Status: `"idle"` → `"copied"` → `"idle"` (auto-reset)
- `isCopied` boolean shorthand
- `useClipboardRead` for paste operations
