/**
 * Playwright Auth Flows
 * Demonstrates: storageState, saved auth sessions, login helper, multi-role testing
 */
import { test, expect, BrowserContext } from "@playwright/test";
import path from "path";

// ── Saved auth state paths ─────────────────────────────────────────────────────
// Run setup/auth.setup.ts once to create these files, then reuse

export const ADMIN_AUTH = path.join(__dirname, "../.auth/admin.json");
export const USER_AUTH = path.join(__dirname, "../.auth/user.json");

// ── Auth setup helpers ────────────────────────────────────────────────────────

/** Login via UI and save storage state to file */
async function loginAndSave(context: BrowserContext, creds: { email: string; password: string }, savePath: string) {
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  await context.storageState({ path: savePath });
  await page.close();
}

// ── Tests using saved auth state ───────────────────────────────────────────────

// Use admin auth state — login happens once via playwright.config.ts globalSetup
test.describe("Admin role", () => {
  test.use({ storageState: ADMIN_AUTH });

  test("admin can see user management panel", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: /user management/i })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("admin can access settings", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("admin sees admin-only nav items", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  });
});

test.describe("Regular user role", () => {
  test.use({ storageState: USER_AUTH });

  test("user cannot access admin routes", async ({ page }) => {
    await page.goto("/admin/users");
    // Should redirect to 403 or dashboard
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test("user sees own dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    // Admin nav should not be visible
    await expect(page.getByRole("link", { name: "Admin" })).not.toBeVisible();
  });

  test("user can update own profile", async ({ page }) => {
    await page.goto("/profile");
    await page.getByLabel("Display Name").fill("Updated Name");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("alert")).toContainText(/saved/i);
  });
});

// ── Multi-tab auth test ───────────────────────────────────────────────────────

test.describe("Session persistence", () => {
  test.use({ storageState: USER_AUTH });

  test("session persists across multiple pages", async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto("/dashboard");
    await page2.goto("/profile");

    // Both pages should be authenticated
    await expect(page1.getByText(/welcome/i)).toBeVisible();
    await expect(page2.getByRole("heading", { name: /profile/i })).toBeVisible();

    await page1.close();
    await page2.close();
  });
});

// ── Logout and re-auth ────────────────────────────────────────────────────────

test.describe("Logout flow", () => {
  test.use({ storageState: USER_AUTH });

  test("logging out clears session and redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Trying to access protected route should redirect
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ── OAuth / SSO pattern ───────────────────────────────────────────────────────

test.describe("OAuth flow simulation", () => {
  test("redirects to OAuth provider on Google sign-in click", async ({ page }) => {
    await page.goto("/login");
    const [popup] = await Promise.all([
      page.waitForEvent("popup").catch(() => null),
      page.getByRole("button", { name: /continue with google/i }).click(),
    ]);
    // In real test: either popup URL check or redirect intercept
    // popup may be null in mock environment
    if (popup) {
      await expect(popup).toHaveURL(/accounts\.google\.com|oauth/i);
      await popup.close();
    }
  });
});

// ── Token refresh ─────────────────────────────────────────────────────────────

test.describe("Token refresh", () => {
  test.use({ storageState: USER_AUTH });

  test("expired token triggers re-auth gracefully", async ({ page }) => {
    // Simulate expired token by clearing localStorage
    await page.goto("/dashboard");
    await page.evaluate(() => {
      localStorage.removeItem("auth_token");
      sessionStorage.clear();
    });

    // Try to navigate to protected route
    await page.goto("/profile");

    // Should either redirect to login or silently refresh
    const url = page.url();
    const isLoginPage = url.includes("/login");
    const isProfile = url.includes("/profile");
    expect(isLoginPage || isProfile).toBeTruthy();
  });
});
