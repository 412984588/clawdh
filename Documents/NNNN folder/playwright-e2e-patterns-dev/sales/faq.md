# Playwright E2E Patterns — FAQ

**Q: What Playwright version do these templates target?**
Playwright 1.40+. All patterns use the current API and are tested against Playwright 1.44+.

**Q: Do the templates include playwright.config.ts?**
No — the templates focus on test patterns, not project setup. Use `npm init playwright@latest` to scaffold your project config, then drop these patterns in.

**Q: Is component testing (template 06) production-ready?**
`@playwright/experimental-ct-react` is stable for most use cases but carries an "experimental" label. It works well for testing React components in isolation.

**Q: Can I use these with frameworks other than React?**
Templates 01–05, 07–10 are framework-agnostic. Template 06 uses React for component testing. Vue/Svelte CT variants follow the same API.

**Q: Are visual regression snapshots included?**
Template 04 shows the patterns for capturing and comparing screenshots. You generate your own baseline snapshots on first run.

**Q: Can I use these in client projects?**
Yes. MIT license — personal and commercial use allowed.

**Q: Will these templates be updated for new Playwright versions?**
Yes — buyers receive free updates when templates are revised for breaking Playwright changes.
