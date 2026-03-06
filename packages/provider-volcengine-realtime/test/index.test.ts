import { describe, expect, it } from "vitest";
import { createVolcengineRealtimeProvider } from "../src/index.ts";

describe("provider-volcengine-realtime", () => {
  it("reports explicit capabilities", () => {
    const provider = createVolcengineRealtimeProvider({
      url: "wss://example.com/volcengine",
      appId: "app",
      accessToken: "token",
    });

    expect(provider.id).toBe("volcengine-realtime");
    expect(provider.getCapabilities().toolCalling).toBe(false);
  });
});
