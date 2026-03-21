/**
 * Playwright Network Mocking
 * Demonstrates: page.route, request interception, response mocking, HAR recording/replay
 */
import { test, expect } from "@playwright/test";

// ── Basic route interception ──────────────────────────────────────────────────

test.describe("Network mocking — route", () => {
  test("mocks API response", async ({ page }) => {
    // Intercept any /api/todos request
    await page.route("**/api/todos", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, title: "Mocked Todo 1", completed: false },
          { id: 2, title: "Mocked Todo 2", completed: true },
        ]),
      });
    });

    await page.goto("/todos");
    await expect(page.getByTestId("todo-item")).toHaveCount(2);
    await expect(page.getByText("Mocked Todo 1")).toBeVisible();
  });

  test("simulates API error", async ({ page }) => {
    await page.route("**/api/products**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/products");
    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test("simulates network failure", async ({ page }) => {
    await page.route("**/api/user/profile", (route) => {
      route.abort("failed"); // simulates network failure
    });

    await page.goto("/profile");
    await expect(page.getByTestId("offline-notice")).toBeVisible();
  });

  test("delays slow response", async ({ page }) => {
    await page.route("**/api/reports**", async (route) => {
      await new Promise((r) => setTimeout(r, 2000)); // 2s delay
      await route.continue();
    });

    await page.goto("/reports");
    // Should show loading skeleton during delay
    await expect(page.getByTestId("loading-skeleton")).toBeVisible();
  });
});

// ── Modify request/response ───────────────────────────────────────────────────

test.describe("Request/response modification", () => {
  test("adds auth header to requests", async ({ page }) => {
    await page.route("**/api/**", (route) => {
      const headers = {
        ...route.request().headers(),
        Authorization: "Bearer test-token",
      };
      route.continue({ headers });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("modifies response to add extra fields", async ({ page }) => {
    await page.route("**/api/user/me", async (route) => {
      const response = await route.fetch();
      const json = await response.json() as Record<string, unknown>;
      // Add extra field
      await route.fulfill({
        response,
        json: { ...json, isTestUser: true },
      });
    });

    await page.goto("/profile");
    // UI that reads isTestUser flag should show test badge
    await expect(page.getByTestId("test-user-badge")).toBeVisible();
  });
});

// ── Block third-party trackers ────────────────────────────────────────────────

test.describe("Block external resources", () => {
  test("blocks analytics and ads", async ({ page }) => {
    // Block external tracking scripts to speed up tests and avoid flakiness
    await page.route(
      /analytics|googletagmanager|doubleclick|facebook\.net/,
      (route) => route.abort()
    );

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Page loads without analytics
    await expect(page.getByRole("main")).toBeVisible();
  });
});

// ── Mock GraphQL ──────────────────────────────────────────────────────────────

test.describe("GraphQL mocking", () => {
  test("mocks GraphQL query response", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON() as { query: string };

      if (postData?.query?.includes("GetUser")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              user: { id: "1", name: "Alice", email: "alice@example.com" },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/user/1");
    await expect(page.getByText("Alice")).toBeVisible();
  });
});

// ── Monitor requests ──────────────────────────────────────────────────────────

test.describe("Request monitoring", () => {
  test("captures API calls made during page load", async ({ page }) => {
    const apiCalls: string[] = [];

    page.on("request", (req) => {
      if (req.url().includes("/api/")) {
        apiCalls.push(req.url());
      }
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(apiCalls.length).toBeGreaterThan(0);
    expect(apiCalls.some((url) => url.includes("/api/"))).toBe(true);
  });

  test("verifies correct request payload", async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;

    await page.route("**/api/contact", async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Message").fill("Hello from test");
    await page.getByRole("button", { name: "Send" }).click();

    expect(capturedBody).not.toBeNull();
    expect(capturedBody?.name).toBe("Test User");
    expect(capturedBody?.email).toBe("test@example.com");
  });
});
