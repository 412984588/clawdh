/**
 * Playwright Visual Regression Testing
 * Demonstrates: toHaveScreenshot, snapshot comparison, masking dynamic regions, viewports
 */
import { test, expect } from "@playwright/test";

// ── Basic screenshot comparison ───────────────────────────────────────────────

test.describe("Visual regression — homepage", () => {
  test("homepage matches snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // First run: creates snapshot. Subsequent runs: diffs.
    await expect(page).toHaveScreenshot("homepage.png");
  });

  test("homepage hero section matches snapshot", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByTestId("hero-section");
    await expect(hero).toBeVisible();

    await expect(hero).toHaveScreenshot("hero.png", {
      // Allow minor pixel differences (anti-aliasing, etc.)
      threshold: 0.1,
      maxDiffPixels: 100,
    });
  });
});

// ── Masking dynamic content ───────────────────────────────────────────────────

test.describe("Visual regression — masking", () => {
  test("dashboard with masked timestamps", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Mask regions that change between runs (timestamps, ads, etc.)
    await expect(page).toHaveScreenshot("dashboard.png", {
      mask: [
        page.getByTestId("last-updated"),
        page.getByTestId("notification-badge"),
        page.locator(".dynamic-timestamp"),
      ],
    });
  });

  test("product card stable snapshot", async ({ page }) => {
    await page.goto("/products/1");

    // Mask price that may fluctuate
    await expect(page).toHaveScreenshot("product-card.png", {
      mask: [page.getByTestId("price-display")],
      animations: "disabled", // freeze CSS animations
    });
  });
});

// ── Responsive visual testing ──────────────────────────────────────────────────

test.describe("Visual regression — responsive", () => {
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`navigation — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`nav-${vp.name}.png`);
    });
  }
});

// ── Dark mode visual regression ───────────────────────────────────────────────

test.describe("Visual regression — dark mode", () => {
  test("homepage in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage-dark.png");
  });

  test("homepage in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page).toHaveScreenshot("homepage-light.png");
  });
});

// ── Element-level screenshots ──────────────────────────────────────────────────

test.describe("Visual regression — components", () => {
  test("button states snapshot", async ({ page }) => {
    await page.goto("/design-system/buttons");

    const buttonRow = page.getByTestId("button-variants");
    await expect(buttonRow).toHaveScreenshot("button-variants.png");
  });

  test("form in error state", async ({ page }) => {
    await page.goto("/contact");
    // Submit empty form to trigger validation errors
    await page.getByRole("button", { name: "Send" }).click();

    const form = page.getByRole("form");
    await expect(form).toHaveScreenshot("form-errors.png", {
      animations: "disabled",
    });
  });

  test("loading skeleton snapshot", async ({ page }) => {
    // Intercept API to delay response and capture loading state
    await page.route("**/api/products**", async (route) => {
      await new Promise((r) => setTimeout(r, 100));
      await route.continue();
    });

    await page.goto("/products");
    const skeleton = page.getByTestId("loading-skeleton");
    await expect(skeleton).toBeVisible();
    await expect(skeleton).toHaveScreenshot("loading-skeleton.png");
  });
});

// ── Full-page screenshot ───────────────────────────────────────────────────────

test("full page long scroll snapshot", async ({ page }) => {
  await page.goto("/blog");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("blog-full.png", {
    fullPage: true,
    // Clip to specific area if needed:
    // clip: { x: 0, y: 0, width: 1280, height: 720 },
  });
});
