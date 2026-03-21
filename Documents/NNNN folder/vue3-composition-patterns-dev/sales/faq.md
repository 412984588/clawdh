# FAQ — Vue 3 Composition API Patterns

**Q: Which Vue version is required?**
Vue 3.4 or later. Templates use `<script setup>`, `defineModel()`, and other features introduced in Vue 3.4.

**Q: Do the templates use the Options API?**
No. All templates are Composition API only, using `<script setup>` syntax where applicable.

**Q: Do I need Pinia or Vue Router installed?**
Template 03 (Pinia Store) and Template 04 (Vue Router) include patterns for those libraries. The example.ts files use a mock implementation so they can be reviewed without installing dependencies. The README for each template shows the exact install commands.

**Q: Can I use these in a commercial project?**
Yes. MIT license allows personal and commercial use with no restrictions beyond attribution.

**Q: Are the `.vue` files included?**
The templates are provided as `.ts` files demonstrating the core patterns. They're structured to be easily adapted into `.vue` components — the README for each template shows how to use the code in SFCs.

**Q: What's the difference between Starter and Pro?**
Starter covers the core Composition API patterns (script setup, composables, Pinia, Router, forms). Pro adds advanced patterns: provide/inject, async with Suspense, generic TypeScript components, transitions, and testing.

**Q: Is there a way to run the examples without Vue installed?**
Template 10 (Testing Patterns) includes inline unit tests that run with Node.js directly. Other templates are TypeScript source meant to be used within a Vue project.

**Q: Can I request a refund?**
See `refund-policy.md`. Refunds accepted within 7 days if the templates don't work as described.
