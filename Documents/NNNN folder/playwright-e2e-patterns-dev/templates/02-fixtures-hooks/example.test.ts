/**
 * Playwright Fixtures & Hooks
 * Demonstrates: test.extend, custom fixtures, beforeEach/afterEach, worker fixtures
 */
import { test as base, expect, Page } from "@playwright/test";

// ── Custom fixture types ───────────────────────────────────────────────────────

interface UserFixture {
  user: { id: string; email: string; token: string };
}

interface AppFixture extends UserFixture {
  authenticatedPage: Page;
  apiBaseUrl: string;
}

// ── Extend base test with custom fixtures ─────────────────────────────────────

export const test = base.extend<AppFixture>({
  // Scope: "test" — created fresh for each test
  apiBaseUrl: async ({}, use) => {
    await use(process.env["API_BASE_URL"] ?? "http://localhost:3000/api");
  },

  user: async ({ request }, use) => {
    // Create test user via API before test
    const response = await request.post("/api/test-users", {
      data: { email: `test-${Date.now()}@example.com`, role: "user" },
    });
    const user = await response.json() as { id: string; email: string; token: string };

    await use(user);

    // Cleanup: delete user after test
    await request.delete(`/api/test-users/${user.id}`);
  },

  authenticatedPage: async ({ page, user }, use) => {
    // Inject auth token into browser storage
    await page.addInitScript((token) => {
      localStorage.setItem("auth_token", token);
    }, user.token);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await use(page);
  },
});

// ── Worker-scoped fixture (shared across tests in a worker) ───────────────────

export const testWithAdmin = base.extend<Record<never, never>, { adminToken: string }>({
  adminToken: [
    async ({ playwright }, use) => {
      // Created once per worker — expensive setup
      const context = await playwright.request.newContext({ baseURL: "http://localhost:3000" });
      const resp = await context.post("/api/auth/login", {
        data: { email: "admin@example.com", password: "adminpass" },
      });
      const { token } = await resp.json() as { token: string };
      await use(token);
      await context.dispose();
    },
    { scope: "worker" },
  ],
});

// ── Tests using custom fixtures ───────────────────────────────────────────────

test.describe("Authenticated user flows", () => {
  test("dashboard loads with user data", async ({ authenticatedPage, user }) => {
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    await expect(authenticatedPage.getByText(user.email)).toBeVisible();
  });

  test("user can navigate to settings", async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole("link", { name: "Settings" }).click();
    await expect(authenticatedPage).toHaveURL(/\/settings/);
  });

  test("user can update profile", async ({ authenticatedPage, user }) => {
    await authenticatedPage.goto("/settings/profile");
    await authenticatedPage.getByLabel("Display Name").fill("New Name");
    await authenticatedPage.getByRole("button", { name: "Save" }).click();
    await expect(authenticatedPage.getByRole("alert")).toContainText("Saved");
  });
});

// ── beforeEach / afterEach hooks ──────────────────────────────────────────────

test.describe("Form validation hooks", () => {
  let formPage: Page;

  test.beforeEach(async ({ page }) => {
    formPage = page;
    await page.goto("/contact");
    await expect(page.getByRole("form")).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: `test-results/${testInfo.title}.png` });
    }
  });

  test("submits valid form", async () => {
    await formPage.getByLabel("Name").fill("Alice");
    await formPage.getByLabel("Email").fill("alice@example.com");
    await formPage.getByLabel("Message").fill("Hello there!");
    await formPage.getByRole("button", { name: "Send" }).click();
    await expect(formPage.getByText("Message sent")).toBeVisible();
  });

  test("shows required field errors", async () => {
    await formPage.getByRole("button", { name: "Send" }).click();
    const errors = formPage.getByRole("alert");
    await expect(errors).toHaveCount(3);
  });
});

// ── Re-use test from fixture ──────────────────────────────────────────────────

test("api base url fixture works", async ({ apiBaseUrl }) => {
  expect(apiBaseUrl).toContain("localhost");
});
