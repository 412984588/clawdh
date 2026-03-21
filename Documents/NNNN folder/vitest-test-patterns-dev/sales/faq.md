# FAQ — Vitest Test Patterns

**Q: Do I need Vitest already set up?**
Yes. These are test pattern templates, not a Vitest installer. Add Vitest to your project with `npm install -D vitest` first.

**Q: Can I use these with Jest instead of Vitest?**
Most patterns work in Jest with minor changes — replace `vi.fn()` with `jest.fn()`, `vi.spyOn` with `jest.spyOn`, etc. But these are optimized for the Vitest API.

**Q: Do the test files run out of the box?**
Yes — `01-unit-functions` through `05-module-mocking` run without any additional setup. Templates 06+ require additional dependencies (noted in each README).

**Q: What's the difference between Starter and Pro?**
Starter covers pure function testing, class testing, async patterns, timer mocking, and module mocking — the 90% use case. Pro adds component testing (RTL), API/fetch mocking, snapshot testing, typed error patterns, and parameterized tests.

**Q: Are these compatible with React 18/19?**
Yes. The component testing template (06) follows current React Testing Library best practices with `userEvent.setup()` and async patterns.

**Q: Can I use these in a Next.js project?**
Absolutely. These are Vitest patterns — they work in any TypeScript project including Next.js (with Vitest configured for it).

**Q: What Node.js version is required?**
Node.js 18 or higher (for `fetch` being available globally).

**Q: Do I get updates?**
Yes — future template additions will be available as free updates.
