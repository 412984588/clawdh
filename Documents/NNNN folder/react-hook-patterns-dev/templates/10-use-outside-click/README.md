# useOutsideClick

Detect clicks outside a DOM element for closing dropdowns, modals, and popovers.

## API

```ts
const ref = useOutsideClick<T>(callback, { enabled? })
const refs = useOutsideClickMultiple(callback, count, { enabled? })
```

## Features

- Handler ref prevents stale closures without re-registering
- Listens on `mousedown` + `touchstart` (fires before click)
- `enabled` option to conditionally disable
- Multi-element version for popover trigger + panel patterns

## Common use cases

```tsx
// Close dropdown
const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false))
<div ref={ref}>{open && <DropdownMenu />}</div>

// Close only when open
const ref = useOutsideClick(() => setOpen(false), { enabled: open })
```
