import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── API client under test ────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async getUser(id: number): Promise<User> {
    const res = await fetch(`${this.baseUrl}/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<User>;
  }

  async createPost(data: Omit<Post, "id">): Promise<Post> {
    const res = await fetch(`${this.baseUrl}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<Post>;
  }

  async deletePost(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/posts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
}

// ─── Helper: build a mock Response ───────────────────────────────────────────

function mockResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ApiClient", () => {
  let client: ApiClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    client = new ApiClient("https://api.example.com");
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUser", () => {
    it("returns parsed user on success", async () => {
      const user: User = { id: 1, name: "Alice", email: "alice@example.com" };
      fetchSpy.mockResolvedValue(mockResponse(user));

      const result = await client.getUser(1);
      expect(result).toEqual(user);
    });

    it("calls correct URL", async () => {
      fetchSpy.mockResolvedValue(mockResponse({ id: 1, name: "A", email: "a@b.com" }));

      await client.getUser(42);
      expect(fetchSpy).toHaveBeenCalledWith("https://api.example.com/users/42");
    });

    it("throws on non-ok response", async () => {
      fetchSpy.mockResolvedValue(mockResponse({}, 404));

      await expect(client.getUser(999)).rejects.toThrow("HTTP 404");
    });

    it("throws on server error", async () => {
      fetchSpy.mockResolvedValue(mockResponse({ message: "Internal Server Error" }, 500));

      await expect(client.getUser(1)).rejects.toThrow("HTTP 500");
    });
  });

  describe("createPost", () => {
    it("sends POST with JSON body", async () => {
      const newPost = { title: "Hello", body: "World", userId: 1 };
      const created: Post = { id: 101, ...newPost };
      fetchSpy.mockResolvedValue(mockResponse(created, 201));

      const result = await client.createPost(newPost);
      expect(result.id).toBe(101);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/posts",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPost),
        })
      );
    });
  });

  describe("deletePost", () => {
    it("sends DELETE request", async () => {
      fetchSpy.mockResolvedValue(mockResponse(null, 204));

      await client.deletePost(5);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/posts/5",
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws on failure", async () => {
      fetchSpy.mockResolvedValue(mockResponse({}, 404));

      await expect(client.deletePost(999)).rejects.toThrow("HTTP 404");
    });
  });

  describe("network error simulation", () => {
    it("propagates network-level errors", async () => {
      fetchSpy.mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(client.getUser(1)).rejects.toThrow("Failed to fetch");
    });
  });
});
