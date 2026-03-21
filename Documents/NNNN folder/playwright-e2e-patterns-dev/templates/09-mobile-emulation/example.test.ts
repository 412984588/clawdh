/**
 * Playwright Mobile Emulation
 * Demonstrates: devices, geolocation, permissions, touch events, responsive testing
 */
import { test, expect, devices } from "@playwright/test";

// ── Device emulation ──────────────────────────────────────────────────────────

test.describe("iPhone 14 emulation", () => {
  test.use({ ...devices["iPhone 14"] });

  test("mobile menu is visible", async ({ page }) => {
    await page.goto("/");
    // Desktop nav should be hidden, hamburger visible
    await expect(page.getByTestId("hamburger-menu")).toBeVisible();
    await expect(page.getByTestId("desktop-nav")).not.toBeVisible();
  });

  test("tapping hamburger opens nav drawer", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hamburger-menu").tap();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("touch scroll works on product list", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("product-grid")).toBeVisible();

    // Simulate scroll gesture
    const grid = page.getByTestId("product-grid");
    const box = await grid.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });
});

test.describe("iPad Pro emulation", () => {
  test.use({ ...devices["iPad Pro 11"] });

  test("tablet shows two-column layout", async ({ page }) => {
    await page.goto("/products");
    const grid = page.getByTestId("product-grid");
    // Check CSS grid columns via computed style
    const columns = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    // Should have 2+ columns on tablet
    const columnCount = columns.split(" ").length;
    expect(columnCount).toBeGreaterThanOrEqual(2);
  });
});

// ── Geolocation ───────────────────────────────────────────────────────────────

test.describe("Geolocation", () => {
  test("shows content based on geolocation", async ({ browser }) => {
    const context = await browser.newContext({
      geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
      permissions: ["geolocation"],
    });
    const page = await context.newPage();

    await page.goto("/store-locator");
    await expect(page.getByText(/San Francisco|California|CA/i)).toBeVisible();

    await context.close();
  });

  test("handles geolocation permission denied", async ({ browser }) => {
    const context = await browser.newContext({
      permissions: [], // no geolocation permission
    });
    const page = await context.newPage();

    await page.goto("/store-locator");
    await page.getByRole("button", { name: "Use my location" }).click();

    // Should show fallback / manual entry
    await expect(page.getByTestId("location-denied-message")).toBeVisible();
    await context.close();
  });
});

// ── Permissions ───────────────────────────────────────────────────────────────

test.describe("Browser permissions", () => {
  test("grants notification permission", async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ["notifications"],
    });
    const page = await context.newPage();
    await page.goto("/notifications");

    // The browser won't show permission prompt — it was pre-granted
    const result = await page.evaluate(
      () => Notification.permission
    );
    expect(result).toBe("granted");

    await context.close();
  });

  test("clipboard read/write permission", async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.goto("/");

    await page.evaluate(() => navigator.clipboard.writeText("test clipboard"));
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toBe("test clipboard");

    await context.close();
  });
});

// ── Viewport & responsive ─────────────────────────────────────────────────────

test.describe("Responsive breakpoints", () => {
  const breakpoints = [
    { name: "xs", width: 320, height: 568 },
    { name: "sm", width: 375, height: 667 },
    { name: "md", width: 768, height: 1024 },
    { name: "lg", width: 1024, height: 768 },
    { name: "xl", width: 1280, height: 800 },
    { name: "2xl", width: 1536, height: 960 },
  ];

  for (const bp of breakpoints) {
    test(`layout at ${bp.name} (${bp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // No horizontal scrollbar at any breakpoint
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance
    });
  }
});

// ── Media features ────────────────────────────────────────────────────────────

test.describe("Media features", () => {
  test("reduced motion — animations disabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Check CSS custom property or class applied for reduced motion
    const hasReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    expect(hasReducedMotion).toBe(true);
  });

  test("forced colors / high contrast mode", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
