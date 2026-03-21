# Playwright E2E Patterns

10 production-ready Playwright patterns — covering page objects, fixtures, API testing, visual regression, auth flows, component testing, parallel sharding, network mocking, mobile emulation, and CI reporting.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Page Objects | POM pattern, locator encapsulation, reusable actions |
| 02 | Fixtures & Hooks | test.extend, custom fixtures, beforeEach/afterEach, worker scope |
| 03 | API Testing | request context, response assertions, API + UI combined tests |
| 04 | Visual Regression | toHaveScreenshot, masking, viewports, dark mode |
| 05 | Auth Flows | storageState, saved sessions, multi-role testing, OAuth |
| 06 | Component Testing | @playwright/experimental-ct-react, mount, props, events |
| 07 | Parallel & Sharding | test.parallel, shard config, test.slow/skip, serial blocks |
| 08 | Network Mocking | page.route, request interception, GraphQL mocking, HAR |
| 09 | Mobile Emulation | devices, geolocation, permissions, responsive breakpoints |
| 10 | CI Reporting | reporters, attachments, annotations, trace, retry context |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
npm init playwright@latest
npx playwright install
```

```ts
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/My App/);
});
```

## Requirements

- Playwright 1.40+
- TypeScript 5+
- Node.js 18+

## License

MIT — use in personal and commercial projects.
