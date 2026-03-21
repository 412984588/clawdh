# usePrevious

Track the previous render's value of any state or prop.

## API

```ts
const prev = usePrevious(value)
const [current, prev] = usePreviousPair(value)
const history = useValueHistory(value, maxLength?)
const justChanged = useJustChanged(value)
```

## Common use cases

- Detect direction of a counter change
- Trigger animations when a value changes
- Diff before/after for API calls
- `useValueHistory` for undo/redo UIs
