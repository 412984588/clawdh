# FAQ — React Hook Patterns

**Q: Are these hooks SSR-compatible?**
Yes — hooks that access browser APIs (`localStorage`, `window.matchMedia`, `IntersectionObserver`) include SSR guards (`typeof window === 'undefined'` checks).

**Q: Do these work with Next.js App Router?**
Yes. The hooks are standard React hooks and work in any React environment. For server components (RSC), these hooks must be in client components (`'use client'`).

**Q: Can I use these without TypeScript?**
Yes — rename the files to `.js` and remove type annotations. The logic is identical.

**Q: Why not just use a hook library like `react-use` or `usehooks-ts`?**
You can own your hooks. No dependency to keep updated, no bundle bloat, no waiting for maintainers. These are starting points — adapt them to your exact needs.

**Q: Are the hooks tested?**
They follow production patterns used in real applications. For critical paths, we recommend adding your own unit tests (see `vitest-test-patterns` for test boilerplate).

**Q: Can I modify these hooks for my project?**
Absolutely — that's the point. Copy, modify, use however you need.

**Q: Do I get updates?**
Yes — future hook additions are free updates.
