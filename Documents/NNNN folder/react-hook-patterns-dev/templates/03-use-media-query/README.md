# useMediaQuery

Reactive CSS media query matching. Includes pre-built breakpoint hooks.

## API

```ts
const matches = useMediaQuery(query)
const isLg = useBreakpoint('lg')
const isMobile = useIsMobile()
const scheme = usePrefersColorScheme()  // "dark" | "light"
const reducedMotion = usePrefersReducedMotion()
```

## Features

- SSR-safe
- Reactive — re-renders when viewport changes
- Tailwind-compatible breakpoints
- `prefers-color-scheme` and `prefers-reduced-motion` helpers
