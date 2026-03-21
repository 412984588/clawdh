# useIntersectionObserver

Detect when an element enters or leaves the viewport. Built on the IntersectionObserver API.

## API

```ts
const { ref, isIntersecting, intersectionRatio, entry } = useIntersectionObserver(options)
const [ref, isVisible] = useIsVisible(options)
const ref = useLazyLoad(onVisible, options)
```

## Common use cases

- Lazy-load images: `freezeOnceVisible: true`
- Infinite scroll: `rootMargin: '200px'` to pre-fetch
- Animate on scroll: `useIsVisible`
- Load-once resources: `useLazyLoad`
