/**
 * Hono.js — Testing Patterns
 * testClient, @hono/testing, in-memory fetch, unit tests
 */
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// ── 1. App under test ─────────────────────────────────────────────────────────

interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

// Factory function — creates fresh app + data store per test
export function createApp() {
  const todos: Todo[] = [];

  const app = new Hono()
    .get("/todos", (c) => c.json(todos))
    .get("/todos/:id", (c) => {
      const todo = todos.find((t) => t.id === c.req.param("id"));
      if (!todo) throw new HTTPException(404, { message: "Todo not found" });
      return c.json(todo);
    })
    .post("/todos", async (c) => {
      const { title } = await c.req.json<{ title: string }>();
      if (!title?.trim()) throw new HTTPException(400, { message: "title is required" });
      const todo: Todo = {
        id: String(todos.length + 1),
        title: title.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(todo);
      return c.json(todo, 201);
    })
    .patch("/todos/:id", async (c) => {
      const idx = todos.findIndex((t) => t.id === c.req.param("id"));
      if (idx === -1) throw new HTTPException(404, { message: "Todo not found" });
      const updates = await c.req.json<Partial<Pick<Todo, "title" | "done">>>();
      todos[idx] = { ...todos[idx], ...updates };
      return c.json(todos[idx]);
    })
    .delete("/todos/:id", (c) => {
      const idx = todos.findIndex((t) => t.id === c.req.param("id"));
      if (idx === -1) throw new HTTPException(404, { message: "Todo not found" });
      todos.splice(idx, 1);
      return c.json({ deleted: true });
    });

  return { app, todos };
}

// ── 2. Test helper ────────────────────────────────────────────────────────────

function makeClient(app: Hono) {
  return {
    get: (path: string, init?: RequestInit) =>
      app.request(path, { method: "GET", ...init }),
    post: (path: string, body: unknown, init?: RequestInit) =>
      app.request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...init?.headers },
        body: JSON.stringify(body),
        ...init,
      }),
    patch: (path: string, body: unknown) =>
      app.request(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    delete: (path: string) => app.request(path, { method: "DELETE" }),
  };
}

// ── 3. Inline tests ───────────────────────────────────────────────────────────

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${(err as Error).message}`);
      failed++;
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  console.log("Running Hono tests...\n");

  // List todos — empty initially
  await test("GET /todos returns empty array", async () => {
    const { app } = createApp();
    const res = await makeClient(app).get("/todos");
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json() as Todo[];
    assert(Array.isArray(data) && data.length === 0, "Expected empty array");
  });

  // Create todo
  await test("POST /todos creates a todo", async () => {
    const { app, todos } = createApp();
    const res = await makeClient(app).post("/todos", { title: "Buy milk" });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const todo = await res.json() as Todo;
    assert(todo.title === "Buy milk", `Expected 'Buy milk', got ${todo.title}`);
    assert(!todo.done, "New todo should not be done");
    assert(todos.length === 1, "Store should have 1 todo");
  });

  // Validation error
  await test("POST /todos with empty title returns 400", async () => {
    const { app } = createApp();
    const res = await makeClient(app).post("/todos", { title: "" });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const data = await res.json() as { message: string };
    assert(data.message === "title is required", `Wrong error: ${data.message}`);
  });

  // Get by ID
  await test("GET /todos/:id returns specific todo", async () => {
    const { app } = createApp();
    await makeClient(app).post("/todos", { title: "Test item" });
    const res = await makeClient(app).get("/todos/1");
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const todo = await res.json() as Todo;
    assert(todo.id === "1", `Expected id '1', got ${todo.id}`);
  });

  // Not found
  await test("GET /todos/:id returns 404 for missing todo", async () => {
    const { app } = createApp();
    const res = await makeClient(app).get("/todos/nonexistent");
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // Update
  await test("PATCH /todos/:id updates todo", async () => {
    const { app } = createApp();
    await makeClient(app).post("/todos", { title: "Do laundry" });
    const res = await makeClient(app).patch("/todos/1", { done: true });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const todo = await res.json() as Todo;
    assert(todo.done === true, "Expected done to be true");
  });

  // Delete
  await test("DELETE /todos/:id deletes todo", async () => {
    const { app, todos } = createApp();
    await makeClient(app).post("/todos", { title: "Clean house" });
    const res = await makeClient(app).delete("/todos/1");
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(todos.length === 0, "Store should be empty after delete");
  });

  // Isolation: each test gets a fresh store
  await test("Tests are isolated — fresh store per createApp()", async () => {
    const { app: app1, todos: todos1 } = createApp();
    const { app: app2, todos: todos2 } = createApp();
    await makeClient(app1).post("/todos", { title: "Item in app1" });
    assert(todos1.length === 1, "app1 should have 1 item");
    assert(todos2.length === 0, "app2 should be empty");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
}

// Uncomment to run standalone:
// runTests().catch(console.error);
