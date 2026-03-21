import { describe, it, expect } from "vitest";

// ─── Async functions under test ───────────────────────────────────────────────

async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  if (id <= 0) throw new Error("Invalid user ID");
  // Simulates network latency
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { id, name: `User ${id}` };
}

async function fetchWithRetry(
  fn: () => Promise<string>,
  retries: number
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
  throw new Error("unreachable");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function raceWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("fetchUser", () => {
  it("resolves with user data for valid id", async () => {
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: "User 1" });
  });

  it("resolves with correct id", async () => {
    const user = await fetchUser(42);
    expect(user.id).toBe(42);
  });

  it("rejects with error for invalid id", async () => {
    await expect(fetchUser(0)).rejects.toThrow("Invalid user ID");
    await expect(fetchUser(-1)).rejects.toThrow("Invalid user ID");
  });
});

describe("fetchWithRetry", () => {
  it("returns value on first success", async () => {
    const fn = async () => "ok";
    const result = await fetchWithRetry(fn, 3);
    expect(result).toBe("ok");
  });

  it("retries on failure and succeeds", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls < 3) throw new Error("temporary error");
      return "success after retries";
    };
    const result = await fetchWithRetry(fn, 3);
    expect(result).toBe("success after retries");
    expect(calls).toBe(3);
  });

  it("throws after exhausting retries", async () => {
    const fn = async () => {
      throw new Error("always fails");
    };
    await expect(fetchWithRetry(fn, 2)).rejects.toThrow("always fails");
  });
});

describe("raceWithTimeout", () => {
  it("resolves when promise finishes before timeout", async () => {
    const fast = Promise.resolve("fast result");
    const result = await raceWithTimeout(fast, 1000);
    expect(result).toBe("fast result");
  });

  it("rejects when promise exceeds timeout", async () => {
    const slow = delay(500).then(() => "too late");
    await expect(raceWithTimeout(slow, 1)).rejects.toThrow("Timeout");
  });
});

describe("Promise.allSettled pattern", () => {
  it("handles mixed success and failure", async () => {
    const results = await Promise.allSettled([
      Promise.resolve("a"),
      Promise.reject(new Error("boom")),
      Promise.resolve("c"),
    ]);

    expect(results[0]).toMatchObject({ status: "fulfilled", value: "a" });
    expect(results[1]).toMatchObject({ status: "rejected" });
    expect(results[2]).toMatchObject({ status: "fulfilled", value: "c" });
  });
});
