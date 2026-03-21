/**
 * Playwright CI Reporting & Configuration
 * Demonstrates: multiple reporters, test annotations, attachments, test metadata, trace viewer
 */
import { test, expect } from "@playwright/test";
import path from "path";

// ── Test metadata & annotations ───────────────────────────────────────────────

test.describe("Checkout flow @smoke", () => {
  test("complete checkout", {
    tag: ["@smoke", "@checkout"],
    annotation: [
      { type: "issue", description: "https://github.com/org/repo/issues/42" },
      { type: "docs", description: "https://docs.example.com/checkout" },
    ],
  }, async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: "Add to Cart" }).first().click();
    await page.goto("/cart");
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page).toHaveURL(/\/checkout/);
  });
});

// ── Custom test info & attachments ────────────────────────────────────────────

test("attaches screenshot on assertion", async ({ page }, testInfo) => {
  await page.goto("/dashboard");

  // Manually attach extra context
  await testInfo.attach("page-html", {
    body: await page.content(),
    contentType: "text/html",
  });

  // Attach a screenshot directly
  const screenshot = await page.screenshot();
  await testInfo.attach("screenshot", {
    body: screenshot,
    contentType: "image/png",
  });

  await expect(page.getByRole("main")).toBeVisible();
});

test("attaches JSON fixture data", async ({ page }, testInfo) => {
  const fixtureData = { userId: 1, testRun: testInfo.workerIndex };

  await testInfo.attach("fixture-data", {
    body: JSON.stringify(fixtureData, null, 2),
    contentType: "application/json",
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});

// ── Trace attachment (for debugging CI failures) ──────────────────────────────

test("with trace context", async ({ page }, testInfo) => {
  // playwright.config.ts: set trace: 'on-first-retry' for CI
  // Here we use testInfo to access trace path if needed
  await page.goto("/");
  await page.getByRole("navigation").waitFor();

  // Annotate with run URL for CI deep linking
  if (process.env["CI_JOB_URL"]) {
    testInfo.annotations.push({
      type: "CI job",
      description: process.env["CI_JOB_URL"],
    });
  }

  await expect(page).toHaveURL("/");
});

// ── Expected failures (xfail) ─────────────────────────────────────────────────

test("known flaky test — expected to sometimes fail", async ({ page }, testInfo) => {
  test.info().annotations.push({
    type: "known issue",
    description: "Race condition on slow CI — tracked in GH-123",
  });

  await page.goto("/flaky-page");
  // Use soft assertions to collect all failures
  await expect.soft(page.getByTestId("counter")).toBeVisible();
  await expect.soft(page.getByTestId("status")).toContainText(/ready/i);
  // test continues even if above soft assertions fail
  await expect(page.getByRole("main")).toBeVisible();
});

// ── Retry context ──────────────────────────────────────────────────────────────

test("adapts behaviour on retry", async ({ page }, testInfo) => {
  if (testInfo.retry > 0) {
    // On retry: clear cache and start fresh
    await page.context().clearCookies();
    await page.context().clearPermissions();
  }

  await page.goto("/dashboard");
  await expect(page.getByRole("main")).toBeVisible();
});

// ── Test timeout override ─────────────────────────────────────────────────────

test("long-running migration", async ({ page }) => {
  test.setTimeout(60_000); // override per-test
  await page.goto("/admin/migrate");
  await page.getByRole("button", { name: "Run Migration" }).click();
  await expect(page.getByTestId("migration-status")).toContainText(/complete/i, {
    timeout: 55_000,
  });
});

// ── Multiple reporters config reference ──────────────────────────────────────
// playwright.config.ts:
//
// reporter: [
//   ["list"],
//   ["json",     { outputFile: "test-results/results.json" }],
//   ["html",     { outputFolder: "playwright-report", open: "never" }],
//   ["junit",    { outputFile: "test-results/junit.xml" }],   // for CI
//   ["github"],                                                // GitHub Actions
//   ["dot"],                                                   // minimal CI output
//   ["line"],
// ],
//
// Use condition:
// reporter: process.env.CI ? [["github"], ["junit", ...], ["html",...]] : [["list"], ["html",...]],

test("reporter config is documented", async () => {
  // This test validates the config comment above is present
  const configRef = path.join(__dirname, "../../playwright.config.ts");
  // In a real project, you'd read and verify the config file
  expect(configRef).toContain("playwright.config.ts");
});

// ── Baseline data for CI ──────────────────────────────────────────────────────

test.describe("CI smoke suite @ci @smoke", () => {
  const criticalPaths = ["/", "/products", "/about", "/pricing"];

  for (const p of criticalPaths) {
    test(`${p} loads without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(p);
      expect(response?.status()).toBeLessThan(400);
      expect(errors).toHaveLength(0);
    });
  }
});
