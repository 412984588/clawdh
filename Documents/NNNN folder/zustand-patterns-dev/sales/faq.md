# FAQ — Zustand State Management Patterns Pack

**Q: Which version of Zustand is this for?**
Zustand v4 (`zustand@^4`). Install: `npm install zustand immer`.

**Q: Do I need immer?**
Only for the settings store (06). All other patterns use plain Zustand. Install: `npm install immer`.

**Q: Can I use these with React 18 / Next.js App Router?**
Yes. All patterns work with React 18 and Next.js App Router. For SSR, initialise stores in a provider to avoid hydration issues.

**Q: What about Zustand v5?**
These patterns are written for v4. Minor API differences may exist in v5 (check the v5 migration guide).

**Q: Are these compatible with TypeScript strict mode?**
Yes. All patterns are written with strict TypeScript. Some patterns use type assertions (as) where TypeScript cannot infer generic constraints.

**Q: Is Redux DevTools supported?**
Yes — all stores use the `devtools` middleware with named actions for clear DevTools history.

**Q: Is this a subscription?**
No — one-time purchase. Use forever on unlimited projects.
