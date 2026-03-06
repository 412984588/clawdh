import { describe, expect, it } from "vitest";
import { createGeminiLiveProvider } from "../src/index.ts";

describe("provider-gemini-live", () => {
  it("reports explicit capabilities", () => {
    const provider = createGeminiLiveProvider({
      url: "wss://example.com/live",
      apiKey: "test-key",
    });

    expect(provider.id).toBe("gemini-live");
    expect(provider.getCapabilities().semanticVAD).toBe(true);
  });
});
