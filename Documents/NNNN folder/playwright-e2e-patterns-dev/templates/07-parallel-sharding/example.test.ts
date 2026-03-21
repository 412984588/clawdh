/**
 * Playwright Parallel Execution & Sharding
 * Demonstrates: test.describe.parallel, worker isolation, sharding config, test.slow/skip
 */
import { test, expect } from "@playwright/test";

// ── Parallel test groups ──────────────────────────────────────────────────────

// By default, tests within a describe block run serially.
// Use .parallel() to run all tests in this block concurrently within a worker.
test.describe.parallel("Product pages — parallel", () => {
  const products = [1, 2, 3, 4, 5];

  for (const id of products) {
    test(`product ${id} loads correctly`, async ({ page }) => {
      await page.goto(`/products/${id}`);
      await expect(page.getByRole("heading")).toBeVisible();
      await expect(page.getByTestId("price")).toBeVisible();
    });
  }
});

// ── Worker-level isolation ────────────────────────────────────────────────────
// Each test worker gets its own browser context — no shared state by default.
// Use workerIndex to differentiate workers.

test.describe("Worker isolation", () => {
  test("worker A creates its own data", async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    // Each worker uses a unique identifier to avoid data collisions
    const uniqueEmail = `worker-${workerIndex}-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});

// ── Sharding configuration ────────────────────────────────────────────────────
// Run with: npx playwright test --shard=1/4  (first of 4 shards)
// In CI: run 4 jobs each with a different --shard argument

test.describe("Shard-friendly suite", () => {
  // Large test suite — split across CI shards automatically
  const routes = [
    "/", "/about", "/pricing", "/blog", "/contact",
    "/products", "/features", "/docs", "/changelog", "/status",
  ];

  for (const route of routes) {
    test(`page ${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    });
  }
});

// ── Test annotations ──────────────────────────────────────────────────────────

test.describe("Annotated tests", () => {
  test("fast test", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test.slow("slow integration test", async ({ page }) => {
    // test.slow() triples the default timeout for this test
    await page.goto("/heavy-page");
    await page.waitForSelector("[data-loaded]", { timeout: 30_000 });
    await expect(page.getByTestId("content")).toBeVisible();
  });

  test.skip(
    process.env["CI"] !== "true",
    "only runs in CI"
  );
  test("ci-only test", async ({ page }) => {
    await page.goto("/internal");
    await expect(page).toHaveURL(/\/internal/);
  });

  test("flaky test with retry", async ({ page }, testInfo) => {
    // testInfo.retry tells you which retry this is (0 = first attempt)
    if (testInfo.retry > 0) {
      await page.goto("/slow-resource?fresh=true");
    } else {
      await page.goto("/slow-resource");
    }
    await expect(page.getByTestId("resource")).toBeVisible({ timeout: 10_000 });
  });
});

// ── Grouping by feature for better shard distribution ────────────────────────

test.describe("@feature-checkout", () => {
  test("add to cart", async ({ page }) => {
    await page.goto("/products/1");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    const badge = page.getByTestId("cart-badge");
    await expect(badge).toContainText("1");
  });

  test("cart shows correct total", async ({ page }) => {
    await page.goto("/cart");
    const total = page.getByTestId("cart-total");
    await expect(total).toBeVisible();
  });
});

test.describe("@feature-search", () => {
  test("search returns results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox").fill("widget");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("search-results")).toBeVisible();
  });

  test("search with no results shows empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox").fill("xyzzy-no-results-9999");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });
});

// ── Concurrency control: serial when needed ───────────────────────────────────

test.describe.serial("Database-dependent tests (must run serially)", () => {
  test("setup: creates shared resource", async ({ request }) => {
    const resp = await request.post("/api/shared-resource", {
      data: { name: "test-resource" },
    });
    expect(resp.ok()).toBeTruthy();
  });

  test("uses shared resource", async ({ page }) => {
    await page.goto("/shared-resource");
    await expect(page.getByTestId("resource-name")).toContainText("test-resource");
  });

  test("teardown: deletes shared resource", async ({ request }) => {
    const resp = await request.delete("/api/shared-resource/test-resource");
    expect(resp.ok()).toBeTruthy();
  });
});
