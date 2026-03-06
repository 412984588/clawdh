import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceHubMCPServer } from "../src/index.js";

describe("VoiceHubMCPServer", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("creates sessions against the configured runtime with authorization", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessionId: "session-123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const server = new VoiceHubMCPServer("http://runtime.local", "api-key");
    const result = await (
      server as unknown as {
        handleToolCall: (
          name: string,
          args: Record<string, unknown>,
        ) => Promise<string>;
      }
    ).handleToolCall("create_session", {
      userId: "user-1",
      channelId: "channel-1",
    });

    expect(result).toBe("Session created: session-123");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://runtime.local/api/sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer api-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("returns serialized session lists", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ sessions: [{ sessionId: "s-1" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const server = new VoiceHubMCPServer("http://runtime.local");
    const result = await (
      server as unknown as {
        handleToolCall: (
          name: string,
          args: Record<string, unknown>,
        ) => Promise<string>;
      }
    ).handleToolCall("list_sessions", {});

    expect(result).toContain('"sessionId": "s-1"');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://runtime.local/api/sessions",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
