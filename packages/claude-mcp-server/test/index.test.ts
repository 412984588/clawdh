import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceHubMCPServer } from "../src/index.js";

describe("VoiceHubMCPServer", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates create_session to the runtime API with auth headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: async () => ({ sessionId: "session-1" }),
    });

    const server = new VoiceHubMCPServer("http://localhost:3000", "secret-key");
    const result = await (server as any).handleToolCall("create_session", {
      userId: "user-1",
      channelId: "channel-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer secret-key",
        },
        body: JSON.stringify({
          userId: "user-1",
          channelId: "channel-1",
        }),
      },
    );
    expect(result).toBe("Session created: session-1");
  });

  it("throws on unknown tools", async () => {
    const server = new VoiceHubMCPServer("http://localhost:3000");

    await expect(
      (server as any).handleToolCall("unknown_tool", {}),
    ).rejects.toThrow("Unknown tool: unknown_tool");
  });
});
