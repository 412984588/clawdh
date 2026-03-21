/**
 * Playwright Page Object Model
 * Demonstrates: Page Object classes, locator encapsulation, reusable actions
 */
import { test, expect, Page, Locator } from "@playwright/test";

// ── Page Objects ──────────────────────────────────────────────────────────────

class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}

class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navLinks: Locator;
  readonly logoutButton: Locator;
  readonly userAvatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navLinks = page.getByRole("navigation").getByRole("link");
    this.logoutButton = page.getByRole("button", { name: /logout/i });
    this.userAvatar = page.getByTestId("user-avatar");
  }

  async waitForLoad() {
    await this.page.waitForURL("**/dashboard");
    await expect(this.heading).toBeVisible();
  }

  async getNavLinkCount() {
    return this.navLinks.count();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL("**/login");
  }
}

class TodoPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get input() { return this.page.getByPlaceholder("What needs to be done?"); }
  get items() { return this.page.getByTestId("todo-item"); }
  get activeFilter() { return this.page.getByRole("link", { name: "Active" }); }
  get completedFilter() { return this.page.getByRole("link", { name: "Completed" }); }

  async goto() { await this.page.goto("/todos"); }

  async addTodo(text: string) {
    await this.input.fill(text);
    await this.input.press("Enter");
  }

  async toggleTodo(index: number) {
    await this.items.nth(index).getByRole("checkbox").click();
  }

  async deleteTodo(index: number) {
    // Hover to reveal delete button
    await this.items.nth(index).hover();
    await this.items.nth(index).getByRole("button", { name: /delete/i }).click();
  }

  async expectItemCount(n: number) {
    await expect(this.items).toHaveCount(n);
  }

  async expectItemText(index: number, text: string) {
    await expect(this.items.nth(index)).toContainText(text);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("LoginPage POM", () => {
  test("shows error on invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("bad@example.com", "wrongpassword");
    await loginPage.expectError("Invalid credentials");
  });

  test("redirects to dashboard on successful login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await loginPage.goto();
    await loginPage.login("user@example.com", "correctpassword");
    await dashboard.waitForLoad();
    await expect(dashboard.heading).toBeVisible();
  });
});

test.describe("TodoPage POM", () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test("adds multiple todos", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo("Buy groceries");
    await todoPage.addTodo("Walk the dog");
    await todoPage.addTodo("Write tests");
    await todoPage.expectItemCount(3);
  });

  test("toggles a todo as complete", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo("Complete me");
    await todoPage.toggleTodo(0);
    const checkbox = todoPage.items.first().getByRole("checkbox");
    await expect(checkbox).toBeChecked();
  });

  test("deletes a todo", async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo("Delete me");
    await todoPage.addTodo("Keep me");
    await todoPage.deleteTodo(0);
    await todoPage.expectItemCount(1);
    await todoPage.expectItemText(0, "Keep me");
  });
});
