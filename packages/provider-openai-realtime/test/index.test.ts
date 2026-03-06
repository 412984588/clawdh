import { describe, expect, it } from "vitest";
import { createOpenAIRealtimeProvider } from "../src/index.ts";

describe("provider-openai-realtime", () => {
  it("reports explicit capabilities", () => {
    const provider = createOpenAIRealtimeProvider({
      url: "wss://example.com/realtime",
      apiKey: "test-key",
    });

    expect(provider.id).toBe("openai-realtime");
    expect(provider.getCapabilities().toolCalling).toBe(true);
  });
});
