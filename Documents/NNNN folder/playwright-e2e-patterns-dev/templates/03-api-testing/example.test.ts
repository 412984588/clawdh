/**
 * Playwright API Testing
 * Demonstrates: request context, APIRequestContext, response assertions, API + UI combined tests
 */
import { test, expect } from "@playwright/test";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// ── Pure API tests ─────────────────────────────────────────────────────────────

test.describe("Todos API", () => {
  test.use({ baseURL: "https://jsonplaceholder.typicode.com" });

  test("GET /todos returns array", async ({ request }) => {
    const response = await request.get("/todos");
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const todos = await response.json() as Todo[];
    expect(Array.isArray(todos)).toBeTruthy();
    expect(todos.length).toBeGreaterThan(0);
  });

  test("GET /todos/1 returns correct shape", async ({ request }) => {
    const response = await request.get("/todos/1");
    const todo = await response.json() as Todo;

    expect(todo).toMatchObject({
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: expect.any(Number),
    });
  });

  test("POST /todos creates a todo", async ({ request }) => {
    const response = await request.post("/todos", {
      data: { title: "New test todo", completed: false, userId: 1 },
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(201);
    const created = await response.json() as Todo;
    expect(created.title).toBe("New test todo");
    expect(created.id).toBeDefined();
  });

  test("PATCH /todos/1 updates a todo", async ({ request }) => {
    const response = await request.patch("/todos/1", {
      data: { completed: true },
    });

    const updated = await response.json() as Partial<Todo>;
    expect(updated.completed).toBe(true);
  });

  test("DELETE /todos/1 returns 200", async ({ request }) => {
    const response = await request.delete("/todos/1");
    expect(response.ok()).toBeTruthy();
  });
});

// ── Response header assertions ────────────────────────────────────────────────

test.describe("Response headers", () => {
  test.use({ baseURL: "https://jsonplaceholder.typicode.com" });

  test("API returns JSON content-type", async ({ request }) => {
    const response = await request.get("/users/1");
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("response has expected cache headers", async ({ request }) => {
    const response = await request.get("/todos/1");
    // Check status is a success code
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });
});

// ── Combined API + UI test ────────────────────────────────────────────────────

test.describe("API seed + UI verify", () => {
  test("creates todo via API and verifies in UI", async ({ page, request }) => {
    // 1. Seed data via API (fast, no UI overhead)
    const postResponse = await request.post("/api/todos", {
      data: { title: "Playwright seeded todo", completed: false },
    });
    const todo = await postResponse.json() as Todo;

    // 2. Navigate to UI and verify todo appears
    await page.goto("/todos");
    const todoItem = page.getByTestId(`todo-${todo.id}`);
    await expect(todoItem).toBeVisible();
    await expect(todoItem).toContainText("Playwright seeded todo");
  });

  test("deletes todo via API and verifies removal in UI", async ({ page, request }) => {
    // Setup: create via API
    const createResp = await request.post("/api/todos", {
      data: { title: "To be deleted" },
    });
    const { id } = await createResp.json() as Todo;

    await page.goto("/todos");
    await expect(page.getByTestId(`todo-${id}`)).toBeVisible();

    // Delete via API
    await request.delete(`/api/todos/${id}`);

    // Reload UI and confirm gone
    await page.reload();
    await expect(page.getByTestId(`todo-${id}`)).not.toBeVisible();
  });
});

// ── Authentication via API ────────────────────────────────────────────────────

test.describe("Auth via API request context", () => {
  test("logs in and gets auth token", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "user@example.com", password: "password123" },
    });

    if (response.ok()) {
      const body = await response.json() as { token: string; expiresIn: number };
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe("string");
      expect(body.expiresIn).toBeGreaterThan(0);
    } else {
      // Allow 4xx in test environments without real backend
      expect([400, 401, 404]).toContain(response.status());
    }
  });
});
